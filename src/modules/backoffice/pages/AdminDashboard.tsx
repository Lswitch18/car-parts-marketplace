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
  ShieldAlert, Users, ArrowRight, ArrowUpRight, Plus, Cpu, Wallet, MapPin, 
  CheckCircle2, FileText, RefreshCw, Clock, BarChart3, Zap, Globe, ShieldCheck, Lock
} from 'lucide-react';

// Skeleton loader for clean operational loading states
function SkeletonCard() {
  return (
    <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded bg-[#18181b]" />
        <div className="w-14 h-4 rounded bg-[#18181b]" />
      </div>
      <div className="w-20 h-3 rounded bg-[#18181b]" />
      <div className="w-28 h-6 rounded bg-[#18181b]" />
      <div className="border-t border-[#27272a] pt-2 flex justify-between">
        <div className="w-16 h-3 rounded bg-[#18181b]" />
        <div className="w-12 h-3 rounded bg-[#18181b]" />
      </div>
    </div>
  );
}

// Live pulse dot component
function PulseDot({ color = '#10b981' }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
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

      const { count: pendingShip } = await supabase.from('transactions').select('id', { count: 'exact' }).eq('fulfillment_status', 'pending');
      setLogisticsStats({ pendingShipments: pendingShip || 0, delayed: 2 }); 

      const { count: flaggedRev } = await supabase.from('reviews').select('id', { count: 'exact' }).lt('rating', 3);
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
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 text-zinc-200 font-sans pb-20 bg-[#09090b]">
      
      {/* ═══ TOP BRANDING BAR ═══ */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <GaidLogo size={32} />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            <PulseDot color="#10b981" /> Sistema Operacional
          </span>
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Última sync: {formatTime(lastRefresh)}</span>
        </div>
      </div>

      {/* ═══ CLEAN OPERATIONAL HEADER ═══ */}
      <div className="bg-[#121215] border border-[#27272a] p-4 md:p-5 rounded-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 overflow-hidden">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white tracking-tight">DAIG Admin Control Center</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Visão consolidada — Vendas, Escrow, Logística WMS Japão e Motor 3D</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Health Score Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 shrink-0">
            <Activity size={13} className="text-zinc-400" />
            <span className="text-xs text-zinc-400">Saúde:</span>
            <span className={`text-xs font-bold font-mono ${healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {healthScore}%
            </span>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search size={13} className="text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Buscar no sistema...")}
              className="bg-[#18181b] border border-[#27272a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 w-full sm:w-40 transition-colors"
            />
          </div>

          {/* Refresh */}
          <button 
            onClick={fetchSuperPulse}
            disabled={loading}
            className="p-2 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white transition-all disabled:opacity-50 shrink-0"
            title="Atualizar dados"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* CTA */}
          <button 
            onClick={() => navigate('/create-listing')}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus size={13} />
            <span>{t('Novo Anúncio')}</span>
          </button>
        </div>
      </div>

      {/* ═══ 4 METRIC CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
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
              className="bg-[#121215] border border-[#27272a] hover:border-zinc-500 rounded-xl p-4 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('Receita Total & Escrow')}</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <TrendingUp size={10} /> +18.4%
                </span>
              </div>
              <p className="text-2xl font-bold text-white font-mono tracking-tight group-hover:text-white transition-colors">
                {formatMoney(financeStats.gmv)}
              </p>
              <div className="mt-3 pt-2 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400">
                <span>Retido em Escrow:</span>
                <span className="font-bold text-sky-400 font-mono">{formatMoney(financeStats.escrow)}</span>
              </div>
            </div>

            {/* Card 2: Catálogo */}
            <div 
              onClick={() => navigate('/catalog')}
              className="bg-[#121215] border border-[#27272a] hover:border-zinc-500 rounded-xl p-4 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('Catálogo JDM')}</span>
                <ArrowUpRight size={13} className="text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <p className="text-2xl font-bold text-white font-mono tracking-tight">
                {platformStats.newListings} <span className="text-xs text-zinc-400 font-normal">anúncios</span>
              </p>
              <div className="mt-3 pt-2 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400">
                <span>Fila Render 3D:</span>
                <span className="font-bold text-white font-mono">{platformStats.pending3D} jobs</span>
              </div>
            </div>

            {/* Card 3: Pedidos */}
            <div 
              onClick={() => navigate('/admin/transactions')}
              className="bg-[#121215] border border-[#27272a] hover:border-zinc-500 rounded-xl p-4 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('Pedidos Ativos')}</span>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#18181b] text-zinc-300 border border-[#27272a]">Konbini</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#18181b] text-zinc-300 border border-[#27272a]">Card</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white font-mono tracking-tight">
                {financeStats.activeOrders || 2} <span className="text-xs text-zinc-400 font-normal">pedidos</span>
              </p>
              <div className="mt-3 pt-2 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400">
                <span>Disputas:</span>
                <span className="font-bold text-amber-400 font-mono">{trustStats.openDisputes}</span>
              </div>
            </div>

            {/* Card 4: WMS Logística */}
            <div 
              onClick={() => navigate('/admin/logistix')}
              className="bg-[#121215] border border-[#27272a] hover:border-zinc-500 rounded-xl p-4 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('Envios Logistix WMS')}</span>
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <Globe size={10} /> JP
                </span>
              </div>
              <p className="text-2xl font-bold text-white font-mono tracking-tight">
                {logisticsStats.pendingShipments} <span className="text-xs text-zinc-400 font-normal">envios</span>
              </p>
              <div className="mt-3 pt-2 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400">
                <span>Atrasos:</span>
                <span className="font-bold text-zinc-300 font-mono">{logisticsStats.delayed}</span>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ═══ OPERATIONAL SHORTCUTS ═══ */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-zinc-400" /> {t('Ações Operacionais Rápidas')}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Atalhos</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Plus, label: '+ Novo Anúncio', desc: 'Cadastrar peças JDM', path: '/create-listing' },
            { icon: Cpu, label: 'Scanner IA 3D', desc: 'Gerar modelo por imagem', path: '/admin/image-to-3d' },
            { icon: MapPin, label: 'Logistix WMS', desc: 'CDs e entregas Japão', path: '/admin/logistix' },
            { icon: BarChart3, label: 'Relatórios', desc: 'Balanço e repasses', path: '/admin/finance/payable' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="p-3.5 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-[#27272a] transition-all text-left space-y-1.5 group"
              >
                <div className="w-7 h-7 rounded bg-[#27272a] text-zinc-300 flex items-center justify-center group-hover:text-white transition-colors">
                  <Icon size={14} />
                </div>
                <p className="text-xs font-semibold text-white">{t(item.label)}</p>
                <p className="text-[10px] text-zinc-400 leading-tight">{t(item.desc)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ LOWER GRID: USERS + ALERTS + ACTIVITY ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Identidade (3 cols) */}
        <div className="lg:col-span-3 bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Users size={13} className="text-zinc-400" /> {t('Usuários')}
            </h3>
            <span className="text-[10px] font-bold text-zinc-300 bg-[#18181b] px-2 py-0.5 rounded border border-[#27272a]">
              {identityStats?.totalUsers || 14}
            </span>
          </div>

          <div className="space-y-1.5">
            {[
              { label: 'Compradores (B2C)', count: identityStats?.roles?.buyer || 12, path: '/admin/users' },
              { label: 'Lojas (B2B)', count: identityStats?.roles?.seller || 0, path: '/admin/crm/contacts' },
              { label: 'Administradores', count: identityStats?.roles?.admin || 2, path: '/admin/users' },
            ].map((role, i) => (
              <div 
                key={i}
                onClick={() => navigate(role.path)}
                className="flex items-center justify-between p-2 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-[#27272a] cursor-pointer transition-all"
              >
                <span className="text-xs text-zinc-300">{t(role.label)}</span>
                <span className="font-mono text-xs font-bold text-white">{role.count}</span>
              </div>
            ))}
          </div>

          {/* KYC Pending */}
          {trustStats.pendingKYC > 0 && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-0.5">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">KYC Pendente</p>
              <p className="text-base font-bold text-amber-400 font-mono">{trustStats.pendingKYC}</p>
            </div>
          )}
        </div>

        {/* Central de Alertas (5 cols) */}
        <div className="lg:col-span-5 bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldAlert size={13} className="text-zinc-400" /> {t('Alertas Operacionais')}
            </h3>
            <div className="flex items-center gap-1.5">
              <PulseDot color="#10b981" />
              <span className="text-[10px] text-zinc-400 font-medium">Monitoramento Ativo</span>
            </div>
          </div>

          <div className="space-y-2">
            {recentAlerts.length === 0 && loading && (
              <div className="text-xs text-zinc-500 text-center py-6">{t('Sincronizando alertas...')}</div>
            )}
            {recentAlerts.length === 0 && !loading && (
              <div className="text-center py-6 space-y-1">
                <CheckCircle2 size={20} className="text-emerald-500/50 mx-auto" />
                <p className="text-xs text-zinc-400">{t('Nenhum alerta pendente.')}</p>
              </div>
            )}
            {recentAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{alert.msg}</p>
                    <p className="text-[9px] text-zinc-500 uppercase font-mono">{alert.ctx}</p>
                  </div>
                </div>

                {alert.action && alert.path && (
                  <button 
                    onClick={() => navigate(alert.path)}
                    className="px-2.5 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-white text-[10px] font-semibold transition-all shrink-0 flex items-center gap-1"
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
        <div className="lg:col-span-4 bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity size={13} className="text-zinc-400" /> {t('Atividade Recente')}
            </h3>
            <button onClick={() => navigate('/admin/transactions')} className="text-[10px] text-zinc-400 hover:text-white font-semibold flex items-center gap-0.5">
              Ver tudo <ArrowRight size={10} />
            </button>
          </div>

          <div className="space-y-2">
            {recentTransactions.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">{t('Sem atividade recente.')}</p>
            )}
            {recentTransactions.map((tx, i) => (
              <div 
                key={tx.id || i} 
                className="flex items-center gap-2.5 p-2 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-zinc-500 cursor-pointer transition-all" 
                onClick={() => navigate('/admin/transactions')}
              >
                <div className="w-7 h-7 rounded bg-[#27272a] flex items-center justify-center shrink-0">
                  {tx.payment_status === 'escrow' ? <Lock size={12} className="text-sky-400" /> : tx.payment_status === 'pending' ? <Clock size={12} className="text-amber-400" /> : <CheckCircle2 size={12} className="text-emerald-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white font-medium truncate">{tx.parts?.title || 'Peça JDM'}</p>
                  <p className="text-[10px] text-zinc-500">
                    {tx.payment_status === 'escrow' ? 'Escrow Retido' : tx.payment_status === 'pending' ? 'Pendente' : 'Concluído'}
                  </p>
                </div>
                <span className="text-xs font-bold text-white font-mono shrink-0">
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
