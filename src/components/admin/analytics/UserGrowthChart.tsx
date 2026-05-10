import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '../../../hooks/useTranslation';

interface UserGrowthChartProps {
  data: Array<{
    month_date: string;
    new_users: number;
    total_users: number;
  }>;
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.month_date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A2E] border border-[#16213E] rounded-lg p-3 shadow-xl">
          <p className="text-[#C0C0C0] text-sm">{label}</p>
          <p className="text-[#00D4FF] text-sm">
            Novos: {payload[0].value}
          </p>
          <p className="text-[#FFB800] text-sm">
            Total: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1A1A2E] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">{t('analytics.userGrowth')}</h3>
        <p className="text-[#C0C0C0] text-sm">{t('analytics.last6Months')}</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTotalUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB800" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#16213E" />
            <XAxis
              dataKey="date"
              stroke="#C0C0C0"
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
            />
            <YAxis
              stroke="#C0C0C0"
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="new_users"
              stroke="#00D4FF"
              fillOpacity={1}
              fill="url(#colorNewUsers)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="total_users"
              stroke="#FFB800"
              fillOpacity={1}
              fill="url(#colorTotalUsers)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2">
        <span className="flex items-center text-xs text-[#C0C0C0]">
          <span className="w-3 h-3 rounded-full bg-[#00D4FF] mr-2" />
          Novos usuários
        </span>
        <span className="flex items-center text-xs text-[#C0C0C0]">
          <span className="w-3 h-3 rounded-full bg-[#FFB800] mr-2" />
          Total acumulado
        </span>
      </div>
    </div>
  );
}
