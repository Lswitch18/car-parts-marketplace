import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../lib/i18n';

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGMV: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    completedTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Call Supabase functions to get stats
      const { data: totalUsers, error: usersError } = await supabase.rpc('get_total_users');
      const { data: totalGMV, error: gmvError } = await supabase.rpc('get_total_gmv');
      const { data: totalRevenue, error: revenueError } = await supabase.rpc('get_total_revenue');
      
      // Get transactions count
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, payment_status, fulfilled_at', { count: 'exact' });
      
      if (usersError) throw usersError;
      if (gmvError) throw gmvError;
      if (revenueError) throw revenueError;
      if (transactionsError) throw transactionsError;

      const totalTransactions = transactionsData?.length || 0;
      const completedTransactions = transactionsData?.filter(t => t.payment_status === 'paid').length || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalGMV: parseFloat(totalGMV?.toString() || '0'),
        totalRevenue: parseFloat(totalRevenue?.toString() || '0'),
        totalTransactions,
        completedTransactions,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
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
        <h1 className="font-display text-3xl font-bold text-text mb-4">
          {t('Dashboard Administrativo')}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-text-secondary mb-2">
              {t('Total de Usuários')}
            </h2>
            <p className="text-3xl font-bold text-text">
              {stats.totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-text-secondary mb-2">
              {t('Volume Total de Vendas (GMV)')}
            </h2>
            <p className="text-3xl font-bold text-text">
              R$ {stats.totalGMV.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-text-secondary mb-2">
              {t('Receita Total da Plataforma')}
            </h2>
            <p className="text-3xl font-bold text-text">
              R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-text-secondary mb-2">
              {t('Transações Concluídas')}
            </h2>
            <p className="text-3xl font-bold text-text">
              {stats.completedTransactions} / {stats.totalTransactions}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="font-display text-2xl font-bold text-text mb-4">
          {t('Transações Recentes')}
        </h2>
        {/* Placeholder for recent transactions table */}
        <div className="text-text-secondary text-center py-12">
          <p>{t('Em desenvolvimento...')}</p>
        </div>
      </div>
    </div>
  );
}