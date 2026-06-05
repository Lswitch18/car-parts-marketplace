import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutDashboard, Package, Truck, Warehouse,
  MapPin, BarChart3, Settings,
  Bell, Search, ChevronDown, CheckCircle, AlertTriangle,
  Percent, DollarSign, Calendar, LogOut, Moon, ChevronRight, TrendingUp,
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { useAuthStore } from '../../stores/authStore';
import PedidosPage from './logistix/PedidosPage';
import EntregasPage from './logistix/EntregasPage';
import RastreamentoPage from './logistix/RastreamentoPage';
import ArmazensPage from './logistix/ArmazensPage';
import ClientesPage from './logistix/ClientesPage';
import EstoquePage from './logistix/EstoquePage';
import TransportesPage from './logistix/TransportesPage';
import OcorrenciasPage from './logistix/OcorrenciasPage';
import ColetasPage from './logistix/ColetasPage';
import TransferenciasPage from './logistix/TransferenciasPage';
import RelatoriosPage from './logistix/RelatoriosPage';
import ConfigPage from './logistix/ConfigPage';
import UsuariosPage from './logistix/UsuariosPage';
import EtiquetasPage from './logistix/EtiquetasPage';
import DropoffPage from './logistix/DropoffPage';
import WMSPage from './logistix/WMSPage';
import MapaPage from './logistix/MapaPage';
import Armazem3DPage from './logistix/Armazem3DPage';
import GlobalSearch from '../../components/logistix/GlobalSearch';
import NotificationCenter from '../../components/logistix/NotificationCenter';
import PedidoDetail from './logistix/PedidoDetail';

interface NavGroup {
  icon: any;
  label: string;
  id: string;
  items: { id: string; label: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', items: [] },
  { icon: Package, label: 'Pedidos', id: 'grupo_pedidos', items: [
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'entregas', label: 'Entregas' },
    { id: 'coletas', label: 'Coletas' },
    { id: 'transferencias', label: 'Transferências' },
  ]},
  { icon: Warehouse, label: 'Armazéns', id: 'grupo_armazens', items: [
    { id: 'armazens', label: 'Centros de Distribuição' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'wms', label: 'WMS' },
    { id: 'armazem3d', label: 'Armazém 3D' },
  ]},
  { icon: MapPin, label: 'Rastreamento', id: 'grupo_rastreamento', items: [
    { id: 'rastreamento', label: 'Rastreamento' },
    { id: 'mapa', label: 'Mapa GPS' },
  ]},
  { icon: Truck, label: 'Operações', id: 'grupo_operacoes', items: [
    { id: 'etiquetas', label: 'Etiquetas' },
    { id: 'transportes', label: 'Transportes' },
    { id: 'dropoffs', label: 'Drop-offs' },
  ]},
  { icon: BarChart3, label: 'Relatórios', id: 'relatorios', items: [] },
  { icon: Settings, label: 'Administração', id: 'grupo_admin', items: [
    { id: 'ocorrencias', label: 'Ocorrências' },
    { id: 'usuarios', label: 'Usuários' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'config', label: 'Configurações' },
  ]},
];

const DONUT_COLORS = ['#22C55E', '#3B82F6', '#F97316', '#EF4444'];
const STATUS_LABEL: Record<string, string> = { entregue: 'Entregue', em_transito: 'Em trânsito', atrasado: 'Atrasado', cancelado: 'Cancelado' };
const STATUS_COLOR: Record<string, string> = { entregue: '#22C55E', em_transito: '#3B82F6', atrasado: '#F97316', cancelado: '#EF4444' };

