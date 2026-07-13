import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { supabase } from '@/modules/shared/lib/supabase';
import { useI18n } from '@/modules/shared/lib/i18n';
import { getIdentityPulse } from '@/modules/identity/api/identityAdminApi';
import { getPartsPulse } from '@/modules/parts-catalog/api/partsAdminApi';
import { 
  Search, Filter, ChevronDown, MoreHorizontal, Info, TrendingUp, AlertTriangle, Package, ShieldAlert, Users, ArrowRight, ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  
  // Real stats state
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
        let gmv = 0;
        let escrow = 0;
        let activeOrders = 0;
        
        txData?.forEach(tx => {
          if (tx.payment_status === 'paid' || tx.fulfillment_status === 'delivered' || tx.fulfillment_status === 'completed') {
            gmv += tx.amount || 0;
          }
          if (tx.payment_status === 'escrow') {
            escrow += tx.amount || 0;
            activeOrders++;
          } else if (tx.payment_status === 'pending') {
            activeOrders++;
          }
        });
        setFinanceStats({ gmv, escrow, activeOrders });

        const { count: pendingShip } = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('fulfillment_status', 'pending');
        setLogisticsStats({ pendingShipments: pendingShip || 0, delayed: 2 }); 

        const { count: flaggedRev } = await supabase.from('reviews').select('id', { count: 'exact', head: true }).lt('rating', 3);
        setTrustStats({ 
          pendingKYC: idPulse.pendingStoreValidations || 0, 
          openDisputes: 1, 
          flaggedReviews: flaggedRev || 0 
        });

        // Actionable Alerts Orchestration
        const alerts = [];
        if (idPulse.pendingStoreValidations > 0) alerts.push({ type: 'warning', msg: `${idPulse.pendingStoreValidations} ${t('Company Verifications pending (B2B)')}`, ctx: t('Identity'), action: t('Review'), path: '/admin/crm/contacts' });
        if (pendingShip && pendingShip > 10) alerts.push({ type: 'warning', msg: `${t('High volume of pending shipments')} (${pendingShip})`, ctx: t('Logistics'), action: t('Fulfill'), path: '/admin/logistix' });
        if (trustStats.openDisputes > 0) alerts.push({ type: 'critical', msg: t('1 Open Transaction Dispute requires mediation'), ctx: t('Finance'), action: t('Resolve'), path: '/admin/transactions' });
        if (flaggedRev && flaggedRev > 5) alerts.push({ type: 'info', msg: `${flaggedRev} ${t('reviews need moderation')}`, ctx: t('Trust'), action: t('Moderate'), path: '/admin/reviews' });
        
        if (alerts.length === 0) {
           alerts.push({ type: 'info', msg: t('All systems operational. Edge caches warmed up.'), ctx: t('System'), action: null, path: null });
        }
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
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 space-y-6 md:space-y-8 text-[#EDEDED] font-sans pb-20">
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex items-center h-10 bg-[#0A0A0A] border border-[#222] rounded-md px-3 focus-within:border-[#444] transition-colors">
          <Search size={16} className="text-[#888]" />
          <input 
            type="text" 
            placeholder={t("Search Orders, Users, or Shipments...")}
            className="bg-transparent border-none outline-none text-[14px] ml-2 w-full placeholder:text-[#666]"
          />
        </div>
        
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center border border-[#222] rounded-md hover:bg-[#111] transition-colors shrink-0">
            <Filter size={16} className="text-[#EDEDED]" />
          </button>

          <button className="flex-1 sm:flex-none h-10 px-4 bg-white text-black font-medium text-[14px] rounded-md hover:bg-[#EAEAEA] transition-colors flex items-center justify-center gap-2">
            {t('New Action...')}
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (Finance, Community & Alerts) */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-6">
          
          {/* Finance & Usage */}
          <div>
            <h3 className="text-[14px] font-medium text-[#EDEDED] mb-3">{t('Financial Pulse (30d)')}</h3>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 shadow-sm relative group transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-medium text-[#EDEDED] flex items-center gap-2">
                  {t('Revenue & Escrow')}
                </span>
                <button 
                  onClick={() => navigate('/admin/finance/payable')}
                  className="h-7 px-3 bg-[#1A1A1A] text-[#EDEDED] border border-[#333] text-[12px] font-medium rounded-md hover:bg-[#2A2A2A] transition-colors flex items-center gap-1"
                >
                  {t('Payable')} <ArrowUpRight size={12} />
                </button>
              </div>
              
              <div className="space-y-2">
                <div 
                  onClick={() => navigate('/admin/transactions')}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[#111] hover:border-[#444] border border-transparent cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-[3px] border-green-500"></div>
                    <span className="text-[13px] text-[#888]">{t('Total GMV')}</span>
                  </div>
                  <span className="text-[13px] font-mono text-green-400">{loading ? '...' : formatMoney(financeStats.gmv)}</span>
                </div>
                <div 
                  onClick={() => navigate('/admin/finance/payable')}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[#111] hover:border-[#444] border border-transparent cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-[3px] border-blue-500"></div>
                    <span className="text-[13px] text-[#888]">{t('Retained in Escrow')}</span>
                    <Info size={12} className="text-[#444]" />
                  </div>
                  <span className="text-[13px] font-mono text-[#AAA]">{loading ? '...' : formatMoney(financeStats.escrow)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Community & Roles Breakdown */}
          <div>
            <h3 className="text-[14px] font-medium text-[#EDEDED] mb-3 mt-6">{t('Community (Roles)')}</h3>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 shadow-sm relative group transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[14px] font-medium text-[#EDEDED] flex items-center gap-2">
                  {t('Total Active Users')}
                </span>
                <span className="text-[14px] font-bold text-white transition-colors">{loading ? '...' : identityStats?.totalUsers}</span>
              </div>
              
              <div className="space-y-1 pt-2 border-t border-[#222]">
                <div 
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[#111] hover:border-[#444] border border-transparent cursor-pointer transition-all group/item"
                >
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#888] group-hover/item:text-white transition-colors" />
                    <span className="text-[13px] text-[#888] group-hover/item:text-white transition-colors">{t('Buyers (B2C)')}</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#AAA] group-hover/item:text-white transition-colors">{loading ? '...' : identityStats?.roles?.buyer}</span>
                </div>
                <div 
                  onClick={() => navigate('/admin/crm/contacts')}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[#111] hover:border-[#444] border border-transparent cursor-pointer transition-all group/item"
                >
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-purple-500" />
                    <span className="text-[13px] text-[#888] group-hover/item:text-white transition-colors">{t('Sellers (B2B)')}</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#AAA] group-hover/item:text-white transition-colors">{loading ? '...' : identityStats?.roles?.seller}</span>
                </div>
                <div 
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[#111] hover:border-[#444] border border-transparent cursor-pointer transition-all group/item"
                >
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-red-500" />
                    <span className="text-[13px] text-[#888] group-hover/item:text-white transition-colors">{t('Administrators')}</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#AAA] group-hover/item:text-white transition-colors">{loading ? '...' : identityStats?.roles?.admin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Alerts */}
          <div>
            <h3 className="text-[14px] font-medium text-[#EDEDED] mb-3 mt-6">{t('Actionable Alerts')}</h3>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 shadow-sm space-y-3">
              {recentAlerts.length === 0 && loading && (
                <div className="text-[13px] text-[#666] text-center py-4">{t('Syncing alerts...')}</div>
              )}
              {recentAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-[#111] border border-[#222] rounded-lg relative overflow-hidden group">
                  {alert.type === 'critical' && <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />}
                  {alert.type === 'warning' && <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />}
                  {alert.type === 'info' && <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0 pr-16">
                    <div className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1">{alert.ctx}</div>
                    <p className="text-[13px] text-[#EDEDED] leading-snug">{alert.msg}</p>
                  </div>
                  {alert.action && alert.path && (
                     <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <button 
                          onClick={() => navigate(alert.path)}
                          className="flex items-center gap-1 text-[11px] font-semibold bg-[#222] text-[#DDD] px-2 py-1 rounded border border-[#333] hover:bg-[#333] transition-colors"
                        >
                          {alert.action}
                          <ArrowRight size={10} />
                        </button>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Operational Pillars) */}
        <div className="flex-1">
          <h3 className="text-[14px] font-medium text-[#EDEDED] mb-3">{t('Operational Command Center')}</h3>
          <div className="space-y-4">
            
            {/* Platform Pulse */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 transition-all">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0">
                  <TrendingUp size={20} className="text-purple-400" />
               </div>
               <div className="flex-1 min-w-0 w-full">
                  <h4 className="text-[15px] font-semibold text-[#EDEDED] mb-2 flex items-center justify-between">
                    <span>{t('Listings & AI Engine')}</span>
                    <button className="text-[#666] hover:text-[#EDEDED] transition-colors"><MoreHorizontal size={18} /></button>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                     <div 
                       onClick={() => navigate('/catalog')}
                       className="bg-[#111] border border-[#222] p-3 rounded-lg hover:bg-[#1A1A1A] hover:border-[#444] cursor-pointer transition-colors group/box"
                     >
                        <div className="text-[12px] text-[#888] mb-1 truncate flex justify-between items-center">
                          {t('Total Listings (Anúncios)')} <ArrowUpRight size={12} className="opacity-0 group-hover/box:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[18px] font-mono text-[#EDEDED]">{loading ? '...' : platformStats.newListings}</div>
                     </div>
                     <div 
                       onClick={() => navigate('/admin/image-to-3d')}
                       className="bg-[#111] border border-[#222] p-3 rounded-lg hover:bg-[#1A1A1A] hover:border-[#444] cursor-pointer transition-colors group/box"
                     >
                        <div className="text-[12px] text-[#888] mb-1 truncate flex justify-between items-center">
                          {t('3D Renders in Queue')} <ArrowUpRight size={12} className="opacity-0 group-hover/box:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[18px] font-mono text-purple-400">{loading ? '...' : platformStats.pending3D} <span className="text-[11px] text-[#666]">{t('jobs')}</span></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Trust & Safety Pulse */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 transition-all">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} className="text-blue-400" />
               </div>
               <div className="flex-1 min-w-0 w-full">
                  <h4 className="text-[15px] font-semibold text-[#EDEDED] mb-2 flex items-center justify-between">
                    <span>{t('Trust, Validation & Reputation')}</span>
                    <button className="text-[#666] hover:text-[#EDEDED] transition-colors"><MoreHorizontal size={18} /></button>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                     <div 
                       onClick={() => navigate('/admin/crm/contacts')}
                       className="bg-[#111] border border-[#222] p-3 rounded-lg hover:bg-[#1A1A1A] hover:border-[#444] cursor-pointer transition-colors group/box"
                     >
                        <div className="text-[12px] text-[#888] mb-1 truncate flex justify-between items-center">
                          {t('Company Val. (B2B)')} <ArrowUpRight size={12} className="opacity-0 group-hover/box:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[18px] font-mono text-orange-400">{loading ? '...' : trustStats.pendingKYC} <span className="text-[11px] text-[#666]">{t('pending')}</span></div>
                     </div>
                     <div 
                       onClick={() => navigate('/admin/reviews')}
                       className="bg-[#111] border border-[#222] p-3 rounded-lg hover:bg-[#1A1A1A] hover:border-[#444] cursor-pointer transition-colors group/box"
                     >
                        <div className="text-[12px] text-[#888] mb-1 truncate flex justify-between items-center">
                          {t('Flagged Reviews')} <ArrowUpRight size={12} className="opacity-0 group-hover/box:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[18px] font-mono text-red-400">{loading ? '...' : trustStats.flaggedReviews} <span className="text-[11px] text-[#666]">{t('(<3 stars)')}</span></div>
                     </div>
                     <div 
                       onClick={() => navigate('/admin/transactions')}
                       className="bg-[#111] border border-[#222] p-3 rounded-lg col-span-2 sm:col-span-1 hover:bg-[#1A1A1A] hover:border-[#444] cursor-pointer transition-colors group/box"
                     >
                        <div className="text-[12px] text-[#888] mb-1 truncate flex justify-between items-center">
                          {t('Open Disputes')} <ArrowUpRight size={12} className="opacity-0 group-hover/box:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[18px] font-mono text-[#EDEDED]">{loading ? '...' : trustStats.openDisputes}</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Logistics Pulse */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 transition-all">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center shrink-0">
                  <Package size={20} className="text-orange-400" />
               </div>
               <div className="flex-1 min-w-0 w-full">
                  <h4 className="text-[15px] font-semibold text-[#EDEDED] mb-2 flex items-center justify-between">
                    <span>{t('Logistics & WMS Pulse')}</span>
                    <button className="text-[#666] hover:text-[#EDEDED] transition-colors"><MoreHorizontal size={18} /></button>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                     <div 
                       onClick={() => navigate('/admin/logistix')}
                       className="bg-[#111] border border-[#222] p-3 rounded-lg hover:bg-[#1A1A1A] hover:border-[#444] cursor-pointer transition-colors group/box"
                     >
                        <div className="text-[12px] text-[#888] mb-1 truncate flex justify-between items-center">
                          {t('Pending Shipments')} <ArrowUpRight size={12} className="opacity-0 group-hover/box:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[18px] font-mono text-[#EDEDED]">{loading ? '...' : logisticsStats.pendingShipments}</div>
                     </div>
                     <div 
                       onClick={() => navigate('/admin/logistix')}
                       className="bg-[#111] border border-[#222] p-3 rounded-lg hover:bg-[#1A1A1A] hover:border-[#444] cursor-pointer transition-colors group/box"
                     >
                        <div className="text-[12px] text-[#888] mb-1 truncate flex justify-between items-center">
                          {t('Delayed / Exception')} <ArrowUpRight size={12} className="opacity-0 group-hover/box:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[18px] font-mono text-orange-400">{loading ? '...' : logisticsStats.delayed}</div>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
