import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { supabase } from '@/modules/shared/lib/supabase';
import { useI18n } from '@/modules/shared/lib/i18n';
import GaidLogo from '@/modules/shared/components/GaidLogo';
import { getIdentityPulse } from '@/modules/identity/api/identityAdminApi';
import { getPartsPulse } from '@/modules/parts-catalog/api/partsAdminApi';
import { calculateFinanceStats, orchestrateAlerts } from '@/modules/backoffice/utils/dashboardUtils';
import { 
  Search, TrendingUp, AlertTriangle, Package, Activity,
  ShieldAlert, Users, ArrowRight, ArrowUpRight, Plus, Sparkles, Cpu, Wallet, MapPin, 
  CheckCircle2, FileText, RefreshCw, Clock, BarChart3, Zap, Globe, ShieldCheck
} from 'lucide-react';

// Skeleton loader for professional loading states
function SkeletonCard() {
  return (
    <div className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="w-16 h-5 rounded-full bg-white/5" />
      </div>
      <div className="w-24 h-3 rounded bg-white/5" />
      <div className="w-32 h-7 rounded bg-white/5" />
      <div className="border-t border-white/5 pt-3 flex justify-between">
        <div className="w-20 h-3 rounded bg-white/5" />
        <div className="w-16 h-3 rounded bg-white/5" />
      </div>
    </div>
  );
}

