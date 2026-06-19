import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/modules/shared/hooks/useTranslation';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: string | number;
    transactions_count: number;
  }>;
  total?: number;
}

export function RevenueChart({ data, total = 0 }: RevenueChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
    revenue: Number(item.revenue),
  }));

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `¥${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `¥${(value / 1000).toFixed(0)}K`;
    return `¥${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A2E] border border-[#16213E] rounded-lg p-3 shadow-xl">
          <p className="text-[#C0C0C0] text-sm">{label}</p>
          <p className="text-[#FFB800] font-bold text-lg">
            ¥{Number(payload[0].value).toLocaleString('ja-JP')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1A1A2E] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">{t('analytics.revenueTitle')}</h3>
          <p className="text-[#C0C0C0] text-sm">{t('analytics.last7Days')}</p>
        </div>
        <div className="text-right">
          <p className="text-[#FFB800] font-bold text-xl">
            ¥{Number(total).toLocaleString('ja-JP')}
          </p>
          <p className="text-[#C0C0C0] text-xs">{t('analytics.totalRevenue')}</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#16213E" />
            <XAxis
              dataKey="date"
              stroke="#C0C0C0"
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
              tickLine={{ stroke: '#16213E' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#C0C0C0"
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
              tickLine={{ stroke: '#16213E' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#00D4FF"
              strokeWidth={3}
              dot={{ fill: '#00D4FF', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#00D4FF', strokeWidth: 0, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
