import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutDashboard, Package, Truck, ArrowLeftRight, Boxes, Warehouse,
  MapPin, AlertCircle, Users, BarChart3, Settings,
  Bell, Search, ChevronDown, Plus, CheckCircle, AlertTriangle,
  Percent, DollarSign, Calendar, LogOut, Moon,
} from 'lucide-react';
import { adminApi, DashboardKPIs } from '../../lib/adminApi';
import { useAuthStore } from '../../stores/authStore';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/logistix', id: 'dashboard' },
  { icon: Package, label: 'Pedidos', path: '/admin/logistix/pedidos', id: 'pedidos' },
  { icon: Truck, label: 'Coletas', path: '/admin/logistix/coletas', id: 'coletas' },
  { icon: ArrowLeftRight, label: 'Transferências', path: '/admin/logistix/transferencias', id: 'transferencias' },
  { icon: Boxes, label: 'Estoque', path: '/admin/logistix/estoque', id: 'estoque' },
  { icon: Warehouse, label: 'Armazéns', path: '/admin/logistix/armazens', id: 'armazens' },
  { icon: Truck, label: 'Transportes', path: '/admin/logistix/transportes', id: 'transportes' },
  { icon: MapPin, label: 'Entregas', path: '/admin/logistix/entregas', id: 'entregas' },
  { icon: AlertCircle, label: 'Ocorrências', path: '/admin/logistix/ocorrencias', id: 'ocorrencias' },
  { icon: Users, label: 'Clientes', path: '/admin/logistix/clientes', id: 'clientes' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/logistix/relatorios', id: 'relatorios' },
  { icon: Settings, label: 'Configurações', path: '/admin/logistix/config', id: 'config' },
];

const DONUT_COLORS = ['#22C55E', '#3B82F6', '#F97316', '#EF4444'];
const STATUS_LABEL: Record<string, string> = { entregue: 'Entregue', em_transito: 'Em trânsito', atrasado: 'Atrasado', cancelado: 'Cancelado' };
const STATUS_COLOR: Record<string, string> = { entregue: '#22C55E', em_transito: '#3B82F6', atrasado: '#F97316', cancelado: '#EF4444' };

