import { useState } from 'react';
import { useAnalytics, useDailyStats, DailyStats, DailyStatsData } from '../../hooks/useAnalytics';
import {
  RevenueChart,
  CategoryChart,
  TopSellersChart,
  UserGrowthChart,
  TransactionStatus,
} from '../../components/admin/analytics';
import { useI18n } from '../../lib/i18n';
import { Users, TrendingUp, DollarSign, ShoppingCart, RefreshCw } from 'lucide-react';

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color: string;
}) {
  return (
    <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#16213E]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#C0C0C0] text-sm mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && (
            <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className="bg-[#16213E] p-2 rounded-lg">
          <Icon className="w-5 h-5 text-[#00D4FF]" />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#16213E] rounded-lg ${className}`} />;
}

export default function AdminDashboard() {
  const { t } = useI18n();
  const { data, isLoading, error, refetch } = useAnalytics();
  const { data: dailyStatsData } = useDailyStats();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    refetch();
    setLastUpdate(new Date());
  };

  const formatCurrency = (value: string | number | null | undefined) => {
    const num = Number(value || 0);
    if (num >= 1000000) return `¥${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `¥${(num / 1000).toFixed(1)}K`;
    return `¥${num.toLocaleString('ja-JP')}`;
  };

  const stats = dailyStatsData as DailyStatsData;
  const yesterdayRevenue = stats?.yesterday_revenue 
    ? Number(stats.yesterday_revenue).toLocaleString('ja-JP') 
    : '0';

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t('analytics.dashboard')}
          </h1>
          <p className="text-[#C0C0C0] text-sm">
            {t('analytics.lastUpdate')}: {lastUpdate.toLocaleTimeString('ja-JP')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-[#1A1A2E] hover:bg-[#16213E] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('analytics.refresh')}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
          <p>{t('analytics.errorLoading')}: {error.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          <>
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              title={t('analytics.totalUsers')}
              value={stats?.total_users ?? data?.users?.total ?? 0}
              icon={Users}
              color="text-white"
            />
            <StatCard
              title={t('analytics.activeListings')}
              value={stats?.active_listings ?? 0}
              icon={ShoppingCart}
              color="text-[#00D4FF]"
            />
            <StatCard
              title={t('analytics.totalRevenue')}
              value={formatCurrency(data?.sales?.total)}
              icon={DollarSign}
              color="text-[#FFB800]"
            />
            <StatCard
              title={t('analytics.todayRevenue')}
              value={formatCurrency(stats?.today_revenue)}
              icon={TrendingUp}
              trend={stats?.yesterday_revenue ? `vs ¥${yesterdayRevenue} yesterday` : undefined}
              color="text-green-400"
            />
          </>
        )}
      </div>

      <div className="mb-6">
        {isLoading ? (
          <LoadingSkeleton className="h-80" />
        ) : (
          <RevenueChart
            data={data?.sales?.sales || []}
            total={data?.sales?.total || 0}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          {isLoading ? (
            <LoadingSkeleton className="h-80" />
          ) : (
            <CategoryChart data={data?.categories?.categories || []} />
          )}
        </div>

        <div>
          {isLoading ? (
            <LoadingSkeleton className="h-80" />
          ) : (
            <TransactionStatus data={data?.status?.status || []} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          {isLoading ? (
            <LoadingSkeleton className="h-80" />
          ) : (
            <TopSellersChart data={data?.sellers?.sellers || []} />
          )}
        </div>

        <div>
          {isLoading ? (
            <LoadingSkeleton className="h-80" />
          ) : (
            <UserGrowthChart data={data?.users?.growth || []} />
          )}
        </div>
      </div>

      <div className="bg-[#1A1A2E] rounded-lg p-4">
        <h3 className="text-white font-semibold text-lg mb-4">
          {t('analytics.recentTransactions')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#16213E]">
                <th className="text-left text-[#C0C0C0] text-sm font-medium py-3 px-2">
                  {t('analytics.table.buyer')}
                </th>
                <th className="text-left text-[#C0C0C0] text-sm font-medium py-3 px-2">
                  {t('analytics.table.seller')}
                </th>
                <th className="text-left text-[#C0C0C0] text-sm font-medium py-3 px-2">
                  {t('analytics.table.product')}
                </th>
                <th className="text-right text-[#C0C0C0] text-sm font-medium py-3 px-2">
                  {t('analytics.table.amount')}
                </th>
                <th className="text-center text-[#C0C0C0] text-sm font-medium py-3 px-2">
                  {t('analytics.table.status')}
                </th>
                <th className="text-right text-[#C0C0C0] text-sm font-medium py-3 px-2">
                  {t('analytics.table.date')}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#16213E]">
                    <td colSpan={6} className="py-3 px-2">
                      <LoadingSkeleton className="h-8" />
                    </td>
                  </tr>
                ))
              ) : data?.recent?.transactions && data.recent.transactions.length > 0 ? (
                data.recent.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#16213E] hover:bg-[#16213E]/50">
                    <td className="py-3 px-2 text-white text-sm">
                      {tx.buyer_name || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-white text-sm">
                      {tx.seller_name || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-[#C0C0C0] text-sm truncate max-w-[200px]">
                      {tx.part_title || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-right text-[#FFB800] text-sm font-medium">
                      ¥{Number(tx.amount).toLocaleString('ja-JP')}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          tx.payment_status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : tx.payment_status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {tx.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-[#C0C0C0] text-sm">
                      {new Date(tx.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#C0C0C0]">
                    {t('analytics.noTransactions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