function KpiCard({ title, value, icon: Icon, color, trend, onClick }: { title: string; value: string | number; icon: any; color: string; trend?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="stat-card text-left w-full group" style={{ background: 'var(--bg-elevated)' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
            <Icon size={16} style={{ color }} />
          </div>
        </div>
      </div>
      <p className="text-[13px] text-text-muted mb-1">{title}</p>
      <p className="text-[28px] font-display font-bold leading-none mb-1" style={{ color }}>{value}</p>
      {trend && (
        <p className={`flex items-center gap-1 text-[11px] ${trend.startsWith('-') ? 'text-orange-400' : 'text-green-400'}`}>
          {trend} vs mês anterior
        </p>
      )}
    </button>
  );
}

export default function LogistixDashboard() {
  const { user, signOut } = useAuthStore();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    grupo_pedidos: true,
    grupo_armazens: false,
    grupo_rastreamento: false,
    grupo_operacoes: false,
    grupo_admin: false,
  });

  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [notificacaoOpen, setNotificacaoOpen] = useState(false);
  const [detailPedidoId, setDetailPedidoId] = useState<string | undefined>();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setGlobalSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: () => adminApi.dashboard.kpis(),
    staleTime: 30000,
    refetchInterval: 30000,
    retry: 2,
  });

  const { data: statusData } = useQuery({
    queryKey: ['admin', 'status'],
    queryFn: () => adminApi.dashboard.statusEntregas(),
    staleTime: 60000,
  });

  const { data: performance } = useQuery({
    queryKey: ['admin', 'performance'],
    queryFn: () => adminApi.dashboard.performance(),
    staleTime: 60000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn: () => adminApi.dashboard.pedidosRecentes(),
    staleTime: 30000,
  });

  const { data: ocorrencias } = useQuery({
    queryKey: ['admin', 'ocorrencias-ativas'],
    queryFn: () => adminApi.ocorrencias.list('aberto,em_andamento'),
    staleTime: 30000,
  });

  const ocorrenciasAbertas = (ocorrencias || []).length;

  const today = new Date();
  const mesAtual = today.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
  const dataLabel = `01/${mesAtual} - ${today.toLocaleDateString('pt-BR')}`;

  const donutData = (statusData || []).map(d => ({ name: STATUS_LABEL[d.status] || d.status, value: d.count }));
  const totalPedidos = (donutData || []).reduce((s, d) => s + d.value, 0);

  const { data: armazensList } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const armazens = (armazensList || []).slice(0, 8).map((a: any) => {
    const pct = a.capacidade && a.capacidade > 0 ? Math.round((a.ocupacao / a.capacidade) * 100) : 0;
    const cor = pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E';
    return { id: a.id, nome: a.nome, pct, cor, cidade: a.cidade };
  });

  const atividadeFeed = [
    ...(recentOrders || []).slice(0, 3).map((o: any) => ({
      tipo: 'pedido' as const,
      label: `Pedido ${o.codigo}`,
      desc: `${o.cliente} · ${o.status}`,
      cor: STATUS_COLOR[o.status] || '#6B7280',
      hora: o.previsao || '',
    })),
    ...(ocorrencias || []).slice(0, 2).map((o: any) => ({
      tipo: 'ocorrencia' as const,
      label: `Ocorrência: ${o.tipo}`,
      desc: o.descricao?.slice(0, 40) || '',
      cor: '#EF4444',
      hora: o.created_at || '',
    })),
  ];  function QuickActions({ onNavigate }: { onNavigate: (id: string) => void }) {
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onNavigate('coletas')} className="flex items-center gap-2 h-10 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20">
          + Nova Coleta
        </button>
        <button onClick={() => onNavigate('etiquetas')} className="flex items-center gap-2 h-10 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium transition-colors border border-green-500/20">
          + Gerar Etiquetas
        </button>
        <button onClick={() => onNavigate('pedidos')} className="flex items-center gap-2 h-10 px-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors border border-purple-500/20">
          + Novo Pedido
        </button>
        <button onClick={() => onNavigate('transferencias')} className="flex items-center gap-2 h-10 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium transition-colors border border-cyan-500/20">
          + Transferência
        </button>
        <button onClick={() => onNavigate('ocorrencias')} className="flex items-center gap-2 h-10 px-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium transition-colors border border-orange-500/20">
          + Ocorrência
        </button>
        <button onClick={() => onNavigate('armazem3d')} className="flex items-center gap-2 h-10 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors border border-indigo-500/20">
          ⊞ Armazém 3D
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-white font-sans overflow-hidden relative">
      {/* Grid overlay + glows */}
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(13,117,255,0.10) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(112,0,255,0.08) 0%, transparent 65%)' }} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-background border-r border-border flex flex-col flex-shrink-0 transition-transform duration-200 relative z-10 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-[70px] flex items-center gap-3 px-6">
          <div className="w-8 h-8 bg-daig-blue rounded-lg flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight tracking-wide">LOGISTIX</h1>
            <span className="text-[11px] text-text-muted">Smart Logistics</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-0.5 relative z-10">
          {NAV_GROUPS.map(group => (
            <div key={group.id}>
              {group.items.length === 0 ? (
                <button
                  onClick={() => setActiveNav(group.id)}
                  className={`w-full flex items-center gap-3 h-11 px-4 rounded-lg transition-all text-sm ${
                    activeNav === group.id
                      ? 'bg-[#111116] text-daig-blue shadow-[0_0_12px_-4px_rgba(13,117,255,0.3)]'
                      : 'text-text-muted hover:bg-[#111116] hover:text-white'
                  }`}
                >
                  <group.icon size={20} />
                  {group.label}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center gap-3 h-11 px-4 rounded-lg transition-all text-sm text-text-muted hover:bg-[#111116] hover:text-white ${
                      expandedGroups[group.id] ? 'text-white' : ''
                    }`}
                  >
                    <group.icon size={20} />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${expandedGroups[group.id] ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {expandedGroups[group.id] && (
                    <div className="ml-3 space-y-0.5 border-l border-border pl-3">
                      {group.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => setActiveNav(item.id)}
                          className={`w-full flex items-center gap-3 h-10 px-4 rounded-lg transition-all text-sm ${
                            activeNav === item.id
                              ? 'bg-[#111116] text-daig-blue shadow-[0_0_12px_-4px_rgba(13,117,255,0.3)]'
                              : 'text-text-muted hover:bg-[#111116] hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        <div className="mx-4 my-4 p-3 flex items-center gap-3 rounded-lg border-t border-border cursor-pointer hover:bg-[#111116] transition-colors">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=3B82F6`}
            alt="avatar" className="w-9 h-9 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || user?.name || 'Admin'}</p>
            <p className="text-[12px] text-text-muted">Administrador</p>
          </div>
          <button onClick={signOut} className="text-text-muted hover:text-white transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative z-10">
        {activeNav === 'dashboard' ? (
          <>
            <header className="h-[70px] flex items-center justify-between px-3 lg:px-6 flex-shrink-0 gap-2 relative z-10" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-lg bg-[var(--bg-elevated)] border border-border flex items-center justify-center text-text-muted hover:text-white flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                <div className="min-w-0">
                  <h2 className="font-display text-lg lg:text-2xl font-bold truncate">Dashboard</h2>
                  <p className="text-xs lg:text-sm text-text-muted mt-0.5 truncate">Bem-vindo de volta, {user?.full_name?.split(' ')[0] || user?.name || 'Admin'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-4">
                <div className="hidden lg:flex items-center bg-[var(--bg-elevated)] rounded-lg h-10 w-[300px] px-3 border border-border">
                  <Search size={18} className="text-text-muted mr-2" />
                  <input type="text" placeholder="Buscar (Ctrl + K)" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-muted" />
                </div>
                <div className="relative flex-shrink-0">
                  <button onClick={() => setNotificacaoOpen(!notificacaoOpen)} className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-[var(--bg-elevated)] border border-border flex items-center justify-center text-text-muted hover:bg-[#1F2937] hover:text-white transition-all relative">
                    <Bell size={18} />
                    {ocorrenciasAbertas > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-background">
                        {ocorrenciasAbertas}
                      </span>
                    )}
                  </button>
                  <NotificationCenter open={notificacaoOpen} onClose={() => setNotificacaoOpen(false)} />
                </div>
                <button className="hidden lg:flex w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-border items-center justify-center text-text-muted hover:bg-[#1F2937] hover:text-white transition-all">
                  <Moon size={18} />
                </button>

              </div>
            </header>

            <div className="px-6 pb-6 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <QuickActions onNavigate={setActiveNav} />
                <div className="flex items-center gap-2 text-gray-400 text-[13px] cursor-pointer">
                  <Calendar size={16} />
                  <span>{dataLabel}</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {kpisLoading ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-xl p-5 h-[130px]" />
                )) : (
                  <>
                    <KpiCard title="Pedidos Totais" value={kpis?.total ?? 0} icon={Package} color="#3B82F6" trend="+18.2%" onClick={() => setActiveNav('pedidos')} />
                    <KpiCard title="Entregas Concluídas" value={kpis?.concluidas ?? 0} icon={CheckCircle} color="#22C55E" trend="+22.7%" onClick={() => setActiveNav('entregas')} />
                    <KpiCard title="Atrasos" value={kpis?.atrasos ?? 0} icon={AlertTriangle} color="#F97316" trend="-15.3%" onClick={() => setActiveNav('pedidos')} />
                    <KpiCard title="Taxa de Entrega" value={`${kpis?.taxa ?? 0}%`} icon={Percent} color="#8B5CF6" trend="+5.7%" onClick={() => setActiveNav('relatorios')} />
                    <KpiCard title="Receita Mensal" value={`¥ ${Number(kpis?.receita_mensal || 0).toLocaleString('ja-JP')}`} icon={DollarSign} color="#22C55E" trend="+18.2%" onClick={() => setActiveNav('relatorios')} />
                    <KpiCard title="Lucro Mensal" value={`¥ ${Number(kpis?.lucro_mensal || 0).toLocaleString('ja-JP')}`} icon={TrendingUp} color={Number(kpis?.lucro_mensal || 0) >= 0 ? '#22C55E' : '#EF4444'} trend={`${kpis?.margem || '0'}%`} onClick={() => setActiveNav('relatorios')} />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-surface rounded-xl p-5 border border-border">
                  <h3 className="font-display text-base font-bold mb-4">Status das Entregas</h3>
                  <div className="relative h-[180px] flex items-center justify-center min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" strokeWidth={0}>
                          {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, color: '#fff' }} />
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

                <div className="bg-surface rounded-xl p-5 border border-border">
                  <h3 className="font-display text-base font-bold mb-4">Performance de Entregas</h3>
                  <div className="h-[180px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performance || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="data" tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, color: '#fff' }} />
                        <Line type="monotone" dataKey="no_prazo" stroke="#22C55E" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="atrasadas" stroke="#F97316" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2 text-[12px] text-gray-400"><span className="w-4 h-0.5 bg-green-500" /> Entregas no prazo</div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-400"><span className="w-4 h-0.5 bg-orange-500" /> Entregas com atraso</div>
                  </div>
                </div>

                <div className="bg-surface rounded-xl p-5 border border-border">
                  <h3 className="font-display text-base font-bold mb-4">Estoque por Centro de Distribuição</h3>
                  <div className="space-y-4">
                    {armazens.map(a => (
                      <button key={a.nome} onClick={() => { setActiveNav('armazem3d'); }} className="w-full text-left group">
                        <div className="flex justify-between text-[12px] text-gray-400 mb-1.5 group-hover:text-white transition-colors">
                          <span className="flex items-center gap-1.5">
                            <span className="text-gray-600 group-hover:text-blue-400 transition-colors">{'>'}</span>
                            {a.nome}
                          </span>
                          <span style={{ color: a.cor, fontWeight: 600 }}>{a.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden group-hover:bg-white/10 transition-colors">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${a.pct}%`, background: a.cor, boxShadow: `0 0 6px ${a.cor}66` }} />
                        </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setActiveNav('armazem3d')} className="w-full mt-4 h-10 rounded-lg border border-border text-text-muted text-sm hover:bg-[var(--bg-elevated)] hover:text-white transition-all">Ver armazéns em 3D</button>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-5 border border-border">
                <h3 className="font-display text-base font-bold mb-4">Atividade Recente</h3>
                <div className="space-y-1">
                  {atividadeFeed.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">Nenhuma atividade recente</p>
                  ) : (
                    atividadeFeed.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.cor }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                          <p className="text-[12px] text-gray-500 truncate">{item.desc}</p>
                        </div>
                        <span className="text-[11px] text-gray-600 flex-shrink-0">{item.hora}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-surface rounded-xl p-5 border border-border">
                <h3 className="font-display text-base font-bold mb-4">Pedidos Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Pedido', 'Cliente', 'Origem', 'Destino', 'Status', 'Previsão'].map(h => (
                        <th key={h} className="text-left text-[12px] text-text-muted font-medium pb-4 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {(recentOrders || []).slice(0, 5).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-border hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => { setActiveNav('pedidos'); setDetailPedidoId(row.codigo || row.id); }}>
                          <td className="py-3 pr-4 text-sm font-bold">{row.codigo}</td>
                          <td className="py-3 pr-4 text-sm text-gray-300">{row.cliente}</td>
                          <td className="py-3 pr-4 text-sm text-gray-400">{row.origem}</td>
                          <td className="py-3 pr-4 text-sm text-gray-400">{row.destino_cidade} - {row.destino_estado}</td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-medium" style={{
                              color: STATUS_COLOR[row.status] || '#6B7280',
                              background: `${STATUS_COLOR[row.status] || '#6B7280'}18`,
                              border: `1px solid ${STATUS_COLOR[row.status] || '#6B7280'}33`,
                            }}>{STATUS_LABEL[row.status] || row.status}</span>
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
                  <button onClick={() => setActiveNav('pedidos')} className="text-sm text-gray-400 hover:text-white transition-colors">Ver todos os pedidos</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {detailPedidoId ? (
              <PedidoDetail pedidoId={detailPedidoId} onBack={() => setDetailPedidoId(undefined)} />
            ) : activeNav === 'pedidos' && <PedidosPage />}
            {activeNav === 'rastreamento' && <RastreamentoPage />}
            {activeNav === 'entregas' && <EntregasPage />}
            {activeNav === 'coletas' && <ColetasPage />}
            {activeNav === 'transferencias' && <TransferenciasPage />}
            {activeNav === 'estoque' && <EstoquePage />}
            {activeNav === 'armazens' && <ArmazensPage />}
            {activeNav === 'armazem3d' && <Armazem3DPage />}
            {activeNav === 'transportes' && <TransportesPage />}
            {activeNav === 'dropoffs' && <DropoffPage />}
            {activeNav === 'ocorrencias' && <OcorrenciasPage />}
            {activeNav === 'clientes' && <ClientesPage />}
            {activeNav === 'wms' && <WMSPage />}
            {activeNav === 'etiquetas' && <EtiquetasPage />}
            {activeNav === 'usuarios' && <UsuariosPage />}
            {activeNav === 'mapa' && <MapaPage />}
            {activeNav === 'relatorios' && <RelatoriosPage />}
            {activeNav === 'config' && <ConfigPage />}
          </div>
        )}
      </main>

      <GlobalSearch
        open={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        onNavigate={(id) => setActiveNav(id)}
      />
    </div>
  );
}