function KpiCard({ title, value, icon: Icon, color, trend }: { title: string; value: string | number; icon: any; color: string; trend?: string }) {
  return (
    <div className="bg-[#111827] rounded-xl p-5 border border-white/5 h-[130px] flex flex-col relative overflow-hidden group transition-all hover:border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
            <Icon size={16} style={{ color }} />
          </div>
        </div>
      </div>
      <p className="text-[13px] text-gray-400 mb-1">{title}</p>
      <p className="text-[28px] font-bold leading-none mb-1" style={{ color }}>{value}</p>
      {trend && (
        <p className={`flex items-center gap-1 text-[11px] ${trend.startsWith('-') ? 'text-orange-400' : 'text-green-400'}`}>
          {trend} vs mês anterior
        </p>
      )}
      <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function LogistixDashboard() {
  const { user, signOut } = useAuthStore();
  const [activeNav, setActiveNav] = useState('dashboard');

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: () => adminApi.dashboard.kpis(),
    refetchInterval: 30000,
  });

  const { data: statusData } = useQuery({
    queryKey: ['admin', 'status'],
    queryFn: () => adminApi.dashboard.statusEntregas(),
  });

  const { data: performance } = useQuery({
    queryKey: ['admin', 'performance'],
    queryFn: () => adminApi.dashboard.performance(),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn: () => adminApi.dashboard.pedidosRecentes(),
  });

  const donutData = (statusData || []).map(d => ({ name: STATUS_LABEL[d.status] || d.status, value: d.count }));
  const totalPedidos = (donutData || []).reduce((s, d) => s + d.value, 0);

  const armazens = [
    { nome: 'CD São Paulo', pct: 85, cor: '#22C55E' },
    { nome: 'CD Rio de Janeiro', pct: 76, cor: '#22C55E' },
    { nome: 'CD Belo Horizonte', pct: 62, cor: '#FACC15' },
    { nome: 'CD Curitiba', pct: 58, cor: '#FACC15' },
    { nome: 'CD Salvador', pct: 38, cor: '#EF4444' },
  ];

  return (
    <div className="flex h-screen bg-[#0B1220] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0B1220] border-r border-white/5 flex flex-col flex-shrink-0">
        <div className="h-[70px] flex items-center gap-3 px-6">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-wide">LOGISTIX</h1>
            <span className="text-[11px] text-gray-400">Smart Logistics</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 h-12 px-4 rounded-lg transition-all text-sm ${
                activeNav === item.id
                  ? 'bg-[#1F2937] text-blue-400'
                  : 'text-gray-400 hover:bg-[#111827] hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mx-4 my-4 p-3 flex items-center gap-3 rounded-lg border-t border-white/5 cursor-pointer hover:bg-[#111827] transition-colors">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=3B82F6`}
            alt="avatar" className="w-9 h-9 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || user?.name || 'Admin'}</p>
            <p className="text-[12px] text-gray-400">Administrador</p>
          </div>
          <button onClick={signOut} className="text-gray-500 hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="h-[70px] flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-gray-400 mt-1">Bem-vindo de volta, {user?.full_name?.split(' ')[0] || user?.name || 'Admin'} 👋</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#111827] rounded-lg h-10 w-[300px] px-3 border border-white/5">
              <Search size={18} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Buscar (Ctrl + K)" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500" />
            </div>
            <button className="w-10 h-10 rounded-lg bg-[#111827] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#1F2937] hover:text-white transition-all relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0B1220]">12</span>
            </button>
            <button className="w-10 h-10 rounded-lg bg-[#111827] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#1F2937] hover:text-white transition-all">
              <Moon size={18} />
            </button>
            <button className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors text-sm">
              <Plus size={16} />
              Ações rápidas
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="px-6 pb-6 space-y-5">
          {/* Date filter */}
          <div className="flex justify-end">
            <div className="flex items-center gap-2 text-gray-400 text-[13px] cursor-pointer">
              <Calendar size={16} />
              <span>01/05/2026 - 31/05/2026</span>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-5">
            {kpisLoading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#111827] rounded-xl p-5 h-[130px] animate-pulse" />
            )) : (
              <>
                <KpiCard title="Pedidos Totais" value={kpis?.total ?? 0} icon={Package} color="#3B82F6" trend="+18.2%" />
                <KpiCard title="Entregas Concluídas" value={kpis?.concluidas ?? 0} icon={CheckCircle} color="#22C55E" trend="+22.7%" />
                <KpiCard title="Atrasos" value={kpis?.atrasos ?? 0} icon={AlertTriangle} color="#F97316" trend="-15.3%" />
                <KpiCard title="Taxa de Entrega" value={`${kpis?.taxa ?? 0}%`} icon={Percent} color="#8B5CF6" trend="+5.7%" />
                <KpiCard title="Custo Logístico" value={`R$ ${Number(kpis?.custo || 0).toLocaleString('pt-BR')}`} icon={DollarSign} color="#FACC15" trend="-8.6%" />
              </>
            )}
          </div>

          {/* Middle Row: Donut + Inventory */}
          <div className="grid grid-cols-3 gap-5">
            {/* Donut / Status */}
            <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
              <h3 className="text-base font-medium mb-4">Status das Entregas</h3>
              <div className="relative h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 8, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-bold">{totalPedidos}</span>
                  <span className="text-[12px] text-gray-400">Total</span>
                </div>
              </div>
              <div className="space-y-3 mt-2">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center text-[12px]">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    <span className="text-gray-400 flex-1">{d.name}</span>
                    <span className="font-medium">{d.value} ({totalPedidos > 0 ? ((d.value / totalPedidos) * 100).toFixed(1) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
              <h3 className="text-base font-medium mb-4">Performance de Entregas</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performance || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="data" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 8, color: '#fff' }} />
                    <Line type="monotone" dataKey="no_prazo" stroke="#22C55E" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="atrasadas" stroke="#F97316" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-3">
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <span className="w-4 h-0.5 bg-green-500" /> Entregas no prazo
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-400">
                  <span className="w-4 h-0.5 bg-orange-500" /> Entregas com atraso
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
              <h3 className="text-base font-medium mb-4">Estoque por Armazém</h3>
              <div className="space-y-4">
                {armazens.map(a => (
                  <div key={a.nome}>
                    <div className="flex justify-between text-[12px] text-gray-400 mb-1.5">
                      <span>{a.nome}</span>
                      <span style={{ color: a.cor, fontWeight: 600 }}>{a.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${a.pct}%`, background: a.cor, boxShadow: `0 0 6px ${a.cor}66` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 h-10 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-[#1F2937] hover:text-white transition-all">
                Ver todos os armazéns
              </button>
            </div>
          </div>

          {/* Bottom Row: Orders Table */}
          <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
            <h3 className="text-base font-medium mb-4">Pedidos Recentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Pedido', 'Cliente', 'Origem', 'Destino', 'Status', 'Previsão'].map(h => (
                      <th key={h} className="text-left text-[12px] text-gray-400 font-medium pb-4 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(recentOrders || []).slice(0, 5).map((row: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 pr-4 text-sm font-bold">{row.codigo}</td>
                      <td className="py-3 pr-4 text-sm text-gray-300">{row.cliente}</td>
                      <td className="py-3 pr-4 text-sm text-gray-400">{row.origem}</td>
                      <td className="py-3 pr-4 text-sm text-gray-400">{row.destino_cidade} - {row.destino_estado}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-medium" style={{
                          color: STATUS_COLOR[row.status] || '#6B7280',
                          background: `${STATUS_COLOR[row.status] || '#6B7280'}18`,
                          border: `1px solid ${STATUS_COLOR[row.status] || '#6B7280'}33`,
                        }}>
                          {STATUS_LABEL[row.status] || row.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-400">{row.previsao}</td>
                    </tr>
                  ))}
                  {(!recentOrders || recentOrders.length === 0) && (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500 text-sm">Nenhum pedido recente</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-4">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Ver todos os pedidos</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
