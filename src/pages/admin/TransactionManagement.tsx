import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';

export default function TransactionManagement() {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');

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
          profiles!transactions_buyer_id_fkey(email, full_name),
          profiles!transactions_seller_id_fkey(email, full_name),
          parts!transactions_part_id_fkey(title)
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
      
      // Update local state
      setTransactions(prev => 
        transactions.map(t => 
          t.id === transactionId 
            ? {...t, [type === 'payment' ? 'payment_status' : 'fulfillment_status']: status} 
            : t
        )
      );
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
        <div className="flex flex-col md:flex-row items-between justify-between mb-4">
          <h1 className="font-display text-2xl font-bold text-text">
            {t('Gerenciamento de Transações')}
          </h1>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary">{t('Status do pagamento:')}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1 text-text"
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
              <span className="text-text-secondary">{t('Status entrega:')}</span>
              <select
                value={fulfillmentFilter}
                onChange={(e) => setFulfillmentFilter(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1 text-text"
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
                  <td className="px-6 py-4 text-center text-text-secondary">
                    {t('Nenhuma transação encontrada')}
                  </td>
                  <td colSpan={7} className="px-6 py-4 text-center text-text-secondary"></td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="bg-white border-b border-border hover:bg-[#f9fafb]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                      {t.parts?.[0]?.title || 'Peça removida'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {t.profiles?.[0]?.full_name || t.profiles?.[0]?.email || 'Usuário desconhecido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {t.profiles?.[1]?.full_name || t.profiles?.[1]?.email || 'Usuário desconhecido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                      R$ {parseFloat(t.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={t.payment_status}
                        onChange={(e) => updateTransactionStatus(t.id, e.target.value, 'payment')}
                        className="bg-background border border-border rounded-lg px-2 py-1 text-text"
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
                        className="bg-background border border-border rounded-lg px-2 py-1 text-text"
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
                        onClick={() => {
                          // Placeholder for view transaction details
                          alert(`${t('Visualizando detalhes da transação:')} #${t.id.substring(0, 8)}`);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        {t('Ver')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary stats */}
        <div className="mt-6 p-4 bg-background border border-border rounded-lg">
          <h2 className="font-display text-xl font-bold text-text mb-4">
            {t('Resumo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-text-secondary">{t('Total transações:')}</p>
              <p className="text-2xl font-bold text-text">{filteredTransactions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary">{t('Transações pagas:')}</p>
              <p className="text-2xl font-bold text-text">
                {filteredTransactions.filter(t => t.payment_status === 'paid' || t.payment_status === 'escrow').length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary">{t('Valor total:')}</p>
              <p className="text-2xl font-bold text-text">
                R$ {filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}