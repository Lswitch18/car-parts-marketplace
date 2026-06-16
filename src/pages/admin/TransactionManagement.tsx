import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';

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

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-text">
            {t('Gerenciamento de Transações')}
          </h1>
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
                  {t('Valor')}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={t.payment_status}
                          onChange={(e) => updateTransactionStatus(t.id, e.target.value, 'payment')}
                          className="bg-background border border-border rounded-lg px-2 py-1 text-text text-sm focus:outline-none focus:border-primary"
                        >
                          <option value="pending font-medium">{t('Pendente')}</option>
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
        
        {/* Summary stats */}
        <div className="mt-6 p-4 bg-background border border-border rounded-lg">
          <h2 className="font-display text-lg font-bold text-text mb-4">
            {t('Resumo')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-surface border border-border rounded-lg">
              <p className="text-text-secondary text-sm">{t('Total transações')}</p>
              <p className="text-2xl font-bold text-text mt-1">{filteredTransactions.length}</p>
            </div>
            <div className="text-center p-3 bg-surface border border-border rounded-lg">
              <p className="text-text-secondary text-sm">{t('Transações pagas')}</p>
              <p className="text-2xl font-bold text-text mt-1">
                {filteredTransactions.filter(t => t.payment_status === 'paid' || t.payment_status === 'escrow').length}
              </p>
            </div>
            <div className="text-center p-3 bg-surface border border-border rounded-lg">
              <p className="text-text-secondary text-sm">{t('Valor total')}</p>
              <p className="text-2xl font-bold text-text mt-1">
                ¥ {filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
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

                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-bold text-text">{t('Peça/Produto')}</h3>
                  <p className="text-md font-medium text-primary">{part?.title || 'Peça removida'}</p>
                  <p className="text-xs text-text-secondary">{part?.description || 'Sem descrição'}</p>
                  <p className="text-sm font-bold text-text mt-1">¥ {parseFloat(selectedTransaction.amount || 0).toLocaleString('ja-JP')}</p>
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