import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { supabase } from '@/modules/shared/lib/supabase';
import { useI18n } from '@/modules/shared/lib/i18n';
import GaidLogo from '@/modules/shared/components/GaidLogo';
import { getIdentityPulse } from '@/modules/identity/api/identityAdminApi';
import { getPartsPulse } from '@/modules/parts-catalog/api/partsAdminApi';
import { calculateFinanceStats, orchestrateAlerts } from '@/modules/backoffice/utils/dashboardUtils';
import { 
  Search, TrendingUp, AlertTriangle, Package, 
  ShieldAlert, Users, ArrowRight, ArrowUpRight, Plus, Sparkles, Cpu, Wallet, MapPin, CheckCircle2, FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  
  // Bounded Contexts States
  const [financeStats, setFinanceStats] = useState({ gmv: 0, escrow: 0, activeOrders: 0 });
  const [logisticsStats, setLogisticsStats] = useState({ pendingShipments: 0, delayed: 0 });
  const [platformStats, setPlatformStats] = useState({ pending3D: 0, newListings: 0 });
  const [trustStats, setTrustStats] = useState({ pendingKYC: 0, openDisputes: 0, flaggedReviews: 0 });
  const [identityStats, setIdentityStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSuperPulse() {
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

        const alerts = orchestrateAlerts({
          pendingStoreValidations: idPulse.pendingStoreValidations || 0,
          pendingShipments: pendingShip || 0,
          openDisputes: currentTrust.openDisputes,
          flaggedReviews: currentTrust.flaggedReviews,
          t
        });
        setRecentAlerts(alerts);

      } catch (err) {
        console.error("Error fetching super pulse stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSuperPulse();
  }, []);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 md:space-y-8 text-[#EDEDED] font-sans pb-20">
      
      {/* Header Oficial DAIG com Logo e Neon Azul */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00E5FF]/20 pb-6 bg-[#0D0D14]/60 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/10">
            <GaidLogo size={46} animated />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Painel de Operações & Bounded Contexts DAIG
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-[#00E5FF] bg-clip-text text-transparent">
              DAIG Admin Control Center
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Gestão de Vendas, Custódia Escrow, Logística WMS Japão e Motor IA 3D integrados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="text-[#00E5FF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={t("Buscar pedidos, usuários, peças...")}
              className="w-full bg-[#07070A] border border-[#00E5FF]/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] shadow-inner"
            />
          </div>

          <button 
            onClick={() => navigate('/create-listing')}
            className="px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-extrabold text-xs shadow-lg shadow-[#00E5FF]/25 transition-all flex items-center gap-2 shrink-0 hover:scale-[1.03]"
          >
            <Plus size={16} />
            <span>{t('Novo Anúncio')}</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Principais Superiores - Estética Neon Azul Unificada (#00E5FF) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Contexto 1: Financeiro & Escrow */}
        <div 
          onClick={() => navigate('/admin/transactions')}
          className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/25 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Wallet size={20} />
            </div>
            <span className="text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp size={12} /> +18.4%
            </span>
          </div>

          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('Receita & Custódia Escrow')}</p>
          <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
            {loading ? '...' : formatMoney(financeStats.gmv)}
          </p>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Retido em Escrow:</span>
            <span className="font-semibold text-[#00E5FF] font-mono">{loading ? '...' : formatMoney(financeStats.escrow)}</span>
          </div>
        </div>

        {/* Contexto 2: Catálogo & Render 3D */}
        <div 
          onClick={() => navigate('/catalog')}
          className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/25 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Package size={20} />
            </div>
            <ArrowUpRight size={16} className="text-gray-500 group-hover:text-[#00E5FF] transition-colors" />
          </div>

          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('Anúncios JDM & Catálogo')}</p>
          <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
            {loading ? '...' : platformStats.newListings} <span className="text-xs text-gray-400 font-normal">anúncios</span>
          </p>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Render 3D na Fila:</span>
            <span className="font-semibold text-[#00E5FF] font-mono">{platformStats.pending3D} jobs</span>
          </div>
        </div>

        {/* Contexto 3: Vendas & Pedidos */}
        <div 
          onClick={() => navigate('/admin/transactions')}
          className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/25 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">Konbini</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">Card</span>
            </div>
          </div>

          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('Pedidos em Transição')}</p>
          <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
            {loading ? '...' : (financeStats.activeOrders || 2)} <span className="text-xs text-gray-400 font-normal">pedidos</span>
          </p>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Contestações Abertas:</span>
            <span className="font-semibold text-white font-mono">{trustStats.openDisputes}</span>
          </div>
        </div>

        {/* Contexto 4: WMS Logística Japão */}
        <div 
          onClick={() => navigate('/admin/logistix')}
          className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/25 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <MapPin size={20} />
            </div>
            <span className="text-xs text-[#00E5FF] font-semibold flex items-center gap-1">
              Nagoya / Tokyo
            </span>
          </div>

          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('Logística WMS (Envios)')}</p>
          <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
            {loading ? '...' : logisticsStats.pendingShipments} <span className="text-xs text-gray-400 font-normal">envios</span>
          </p>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>Exceções / Atrasos:</span>
            <span className="font-semibold text-[#00E5FF] font-mono">{logisticsStats.delayed}</span>
          </div>
        </div>

      </div>

      {/* Seção Central: Cards Clicáveis com Neon Azul (#00E5FF) */}
      <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00E5FF]" /> {t('Atalhos de Ação Operacional Integrados')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button
            onClick={() => navigate('/create-listing')}
            className="p-4 rounded-xl bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 border border-[#00E5FF]/30 transition-all text-left space-y-2 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">{t('+ Novo Anúncio')}</p>
            <p className="text-xs text-gray-400">{t('Cadastrar peças JDM no catálogo')}</p>
          </button>

          <button
            onClick={() => navigate('/admin/image-to-3d')}
            className="p-4 rounded-xl bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 border border-[#00E5FF]/30 transition-all text-left space-y-2 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu size={20} />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">{t('Scanner de Peças IA')}</p>
            <p className="text-xs text-gray-400">{t('Gerar modelo 3D por imagem')}</p>
          </button>

          <button
            onClick={() => navigate('/admin/logistix')}
            className="p-4 rounded-xl bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 border border-[#00E5FF]/30 transition-all text-left space-y-2 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin size={20} />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">{t('Gestão Logistix WMS')}</p>
            <p className="text-xs text-gray-400">{t('Supervisionar CDs e entregas')}</p>
          </button>

          <button
            onClick={() => navigate('/admin/finance')}
            className="p-4 rounded-xl bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 border border-[#00E5FF]/30 transition-all text-left space-y-2 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">{t('Exportar Relatórios')}</p>
            <p className="text-xs text-gray-400">{t('Balanço financeiro e repasses')}</p>
          </button>

        </div>
      </div>

      {/* Grid Inferior: Bounded Contexts de Usuários & Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contexto: Identidade & Papéis */}
        <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-[#00E5FF]" /> {t('Comunidade & Identidades')}
            </h3>
            <span className="text-xs font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full border border-[#00E5FF]/30">
              {identityStats?.totalUsers || 14} Ativos
            </span>
          </div>

          <div className="space-y-2.5">
            <div 
              onClick={() => navigate('/admin/users')}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Users size={14} className="text-[#00E5FF]" />
                <span className="group-hover:text-white transition-colors">{t('Compradores (B2C)')}</span>
              </div>
              <span className="font-mono text-xs font-bold text-white">{identityStats?.roles?.buyer || 12}</span>
            </div>

            <div 
              onClick={() => navigate('/admin/crm/contacts')}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Users size={14} className="text-[#00E5FF]" />
                <span className="group-hover:text-white transition-colors">{t('Lojas Vendedoras (B2B)')}</span>
              </div>
              <span className="font-mono text-xs font-bold text-[#00E5FF]">{identityStats?.roles?.seller || 0}</span>
            </div>

            <div 
              onClick={() => navigate('/admin/users')}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Users size={14} className="text-[#00E5FF]" />
                <span className="group-hover:text-white transition-colors">{t('Administradores')}</span>
              </div>
              <span className="font-mono text-xs font-bold text-white">{identityStats?.roles?.admin || 2}</span>
            </div>
          </div>
        </div>

        {/* Contexto: Alertas & Reputação */}
        <div className="lg:col-span-2 bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#00E5FF]" /> {t('Central de Alertas Operacionais')}
            </h3>
            <span className="text-xs text-[#00E5FF] font-semibold">Monitoramento Ativo</span>
          </div>

          <div className="space-y-3">
            {recentAlerts.length === 0 && loading && (
              <div className="text-xs text-gray-500 text-center py-6">{t('Sincronizando alertas do sistema...')}</div>
            )}
            {recentAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <AlertTriangle size={16} className="text-[#00E5FF] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{alert.msg}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{alert.ctx}</p>
                  </div>
                </div>

                {alert.action && alert.path && (
                  <button 
                    onClick={() => navigate(alert.path)}
                    className="px-3 py-1 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    {alert.action}
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
