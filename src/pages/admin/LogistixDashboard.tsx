import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutDashboard, Package, Truck, Warehouse,
  MapPin, BarChart3, Settings,
  Bell, Search, ChevronDown, CheckCircle, AlertTriangle,
  Percent, DollarSign, Calendar, LogOut, Moon, ChevronRight, TrendingUp, Sliders
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { useAuthStore } from '../../stores/authStore';
import { useI18n } from '../../lib/i18n';
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
import TerceirosPage from './logistix/TerceirosPage';
import GlobalSearch from '../../components/logistix/GlobalSearch';
import NotificationCenter from '../../components/logistix/NotificationCenter';
import PedidoDetail from './logistix/PedidoDetail';
import GaidLogo from '../../components/GaidLogo';

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
    { id: 'terceiros', label: 'Terceiros' },
  ]},
  { icon: BarChart3, label: 'Relatórios', id: 'relatorios', items: [] },
  { icon: Settings, label: 'Administração', id: 'grupo_admin', items: [
    { id: 'ocorrencias', label: 'Ocorrências' },
    { id: 'usuarios', label: 'Usuários' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'config', label: 'Configurações' },
  ]},
];

// Professional monochrome palette for donut chart and status labels
const DONUT_COLORS = ['#000000', '#4B5563', '#9CA3AF', '#D1D5DB'];
const STATUS_LABEL: Record<string, string> = { entregue: 'Entregue', em_transito: 'Em trânsito', atrasado: 'Atrasado', cancelado: 'Cancelado' };
const STATUS_COLOR: Record<string, string> = { entregue: '#000000', em_transito: '#4B5563', atrasado: '#9CA3AF', cancelado: '#E5E7EB' };

function KpiCard({ title, value, icon: Icon, color, trend, onClick }: { title: string; value: string | number; icon: any; color: string; trend?: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className="text-left w-full p-6 bg-white border-2 border-black rounded-xl hover:bg-slate-50 transition-all focus:outline-none"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 border border-black/10">
          <Icon size={16} className="text-black" />
        </div>
      </div>
      <p className="text-xs uppercase tracking-widest font-black text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-black leading-none text-black mb-2">{value}</p>
      {trend && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {trend} vs mês anterior
        </p>
      )}
    </button>
  );
}

