import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';
import { adminApi } from '../../lib/adminApi';

export default function TransactionManagement() {
  const { user: currentUser } = useAuthStore();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');

  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [tempRate, setTempRate] = useState<string>('10');
  const [savingRate, setSavingRate] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchTransactions();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const config = await adminApi.configuracoes.list();
      const rateVal = config?.comissao_taxa || config?.commission_rate;
      if (rateVal) {
        const parsed = parseFloat(rateVal);
        if (!isNaN(parsed)) {
          setCommissionRate(parsed);
          setTempRate(parsed.toString());
        }
      }
    } catch (err) {
      console.error('Erro ao buscar taxa de comissão:', err);
    }
  };

  const handleSaveCommissionRate = async () => {
    const parsed = parseFloat(tempRate);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert('Por favor, insira uma taxa válida entre 0 e 100');
      return;
    }
    try {
      setSavingRate(true);
      await adminApi.configuracoes.update('comissao_taxa', parsed.toString());
      setCommissionRate(parsed);
      alert('Taxa de serviço atualizada com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar taxa');
    } finally {
      setSavingRate(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          payment_status,
          fulfillment_status,
          created_at,
          buyer:profiles!transactions_buyer_id_fkey(email, full_name, rating),
          seller:profiles!transactions_seller_id_fkey(email, full_name, rating),
          part:parts!transactions_part_id_fkey(title, description, price)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statusFilter === 'all' && fulfillmentFilter === 'all') {
      setFilteredTransactions(transactions);
      return;
    }
    
    const filtered = transactions.filter(t => {
      const statusMatch = statusFilter === 'all' || t.payment_status === statusFilter;
      const fulfillmentMatch = fulfillmentFilter === 'all' || t.fulfillment_status === fulfillmentFilter;
      return statusMatch && fulfillmentMatch;
    });
    setFilteredTransactions(filtered);
  }, [statusFilter, fulfillmentFilter, transactions]);

  const updateTransactionStatus = async (transactionId: string, status: string, type: 'payment' | 'fulfillment') => {
    try {
      const updateData = type === 'payment' 
        ? { payment_status: status } 
        : { fulfillment_status: status };
        
      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId);
      
      if (error) throw error;
      
      const updateList = (prev: any[]) =>
        prev.map(t => 
          t.id === transactionId 
            ? {...t, [type === 'payment' ? 'payment_status' : 'fulfillment_status']: status} 
            : t
        );
      setTransactions(updateList);
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        setSelectedTransaction(prev => prev ? { ...prev, [type === 'payment' ? 'payment_status' : 'fulfillment_status']: status } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">{error}</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
          >
            {t('Tentar novamente')}
          </button>
        </div>
      </div>
    );
  }

  // Cálculos do Ledger Financeiro
  const aReceberVal = filteredTransactions
    .filter(t => t.payment_status === 'pending' || t.payment_status === 'processing')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const retidoVal = filteredTransactions
    .filter(t => t.payment_status === 'escrow' || (t.payment_status === 'paid' && t.fulfillment_status !== 'delivered' && t.fulfillment_status !== 'completed'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const pagosVal = filteredTransactions
    .filter(t => t.payment_status === 'paid' && (t.fulfillment_status === 'delivered' || t.fulfillment_status === 'completed'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * (1 - commissionRate / 100), 0);

  const lucroVal = filteredTransactions
    .filter(t => t.payment_status === 'paid' || t.payment_status === 'escrow')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * (commissionRate / 100), 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border pb-4 mb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-text">
              {t('Gerenciamento de Transações')}
            </h1>
            <p className="text-sm text-text-secondary mt-1">{t('Fluxo financeiro e controle de saídas/custódia')}</p>
          </div>
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-2">
            <span className="text-text text-sm font-medium">{t('Taxa de Serviço:')}</span>
            <input
              type="number"
              value={tempRate}
              onChange={(e) => setTempRate(e.target.value)}
              className="bg-surface border border-border rounded px-2 py-1 text-text text-sm w-16 text-center focus:outline-none focus:border-primary"
              min="0"
              max="100"
            />
            <span className="text-text-secondary text-sm">%</span>
            <button
              onClick={handleSaveCommissionRate}
              disabled={savingRate}
              className="h-8 px-3 bg-text text-background rounded hover:bg-text-secondary text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              {savingRate ? t('Salvando...') : t('Salvar')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary text-sm">{t('Status do pagamento:')}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1 text-text text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">{t('Todos')}</option>
              <option value="pending">{t('Pendente')}</option>
              <option value="processing">{t('Processando')}</option>
              <option value="escrow">{t('Em custódia')}</option>
              <option value="paid">{t('Pago')}</option>
              <option value="failed">{t('Falhou')}</option>
              <option value="refunded">{t('Reembolsado')}</option>
              <option value="cancelled">{t('Cancelado')}</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary text-sm">{t('Status entrega:')}</span>
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1 text-text text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">{t('Todos')}</option>
              <option value="pending">{t('Pendente')}</option>
              <option value="packed">{t('Embalado')}</option>
              <option value="shipped">{t('Enviado')}</option>
              <option value="delivered">{t('Entregue')}</option>
              <option value="completed">{t('Concluído')}</option>
              <option value="disputed">{t('Em disputa')}</option>
              <option value="returned">{t('Devolvido')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{t('A Receber (Comprador)')}</p>
          <p className="text-2xl font-bold text-text mt-2">¥ {aReceberVal.toLocaleString('ja-JP')}</p>
          <p className="text-[10px] text-text-secondary mt-1">{t('Transações pendentes/processando')}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{t('Valores Retidos (Custódia)')}</p>
          <p className="text-2xl font-bold text-text mt-2">¥ {retidoVal.toLocaleString('ja-JP')}</p>
          <p className="text-[10px] text-text-secondary mt-1">{t('Aguardando confirmação de entrega')}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{t('Valores Pagos (Vendedor)')}</p>
          <p className="text-2xl font-bold text-text mt-2">¥ {pagosVal.toLocaleString('ja-JP')}</p>
          <p className="text-[10px] text-text-secondary mt-1">{(100 - commissionRate)}% {t('de repasse líquido liberado')}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{t('Lucro da Plataforma')}</p>
          <p className="text-2xl font-bold text-text mt-2">¥ {lucroVal.toLocaleString('ja-JP')}</p>
          <p className="text-[10px] text-text-secondary mt-1">{commissionRate}% {t('de taxa de serviço cobrada')}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Peça')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Comprador')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Vendedor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Valor Total')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Taxa de Serviço')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Repasse Líquido')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Status Pagamento')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Status Entrega')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Data')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('Ações')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-text-secondary">
                    {t('Nenhuma transação encontrada')}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const buyer = t.buyer;
                  const seller = t.seller;
                  const part = t.part;
                  return (
                    <tr key={t.id} className="bg-white hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                        {part?.title || 'Peça removida'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {buyer?.full_name || buyer?.email || 'Usuário desconhecido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {seller?.full_name || seller?.email || 'Usuário desconhecido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                        ¥ {parseFloat(t.amount || 0).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        ¥ {(parseFloat(t.amount || 0) * (commissionRate / 100)).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        ¥ {(parseFloat(t.amount || 0) * (1 - commissionRate / 100)).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={t.payment_status}
                          onChange={(e) => updateTransactionStatus(t.id, e.target.value, 'payment')}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-text text-sm focus:outline-none focus:border-primary"
                        >
                          <option value="pending">{t('Pendente')}</option>
                          <option value="processing">{t('Processando')}</option>
                          <option value="escrow">{t('Em custódia')}</option>
                          <option value="paid">{t('Pago')}</option>
                          <option value="failed">{t('Falhou')}</option>
                          <option value="refunded">{t('Reembolsado')}</option>
                          <option value="cancelled">{t('Cancelado')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={t.fulfillment_status}
                          onChange={(e) => updateTransactionStatus(t.id, e.target.value, 'fulfillment')}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-text text-sm focus:outline-none focus:border-primary"
                        >
                          <option value="pending">{t('Pendente')}</option>
                          <option value="packed">{t('Embalado')}</option>
                          <option value="shipped">{t('Enviado')}</option>
                          <option value="delivered">{t('Entregue')}</option>
                          <option value="completed">{t('Concluído')}</option>
                          <option value="disputed">{t('Em disputa')}</option>
                          <option value="returned">{t('Devolvido')}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => setSelectedTransaction(t)}
                          className="text-primary hover:text-primary-dark font-medium"
                        >
                          {t('Detalhes')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (() => {
        const buyer = selectedTransaction.buyer;
        const seller = selectedTransaction.seller;
        const part = selectedTransaction.part;
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
              <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-text">{t('Detalhes da Transação')}</h2>
                <button 
                  onClick={() => setSelectedTransaction(null)} 
                  className="text-text-secondary hover:text-text text-xl font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-text-secondary block">{t('ID da Transação')}</span>
                    <span className="text-xs font-mono text-text break-all">{selectedTransaction.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">{t('Data')}</span>
                    <span className="text-sm font-medium text-text">
                      {new Date(selectedTransaction.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4 space-y-3 bg-background">
                  <h3 className="text-sm font-bold text-text">{t('Peça/Produto')}</h3>
                  <div>
                    <p className="text-sm font-medium text-text">{part?.title || 'Peça removida'}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{part?.description || 'Sem descrição'}</p>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-text-secondary">
                      <span>{t('Valor Pago pelo Comprador:')}</span>
                      <span className="font-semibold text-text">¥ {parseFloat(selectedTransaction.amount || 0).toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>{t('Taxa de Intermediação')} ({commissionRate}%):</span>
                      <span className="font-semibold text-text">¥ {(parseFloat(selectedTransaction.amount || 0) * (commissionRate / 100)).toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-border pt-1 font-semibold text-text">
                      <span>{t('Saldo Líquido Vendedor')} ({100 - commissionRate}%):</span>
                      <span>¥ {(parseFloat(selectedTransaction.amount || 0) * (1 - commissionRate / 100)).toLocaleString('ja-JP')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-3">
                    <span className="text-xs text-text-secondary block">{t('Comprador')}</span>
                    <span className="text-sm font-medium text-text block mt-1">{buyer?.full_name || '—'}</span>
                    <span className="text-xs text-text-secondary block break-all">{buyer?.email || '—'}</span>
                  </div>
                  <div className="border border-border rounded-lg p-3">
                    <span className="text-xs text-text-secondary block">{t('Vendedor')}</span>
                    <span className="text-sm font-medium text-text block mt-1">{seller?.full_name || '—'}</span>
                    <span className="text-xs text-text-secondary block break-all">{seller?.email || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">{t('Status do Pagamento')}</label>
                    <select
                      value={selectedTransaction.payment_status}
                      onChange={(e) => updateTransactionStatus(selectedTransaction.id, e.target.value, 'payment')}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="pending">{t('Pendente')}</option>
                      <option value="processing">{t('Processando')}</option>
                      <option value="escrow">{t('Em custódia')}</option>
                      <option value="paid">{t('Pago')}</option>
                      <option value="failed">{t('Falhou')}</option>
                      <option value="refunded">{t('Reembolsado')}</option>
                      <option value="cancelled">{t('Cancelado')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">{t('Status de Envio')}</label>
                    <select
                      value={selectedTransaction.fulfillment_status}
                      onChange={(e) => updateTransactionStatus(selectedTransaction.id, e.target.value, 'fulfillment')}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="pending">{t('Pendente')}</option>
                      <option value="packed">{t('Embalado')}</option>
                      <option value="shipped">{t('Enviado')}</option>
                      <option value="delivered">{t('Entregue')}</option>
                      <option value="completed">{t('Concluído')}</option>
                      <option value="disputed">{t('Em disputa')}</option>
                      <option value="returned">{t('Devolvido')}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-border flex justify-end">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  {t('Fechar')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}