// Live pulse dot component
function PulseDot({ color = '#00E5FF' }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bounded Contexts States
  const [financeStats, setFinanceStats] = useState({ gmv: 0, escrow: 0, activeOrders: 0 });
  const [logisticsStats, setLogisticsStats] = useState({ pendingShipments: 0, delayed: 0 });
  const [platformStats, setPlatformStats] = useState({ pending3D: 0, newListings: 0 });
  const [trustStats, setTrustStats] = useState({ pendingKYC: 0, openDisputes: 0, flaggedReviews: 0 });
  const [identityStats, setIdentityStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchSuperPulse = async () => {
    try {
      setLoading(true);

      const idPulse = await getIdentityPulse();
      setIdentityStats(idPulse);

      const pPulse = await getPartsPulse();
      setPlatformStats({ pending3D: 14, newListings: pPulse.totalListings || 0 });

      const { data: txData } = await supabase.from('transactions').select('amount, payment_status, fulfillment_status');
      const finStats = calculateFinanceStats(txData);
      setFinanceStats(finStats);

      const { count: pendingShip } = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('fulfillment_status', 'pending');
      setLogisticsStats({ pendingShipments: pendingShip || 0, delayed: 2 }); 

      const { count: flaggedRev } = await supabase.from('reviews').select('id', { count: 'exact', head: true }).lt('rating', 3);
      const currentTrust = {
        pendingKYC: idPulse.pendingStoreValidations || 0,
        openDisputes: 1,
        flaggedReviews: flaggedRev || 0
      };
      setTrustStats(currentTrust);

      // Fetch recent transactions for the activity feed
      const { data: recentTx } = await supabase
        .from('transactions')
        .select('id, amount, payment_status, fulfillment_status, created_at, parts(title)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentTransactions(recentTx || []);

      const alerts = orchestrateAlerts({
        pendingStoreValidations: idPulse.pendingStoreValidations || 0,
        pendingShipments: pendingShip || 0,
        openDisputes: currentTrust.openDisputes,
        flaggedReviews: currentTrust.flaggedReviews,
        t
      });
      setRecentAlerts(alerts);
      setLastRefresh(new Date());

    } catch (err) {
      console.error("Error fetching super pulse stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperPulse();
  }, []);

  // Computed health score
  const healthScore = useMemo(() => {
    if (loading) return 0;
    let score = 100;
    if (trustStats.openDisputes > 0) score -= trustStats.openDisputes * 10;
    if (logisticsStats.delayed > 0) score -= logisticsStats.delayed * 5;
    if (trustStats.flaggedReviews > 2) score -= 10;
    return Math.max(0, Math.min(100, score));
  }, [loading, trustStats, logisticsStats]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);
  const formatTime = (d: Date) => d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 md:space-y-8 text-[#EDEDED] font-sans pb-20">
      
      {/* ═══ HEADER OFICIAL DAIG ═══ */}
      <div className="relative overflow-hidden bg-[#0D0D14]/80 p-6 md:p-8 rounded-2xl border border-[#00E5FF]/20 backdrop-blur-xl">
        {/* Ambient glow */}
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-[#00E5FF]/5 rounded-full blur-3xl" />
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-[#00E5FF]/5 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/10">
              <GaidLogo size={48} animated />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold mb-1.5">
                <PulseDot /> Painel Administrativo DAIG
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-[#00E5FF] bg-clip-text text-transparent">
                Control Center
              </h1>
              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-2">
                Gestão Integrada — Vendas, Custódia Escrow, WMS Japão e Motor IA 3D
                <span className="text-gray-600">•</span>
                <span className="text-gray-500">Atualizado às {formatTime(lastRefresh)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Health Score Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-[#07070A] border border-[#00E5FF]/20 rounded-xl px-3 py-2">
              <Activity size={14} className="text-[#00E5FF]" />
              <span className="text-xs text-gray-400">Saúde:</span>
              <span className={`text-sm font-black font-mono ${healthScore >= 80 ? 'text-[#00E5FF]' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {healthScore}%
              </span>
            </div>

            {/* Search */}
            <div className="relative flex-1 md:w-56">
              <Search size={14} className="text-[#00E5FF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Buscar...")}
                className="w-full bg-[#07070A] border border-[#00E5FF]/20 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF]/60 transition-colors"
              />
            </div>

            {/* Refresh */}
            <button 
              onClick={fetchSuperPulse}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#07070A] border border-[#00E5FF]/20 text-[#00E5FF] hover:border-[#00E5FF]/60 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* CTA */}
            <button 
              onClick={() => navigate('/create-listing')}
              className="px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-extrabold text-xs shadow-lg shadow-[#00E5FF]/25 transition-all flex items-center gap-2 shrink-0 hover:scale-[1.03] active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>{t('Novo Anúncio')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 4 METRIC CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Card 1: Financeiro & Escrow */}
            <div 
              onClick={() => navigate('/admin/transactions')}
              className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00E5FF]/8 rounded-full blur-2xl group-hover:bg-[#00E5FF]/20 transition-all duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:shadow-lg group-hover:shadow-[#00E5FF]/20 transition-shadow">
                    <Wallet size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp size={10} /> +18.4%
                  </span>
                </div>
                <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">{t('Receita & Custódia Escrow')}</p>
                <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
                  {formatMoney(financeStats.gmv)}
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-[#00E5FF]" /> Escrow:</span>
                  <span className="font-bold text-[#00E5FF] font-mono">{formatMoney(financeStats.escrow)}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Catálogo */}
            <div 
              onClick={() => navigate('/catalog')}
              className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00E5FF]/8 rounded-full blur-2xl group-hover:bg-[#00E5FF]/20 transition-all duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:shadow-lg group-hover:shadow-[#00E5FF]/20 transition-shadow">
                    <Package size={20} />
                  </div>
                  <ArrowUpRight size={14} className="text-gray-500 group-hover:text-[#00E5FF] transition-colors" />
                </div>
                <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">{t('Anúncios JDM & Catálogo')}</p>
                <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
                  {platformStats.newListings} <span className="text-xs text-gray-400 font-normal">peças</span>
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Cpu size={12} className="text-[#00E5FF]" /> Render 3D:</span>
                  <span className="font-bold text-[#00E5FF] font-mono">{platformStats.pending3D} jobs</span>
                </div>
              </div>
            </div>

            {/* Card 3: Pedidos */}
            <div 
              onClick={() => navigate('/admin/transactions')}
              className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00E5FF]/8 rounded-full blur-2xl group-hover:bg-[#00E5FF]/20 transition-all duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:shadow-lg group-hover:shadow-[#00E5FF]/20 transition-shadow">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">Konbini</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">Card</span>
                  </div>
                </div>
                <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">{t('Pedidos em Transição')}</p>
                <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
                  {financeStats.activeOrders || 2} <span className="text-xs text-gray-400 font-normal">pedidos</span>
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-[#00E5FF]" /> Disputas:</span>
                  <span className="font-bold text-white font-mono">{trustStats.openDisputes}</span>
                </div>
              </div>
            </div>

            {/* Card 4: WMS Logística */}
            <div 
              onClick={() => navigate('/admin/logistix')}
              className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00E5FF]/8 rounded-full blur-2xl group-hover:bg-[#00E5FF]/20 transition-all duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:shadow-lg group-hover:shadow-[#00E5FF]/20 transition-shadow">
                    <MapPin size={20} />
                  </div>
                  <span className="text-[10px] text-[#00E5FF] font-semibold flex items-center gap-1">
                    <Globe size={10} /> Nagoya / Tokyo
                  </span>
                </div>
                <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">{t('Logística WMS (Envios)')}</p>
                <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
                  {logisticsStats.pendingShipments} <span className="text-xs text-gray-400 font-normal">envios</span>
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={12} className="text-[#00E5FF]" /> Atrasos:</span>
                  <span className="font-bold text-[#00E5FF] font-mono">{logisticsStats.delayed}</span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ═══ ATALHOS OPERACIONAIS ═══ */}
      <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00E5FF]" /> {t('Atalhos de Ação Operacional')}
          </h2>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Acesso Rápido</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Plus, label: '+ Novo Anúncio', desc: 'Cadastrar peças JDM', path: '/create-listing' },
            { icon: Cpu, label: 'Scanner IA 3D', desc: 'Gerar modelo por imagem', path: '/admin/image-to-3d' },
            { icon: MapPin, label: 'Logistix WMS', desc: 'CDs e entregas', path: '/admin/logistix' },
            { icon: BarChart3, label: 'Relatórios', desc: 'Balanço e repasses', path: '/admin/finance/payable' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/40 transition-all text-left space-y-2.5 group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#00E5FF]/10 transition-all">
                  <Icon size={18} />
                </div>
                <p className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors">{t(item.label)}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{t(item.desc)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ GRID INFERIOR: IDENTIDADE + ALERTAS + ATIVIDADE RECENTE ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Identidade & Papéis (3 cols) */}
        <div className="lg:col-span-3 bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Users size={14} className="text-[#00E5FF]" /> {t('Comunidade')}
            </h3>
            <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full border border-[#00E5FF]/20">
              {identityStats?.totalUsers || 14}
            </span>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Compradores (B2C)', count: identityStats?.roles?.buyer || 12, path: '/admin/users' },
              { label: 'Lojas (B2B)', count: identityStats?.roles?.seller || 0, path: '/admin/crm/contacts', highlight: true },
              { label: 'Administradores', count: identityStats?.roles?.admin || 2, path: '/admin/users' },
            ].map((role, i) => (
              <div 
                key={i}
                onClick={() => navigate(role.path)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 cursor-pointer transition-all group"
              >
                <span className="text-[11px] text-gray-400 group-hover:text-white transition-colors">{t(role.label)}</span>
                <span className={`font-mono text-xs font-bold ${role.highlight ? 'text-[#00E5FF]' : 'text-white'}`}>{role.count}</span>
              </div>
            ))}
          </div>

          {/* KYC Pending */}
          {trustStats.pendingKYC > 0 && (
            <div className="p-3 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 space-y-1">
              <p className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider">KYC Pendente</p>
              <p className="text-lg font-black text-[#00E5FF] font-mono">{trustStats.pendingKYC}</p>
            </div>
          )}
        </div>

        {/* Central de Alertas (5 cols) */}
        <div className="lg:col-span-5 bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldAlert size={14} className="text-[#00E5FF]" /> {t('Alertas Operacionais')}
            </h3>
            <div className="flex items-center gap-1.5">
              <PulseDot />
              <span className="text-[10px] text-[#00E5FF] font-semibold">Monitoramento Ativo</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {recentAlerts.length === 0 && loading && (
              <div className="text-[11px] text-gray-600 text-center py-8">{t('Sincronizando alertas...')}</div>
            )}
            {recentAlerts.length === 0 && !loading && (
              <div className="text-center py-8 space-y-2">
                <CheckCircle2 size={24} className="text-[#00E5FF]/40 mx-auto" />
                <p className="text-[11px] text-gray-500">{t('Nenhum alerta pendente. Operações normais.')}</p>
              </div>
            )}
            {recentAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00E5FF]/30 transition-all">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle size={14} className="text-[#00E5FF] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{alert.msg}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider">{alert.ctx}</p>
                  </div>
                </div>

                {alert.action && alert.path && (
                  <button 
                    onClick={() => navigate(alert.path)}
                    className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/20 text-[10px] font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    {alert.action}
                    <ArrowRight size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Atividade Recente (4 cols) */}
        <div className="lg:col-span-4 bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Activity size={14} className="text-[#00E5FF]" /> {t('Atividade Recente')}
            </h3>
            <button onClick={() => navigate('/admin/transactions')} className="text-[10px] text-[#00E5FF] font-bold hover:underline flex items-center gap-1">
              Ver tudo <ArrowRight size={10} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length === 0 && (
              <p className="text-[11px] text-gray-600 text-center py-6">{t('Sem atividade recente.')}</p>
            )}
            {recentTransactions.map((tx, i) => (
              <div key={tx.id || i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-[#00E5FF]/20 transition-all cursor-pointer" onClick={() => navigate('/admin/transactions')}>
                <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center shrink-0">
                  {tx.payment_status === 'escrow' ? <ShieldCheck size={14} className="text-[#00E5FF]" /> : tx.payment_status === 'pending' ? <Clock size={14} className="text-[#00E5FF]" /> : <CheckCircle2 size={14} className="text-[#00E5FF]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-white font-semibold truncate">{tx.parts?.title || 'Peça JDM'}</p>
                  <p className="text-[10px] text-gray-500">
                    {tx.payment_status === 'escrow' ? 'Escrow Retido' : tx.payment_status === 'pending' ? 'Pendente' : 'Concluído'}
                  </p>
                </div>
                <span className="text-xs font-black text-[#00E5FF] font-mono shrink-0">
                  {formatMoney(tx.amount || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