export default function LogistixDashboard() {
  const { user, signOut } = useAuthStore();
  const { t } = useI18n();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

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

  const CD_list = (armazensList || []).slice(0, 8).map((a: any) => {
    const pct = a.capacidade && a.capacidade > 0 ? Math.round((a.ocupacao / a.capacidade) * 100) : 0;
    const cor = pct > 80 ? '#000000' : pct > 60 ? '#4b5563' : '#9ca3af';
    return { id: a.id, nome: a.nome, pct, cor, cidade: a.cidade };
  });

  const atividadeFeed = [
    ...(recentOrders || []).slice(0, 3).map((o: any) => ({
      tipo: 'pedido' as const,
      label: `Pedido ${o.codigo}`,
      desc: `${o.cliente} · ${o.status}`,
      cor: STATUS_COLOR[o.status] || '#000000',
      hora: o.previsao || '',
    })),
    ...(ocorrencias || []).slice(0, 2).map((o: any) => ({
      tipo: 'ocorrencia' as const,
      label: `Ocorrência: ${o.tipo}`,
      desc: o.descricao?.slice(0, 40) || '',
      cor: '#000000',
      hora: o.created_at || '',
    })),
  ];

  function QuickActions({ onNavigate }: { onNavigate: (id: string) => void }) {
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onNavigate('coletas')} className="flex items-center gap-2 h-10 px-4 bg-white hover:bg-slate-50 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all border-2 border-black shadow-xs">
          + Nova Coleta
        </button>
        <button onClick={() => onNavigate('etiquetas')} className="flex items-center gap-2 h-10 px-4 bg-white hover:bg-slate-50 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all border-2 border-black shadow-xs">
          + Gerar Etiquetas
        </button>
        <button onClick={() => onNavigate('pedidos')} className="flex items-center gap-2 h-10 px-4 bg-white hover:bg-slate-50 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all border-2 border-black shadow-xs">
          + Novo Pedido
        </button>
        <button onClick={() => onNavigate('transferencias')} className="flex items-center gap-2 h-10 px-4 bg-white hover:bg-slate-50 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all border-2 border-black shadow-xs">
          + Transferência
        </button>
        <button onClick={() => onNavigate('ocorrencias')} className="flex items-center gap-2 h-10 px-4 bg-white hover:bg-slate-50 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all border-2 border-black shadow-xs">
          + Ocorrência
        </button>
        <button onClick={() => onNavigate('armazem3d')} className="flex items-center gap-2 h-10 px-4 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all border-2 border-black shadow-xs">
          ⊞ Armazém 3D
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-black font-sans overflow-hidden relative border-t border-black/10 antialiased">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - P&B Minimalist */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-slate-50 border-r border-black/15 flex flex-col flex-shrink-0 transition-transform duration-200 relative z-10 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-[74px] flex items-center gap-3 px-6 border-b border-black/10">
          <GaidLogo size={42} animated={false} />
          <div>
            <h1 className="font-sans text-lg font-black leading-tight tracking-wider uppercase text-black">LOGISTIX</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Painel Operacional</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1 relative z-10">
          {NAV_GROUPS.map(group => (
            <div key={group.id}>
              {group.items.length === 0 ? (
                <button
                  onClick={() => setActiveNav(group.id)}
                  className={`w-full flex items-center gap-3 h-11 px-4 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${
                    activeNav === group.id
                      ? 'bg-black text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-black'
                  }`}
                >
                  <group.icon size={16} />
                  {group.label}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center gap-3 h-11 px-4 rounded-lg transition-all text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 hover:text-black ${
                      expandedGroups[group.id] ? 'text-black font-black' : ''
                    }`}
                  >
                    <group.icon size={16} />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronRight
                      size={12}
                      className={`transition-transform ${expandedGroups[group.id] ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {expandedGroups[group.id] && (
                    <div className="ml-3.5 space-y-1 border-l-2 border-black/10 pl-3.5">
                      {group.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => setActiveNav(item.id)}
                          className={`w-full flex items-center gap-3 h-9 px-3.5 rounded-md transition-all text-xs font-bold ${
                            activeNav === item.id
                              ? 'bg-black text-white'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-black'
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

        <div className="mx-4 my-4 p-3 flex items-center gap-3 rounded-xl border border-black/10 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=dddddd`}
            alt="avatar" className="w-8 h-8 rounded-full border border-black/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate text-black">{user?.full_name || user?.name || 'Admin'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WMS Admin</p>
          </div>
          <button onClick={signOut} className="text-slate-400 hover:text-black transition-colors p-1">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content Pane - White background */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-white relative z-10">
        {activeNav === 'dashboard' ? (
          <>
            <header className="h-[74px] flex items-center justify-between px-6 flex-shrink-0 gap-4 border-b border-black/10 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center text-black hover:bg-slate-50 flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                <div className="min-w-0">
                  <h2 className="font-sans text-xl lg:text-2xl font-black uppercase tracking-tight text-black">Logistix WMS</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{t('Controle operacional de suprimentos e transportes')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center bg-slate-50 rounded-lg h-10 w-[260px] px-3 border-2 border-black">
                  <Search size={16} className="text-slate-400 mr-2" />
                  <input type="text" placeholder="Buscar no sistema..." className="bg-transparent border-none outline-none text-black text-xs w-full font-bold placeholder:text-slate-400" />
                </div>
                <div className="relative flex-shrink-0">
                  <button onClick={() => setNotificacaoOpen(!notificacaoOpen)} className="w-10 h-10 rounded-lg border-2 border-black bg-white flex items-center justify-center text-black hover:bg-slate-50 transition-all relative">
                    <Bell size={16} />
                    {ocorrenciasAbertas > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white">
                        {ocorrenciasAbertas}
                      </span>
                    )}
                  </button>
                  <NotificationCenter open={notificacaoOpen} onClose={() => setNotificacaoOpen(false)} />
                </div>
              </div>
            </header>

            <div className="px-6 py-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <QuickActions onNavigate={setActiveNav} />
                <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-wider cursor-pointer">
                  <Calendar size={14} />
                  <span>{dataLabel}</span>
                  <ChevronDown size={12} />
                </div>
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {kpisLoading ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-50 border-2 border-black/10 rounded-xl h-[130px]" />
                )) : (
                  <>
                    <KpiCard title="Pedidos Totais" value={kpis?.total ?? 0} icon={Package} color="#000000" trend="+18.2%" onClick={() => setActiveNav('pedidos')} />
                    <KpiCard title="Entregas Concluídas" value={kpis?.concluidas ?? 0} icon={CheckCircle} color="#000000" trend="+22.7%" onClick={() => setActiveNav('entregas')} />
                    <KpiCard title="Atrasos" value={kpis?.atrasos ?? 0} icon={AlertTriangle} color="#000000" trend="-15.3%" onClick={() => setActiveNav('pedidos')} />
                    <KpiCard title="Taxa de Entrega" value={`${kpis?.taxa ?? 0}%`} icon={Percent} color="#000000" trend="+5.7%" onClick={() => setActiveNav('relatorios')} />
                    <KpiCard title="Receita Mensal" value={`¥ ${Number(kpis?.receita_mensal || 0).toLocaleString('ja-JP')}`} icon={DollarSign} color="#000000" trend="+18.2%" onClick={() => setActiveNav('relatorios')} />
                    <KpiCard title="Lucro Mensal" value={`¥ ${Number(kpis?.lucro_mensal || 0).toLocaleString('ja-JP')}`} icon={TrendingUp} color="#000000" trend={`${kpis?.margem || '0'}%`} onClick={() => setActiveNav('relatorios')} />
                  </>
                )}
              </div>

              {/* Operations Charts & CD occupancy */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Status das Entregas</h3>
                  <div className="relative h-[180px] flex items-center justify-center min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" strokeWidth={0}>
                          {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#ffffff', border: '2px solid #000000', borderRadius: 8, color: '#000' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-black text-black">{totalPedidos}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                    </div>
                  </div>
                  <div className="space-y-3 mt-4">
                    {donutData.map((d, i) => (
                      <div key={d.name} className="flex items-center text-xs font-bold text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full mr-2.5" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="flex-1">{d.name}</span>
                        <span className="text-black font-black">{d.value} ({totalPedidos > 0 ? ((d.value / totalPedidos) * 100).toFixed(1) : 0}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Performance no Prazo</h3>
                  <div className="h-[180px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performance || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="data" tick={{ fill: '#000000', fontSize: 10, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#000000', fontSize: 10, fontWeight: 'bold' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '2px solid #000000', borderRadius: 8, color: '#000' }} />
                        <Line type="monotone" dataKey="no_prazo" stroke="#000000" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="atrasadas" stroke="#9CA3AF" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="w-4 h-0.5 bg-black" /> No prazo</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="w-4 h-0.5 bg-slate-400" /> Em atraso</div>
                  </div>
                </div>

                <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Capacidade dos CDs</h3>
                  <div className="space-y-4">
                    {CD_list.map(a => (
                      <button key={a.nome} onClick={() => { setActiveNav('armazem3d'); }} className="w-full text-left group">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 group-hover:text-black transition-colors">
                          <span className="flex items-center gap-1">
                            <span className="text-slate-300 group-hover:text-black transition-colors">›</span>
                            {a.nome}
                          </span>
                          <span className="text-black font-black">{a.pct}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 border border-black/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500 bg-black" style={{ width: `${a.pct}%` }} />
                        </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setActiveNav('armazem3d')} className="w-full mt-5 h-10 rounded-lg border-2 border-black bg-white text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Ver galpões em 3D</button>
                </div>
              </div>

              {/* Activity feeds */}
              <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Feed de Eventos Operacionais</h3>
                <div className="space-y-1">
                  {atividadeFeed.length === 0 ? (
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider py-6 text-center">Nenhum evento registrado</p>
                  ) : (
                    atividadeFeed.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 border-b border-black/5 last:border-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-black flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-black">{item.label}</p>
                          <p className="text-[11px] text-slate-500 font-bold">{item.desc}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-shrink-0">{item.hora}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Orders table */}
              <div className="bg-white border-2 border-black rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Remessas Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left divide-y divide-black/10">
                    <thead><tr>
                      {['Código', 'Cliente', 'Origem CD', 'Destino', 'Status', 'Previsão'].map(h => (
                        <th key={h} className="text-xs font-black text-black uppercase tracking-wider pb-3">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-black/5">
                      {(recentOrders || []).slice(0, 5).map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setActiveNav('pedidos'); setDetailPedidoId(row.codigo || row.id); }}>
                          <td className="py-3 pr-4 text-xs font-black text-black">{row.codigo}</td>
                          <td className="py-3 pr-4 text-xs text-slate-600 font-bold">{row.cliente}</td>
                          <td className="py-3 pr-4 text-xs text-slate-500 font-medium">{row.origem}</td>
                          <td className="py-3 pr-4 text-xs text-slate-500 font-medium">{row.destino_cidade} - {row.destino_estado}</td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 text-black border border-black/10">
                              {STATUS_LABEL[row.status] || row.status}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-slate-500 font-medium">{row.previsao}</td>
                        </tr>
                      ))}
                      {(!recentOrders || recentOrders.length === 0) && (
                        <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-wider">Nenhum pedido recente</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="text-center mt-5">
                  <button onClick={() => setActiveNav('pedidos')} className="text-xs font-black text-slate-500 hover:text-black uppercase tracking-widest transition-all">Ver todas as remessas</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto bg-white">
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
            {activeNav === 'terceiros' && <TerceirosPage />}
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
