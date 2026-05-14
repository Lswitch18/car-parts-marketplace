import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = {
  entregue: '#00ff88',
  em_transito: '#00f5ff',
  atrasado: '#ff00ff',
  pendente: '#ffee00',
  cancelado: '#6b7280',
};

interface NeonDonutChartProps {
  data: { name: string; value: number }[];
  size?: number;
}

export function NeonDonutChart({ data, size = 200 }: NeonDonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={size}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={size * 0.35}
          outerRadius={size * 0.5}
          paddingAngle={4}
          dataKey="value"
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => {
            const key = entry.name.toLowerCase().replace(' ', '_');
            const color = COLORS[key as keyof typeof COLORS] || '#6b7280';
            return (
              <Cell 
                key={`cell-${index}`} 
                fill={color}
                stroke="transparent"
                style={{
                  filter: `drop-shadow(0 0 8px ${color})`,
                }}
              />
            );
          })}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#12121a',
            border: '1px solid #2a2a3e',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          itemStyle={{ color: '#fff' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface NeonLineChartProps {
  data: { name: string; value: number }[];
  dataKey?: string;
  height?: number;
}

export function NeonLineChart({ data, dataKey = 'value', height = 200 }: NeonLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <defs>
          <linearGradient id="neonGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="name" 
          stroke="#6b7280" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#2a2a3e' }}
        />
        <YAxis 
          stroke="#6b7280" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#2a2a3e' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#12121a',
            border: '1px solid #00f5ff',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          labelStyle={{ color: '#00f5ff' }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="url(#neonGradient)"
          strokeWidth={3}
          dot={{ 
            fill: '#00f5ff', 
            strokeWidth: 0,
            r: 4,
            style: {
              filter: 'drop-shadow(0 0 6px #00f5ff)',
            }
          }}
          activeDot={{ 
            r: 6, 
            fill: '#00ff88',
            style: {
              filter: 'drop-shadow(0 0 8px #00ff88)',
            }
          }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface NeonBarChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

export function NeonBarChart({ data, height = 200 }: NeonBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff00ff" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#00f5ff" stopOpacity={1} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="name" 
          stroke="#6b7280" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#2a2a3e' }}
        />
        <YAxis 
          stroke="#6b7280" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: '#2a2a3e' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#12121a',
            border: '1px solid #ff00ff',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          labelStyle={{ color: '#ff00ff' }}
        />
        <Bar 
          dataKey="value" 
          fill="url(#barGradient)"
          radius={[4, 4, 0, 0]}
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.3))',
          }}
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ChartLegendProps {
  data: { name: string; value: number; color: string }[];
}

export function NeonLegend({ data }: ChartLegendProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: item.color,
              boxShadow: `0 0 8px ${item.color}`,
            }}
          />
          <span className="text-gray-400 text-sm font-mono">
            {item.name}: <span className="text-white">{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}