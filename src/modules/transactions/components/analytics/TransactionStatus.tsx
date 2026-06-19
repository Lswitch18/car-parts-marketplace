import { useTranslation } from '@/modules/shared/hooks/useTranslation';

interface TransactionStatusProps {
  data: Array<{
    status: string;
    count: number;
    total_amount: string | number;
  }>;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Concluídas' },
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pendentes' },
  failed: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Falhas' },
  refunded: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Estornadas' },
};

const STATUS_ICONS: Record<string, string> = {
  completed: '✓',
  pending: '⏳',
  failed: '✗',
  refunded: '↩',
};

export function TransactionStatus({ data }: TransactionStatusProps) {
  const { t } = useTranslation();

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + Number(item.total_amount), 0);

  const statusMap: Record<string, typeof STATUS_COLORS['completed']> = {
    completed: STATUS_COLORS.completed,
    pending: STATUS_COLORS.pending,
    failed: STATUS_COLORS.failed,
    refunded: STATUS_COLORS.refunded,
  };

  return (
    <div className="bg-[#1A1A2E] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">{t('analytics.transactionStatus')}</h3>
        <div className="text-right">
          <p className="text-[#FFB800] font-bold text-lg">
            ¥{totalAmount.toLocaleString('ja-JP')}
          </p>
          <p className="text-[#C0C0C0] text-xs">{totalCount} transações</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => {
          const status = item.status.toLowerCase();
          const config = statusMap[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: item.status };
          const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;

          return (
            <div key={item.status} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{STATUS_ICONS[status] || '○'}</span>
                  <span className={`text-sm font-medium ${config.text}`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C0C0C0] text-sm">{item.count}</span>
                  <span className="text-[#C0C0C0] text-xs">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-[#16213E] rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.bg.replace('/20', '')} transition-all duration-500`}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: status === 'completed' ? '#22c55e' : status === 'pending' ? '#eab308' : status === 'failed' ? '#ef4444' : '#a855f7',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
