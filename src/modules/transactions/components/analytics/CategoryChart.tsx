import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useTranslation } from '@/modules/shared/hooks/useTranslation';

interface CategoryChartProps {
  data: Array<{
    category_id: string;
    category_name: string;
    part_count: number;
    total_value: string | number;
  }>;
}

const COLORS = ['#E63946', '#00D4FF', '#FFB800', '#C0C0C0', '#1A1A2E', '#16213E'];

export function CategoryChart({ data }: CategoryChartProps) {
  const { t } = useTranslation();

  const chartData = data
    .filter((item) => item.part_count > 0)
    .map((item) => ({
      name: item.category_name,
      value: item.part_count,
      total: Number(item.total_value),
    }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { total: number } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A2E] border border-[#16213E] rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-[#00D4FF] text-sm">{payload[0].value} peças</p>
          <p className="text-[#FFB800] text-sm">
            ¥{payload[0].payload.total.toLocaleString('ja-JP')}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: { payload?: Array<{ value: string; color: string }> }) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-2 mt-4">
        {payload?.slice(0, 5).map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center text-xs text-[#C0C0C0]">
            <span
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: entry.color }}
            />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-[#1A1A2E] rounded-lg p-4">
      <h3 className="text-white font-semibold text-lg mb-2">{t('analytics.salesByCategory')}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
