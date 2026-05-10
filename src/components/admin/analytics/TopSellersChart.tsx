import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from '../../../hooks/useTranslation';

interface TopSellersChartProps {
  data: Array<{
    seller_id: string;
    username: string;
    avatar_url: string | null;
    total_sales: string | number;
    transaction_count: number;
    rating: string | number;
  }>;
}

export function TopSellersChart({ data }: TopSellersChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((item) => ({
    ...item,
    name: item.username,
    total: Number(item.total_sales),
  }));

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `¥${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `¥${(value / 1000).toFixed(0)}K`;
    return `¥${value}`;
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: TopSellersChartProps['data'][0] }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#1A1A2E] border border-[#16213E] rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{item.username}</p>
          <p className="text-[#FFB800] text-sm">Vendas: ¥{Number(item.total_sales).toLocaleString('ja-JP')}</p>
          <p className="text-[#00D4FF] text-sm">{item.transaction_count} transações</p>
          <p className="text-[#C0C0C0] text-sm">Rating: {Number(item.rating).toFixed(1)}★</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1A1A2E] rounded-lg p-4">
      <h3 className="text-white font-semibold text-lg mb-2">{t('analytics.topSellers')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#16213E" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={formatYAxis}
              stroke="#C0C0C0"
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#C0C0C0"
              tick={{ fill: '#C0C0C0', fontSize: 12 }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(22, 33, 62, 0.3)' }} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#FFB800' : index === 1 ? '#C0C0C0' : '#00D4FF'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
