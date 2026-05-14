import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { BarChart3, Download, FileText, TrendingUp, Users, Package, DollarSign } from 'lucide-react';

export default function RelatoriosPage() {
  const [period, setPeriod] = useState('month');

  const { data: kpis } = useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: () => adminApi.dashboard.kpis(),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn: () => adminApi.dashboard.pedidosRecentes(),
  });

  const stats = [
    { label: 'Total Pedidos', value: kpis?.total || 0, icon: Package, color: '#3B82F6' },
    { label: 'Entregues', value: kpis?.concluidas || 0, icon: TrendingUp, color: '#22C55E' },
    { label: 'Cancelados', value: kpis?.cancelados || 0, icon: Users, color: '#EF4444' },
    { label: 'Receita', value: `R$ ${Number(kpis?.custo || 0).toLocaleString('pt-BR')}`, icon: DollarSign, color: '#FACC15' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios</h2>
          <p className="text-sm text-gray-400 mt-1">Métricas e desempenho logístico</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="bg-[#111827] border border-white/5 rounded-lg h-10 px-3 text-sm text-white outline-none">
            <option value="week">Esta semana</option>
            <option value="month">Este mês</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este ano</option>
          </select>
          <button className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#111827] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}22` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-[13px] text-gray-400 mb-1">{s.label}</p>
            <p className="text-[24px] font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
          <h3 className="text-base font-medium mb-4 flex items-center gap-2">
            <FileText size={16} className="text-gray-400" /> Pedidos Recentes
          </h3>
          <div className="space-y-3">
            {(!recentOrders || recentOrders.length === 0) ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum pedido recente</p>
            ) : recentOrders.slice(0, 8).map((row: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-mono text-blue-400">{row.codigo}</span>
                <span className="text-gray-400">{row.cliente}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] ${
                  row.status === 'entregue' ? 'text-green-400 bg-green-400/15' :
                  row.status === 'em_transito' ? 'text-blue-400 bg-blue-400/15' :
                  row.status === 'atrasado' ? 'text-orange-400 bg-orange-400/15' :
                  'text-gray-400 bg-gray-400/15'
                }`}>{row.status?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
          <h3 className="text-base font-medium mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-gray-400" /> Indicadores
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Taxa de Entrega</span>
                <span className="text-green-400 font-medium">{kpis?.taxa || 0}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(Number(kpis?.taxa || 0), 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Em Trânsito</span>
                <span className="text-blue-400 font-medium">{((kpis?.emTransito || 0) / Math.max(kpis?.total || 1, 1) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min((kpis?.emTransito || 0) / Math.max(kpis?.total || 1, 1) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Atrasos</span>
                <span className="text-orange-400 font-medium">{((kpis?.atrasos || 0) / Math.max(kpis?.total || 1, 1) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min((kpis?.atrasos || 0) / Math.max(kpis?.total || 1, 1) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Cancelamentos</span>
                <span className="text-red-400 font-medium">{((kpis?.cancelados || 0) / Math.max(kpis?.total || 1, 1) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min((kpis?.cancelados || 0) / Math.max(kpis?.total || 1, 1) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
