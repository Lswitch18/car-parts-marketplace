import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { useI18n } from '@/modules/shared/lib/i18n';
import { supabase } from '@/modules/shared/lib/supabase';
import { 
  Users, DollarSign, Star, Truck, Sparkles, 
  ArrowRight, Building2, Calendar, TrendingUp,
  Activity, Package, Server, Database
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [stats, setStats] = useState({
    usersCount: 0,
    transactionsCount: 0,
    reviewsCount: 0,
    pendingDeliveries: 0
  });
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const [usersRes, transRes, reviewsRes, shipRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('transactions').select('id', { count: 'exact', head: true }),
          supabase.from('reviews').select('id', { count: 'exact', head: true }),
          supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('fulfillment_status', 'pending')
        ]);

        setStats({
          usersCount: usersRes.count || 0,
          transactionsCount: transRes.count || 0,
          reviewsCount: reviewsRes.count || 0,
          pendingDeliveries: shipRes.count || 0
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Top Banner (Supabase Style Alert) */}
      <div className="flex items-center justify-between border border-blue-500/20 bg-blue-500/5 rounded-lg p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-full">
            <Activity className="text-blue-400" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#EDEDED]">Platform Status</h3>
            <p className="text-xs text-[#888]">All systems are running smoothly. Last deployment was successful.</p>
          </div>
        </div>
        <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-md">
          View Logs
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium tracking-tight text-white">Project Overview</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-md text-xs font-medium text-[#888]">
            <Calendar size={14} />
            <span>Last 30 Days</span>
          </div>
        </div>
        
        {/* KPI Grid (Vercel + Supabase crisp borders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: t('Total Users'), value: stats.usersCount, max: 10000, suffix: 'Users', icon: Users, spark: 'bg-blue-500' },
              { title: t('Transactions'), value: stats.transactionsCount, max: 5000, suffix: 'TXs', icon: TrendingUp, spark: 'bg-purple-500' },
              { title: t('Reviews'), value: stats.reviewsCount, max: 2000, suffix: 'Reviews', icon: Star, spark: 'bg-emerald-500' },
              { title: t('Deliveries'), value: stats.pendingDeliveries, max: 500, suffix: 'Pending', icon: Package, spark: 'bg-orange-500' }
            ].map((metric, idx) => (
              <div key={idx} className="group flex flex-col p-5 bg-[#161616] border border-[#2A2A2A] rounded-lg hover:border-[#444] transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-[#888]">{metric.title}</span>
                  <metric.icon size={16} className="text-[#555] group-hover:text-[#EDEDED] transition-colors" />
                </div>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-semibold text-white tracking-tight">
                    {loading ? '...' : metric.value.toLocaleString()}
                  </span>
                </div>

                <div className="mt-auto flex items-center gap-3">
                  <div className="flex-1 h-1 bg-[#222] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${metric.spark} transition-all duration-1000 ease-out`}
                      style={{ width: `${loading ? 0 : Math.min(100, (metric.value / metric.max) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#666] uppercase">
                    {Math.min(100, (metric.value / metric.max) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium tracking-tight mb-6 mt-10 text-white flex items-center gap-3">
          <Database className="text-[#888]" size={20} />
          Infrastructure & Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              to: '/admin/logistix',
              title: t('Logistix WMS'),
              desc: t('Full WMS dashboard, 3D warehouse, Sagawa tags and GPS routes.'),
              icon: Truck,
            },
            {
              to: '/admin/users',
              title: t('User Directory'),
              desc: t('Moderate buyers and sellers, edit roles and verify accounts.'),
              icon: Users,
            },
            {
              to: '/admin/transactions',
              title: t('Payments API'),
              desc: t('Track Stripe payments, escrow releases and disputes.'),
              icon: DollarSign,
            },
            {
              to: '/admin/reviews',
              title: t('Reputation System'),
              desc: t('Monitor seller reputation and remove inadequate feedback.'),
              icon: Star,
            },
            {
              to: '/admin/image-to-3d',
              title: t('AI 3D Engine'),
              desc: t('Admin panel for 2D to 3D rendering pipeline.'),
              icon: Server,
            },
            {
              to: '/admin/crm/contacts',
              title: t('CRM Contacts'),
              desc: t('Manage B2B corporate clients and logistics partners.'),
              icon: Building2,
            }
          ].map((tool, idx) => (
            <Link 
              key={idx}
              to={tool.to}
              className="group flex flex-col justify-between h-full bg-[#161616] border border-[#2A2A2A] rounded-lg p-5 hover:border-purple-500/50 hover:bg-[#1A1A1A] transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle hover background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded bg-[#1E1E1E] border border-[#333] text-[#888] group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all">
                    <tool.icon size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-[#EDEDED] group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                </div>
                <p className="text-xs text-[#888] leading-relaxed mb-6 group-hover:text-[#AAA] transition-colors">
                  {tool.desc}
                </p>
              </div>
              
              <div className="flex items-center gap-1 mt-auto relative z-10 text-[11px] font-medium text-[#666] group-hover:text-blue-400 transition-colors uppercase tracking-wider">
                <span>Configure</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      
    </div>
  );
}
