import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useI18n } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';
import { 
  Users, DollarSign, Star, Truck, Sparkles, 
  ArrowRight, ShieldAlert, LogOut 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, signOut } = useAuthStore();
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
    <div className="min-h-screen bg-[#050508] text-white p-6 md:p-10">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            {t('Painel de Controle Admin')}
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            {t('Bem-vindo de volta,')} <span className="font-semibold text-white">{user.name || user.email}</span>. {t('Aqui está a visão geral da plataforma.')}
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-sm font-semibold transition-all"
        >
          <LogOut size={16} />
          {t('Sair')}
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t('Total de Usuários'), value: stats.usersCount, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { title: t('Transações'), value: stats.transactionsCount, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
            { title: t('Avaliações'), value: stats.reviewsCount, icon: Star, color: 'from-amber-500 to-orange-500' },
            { title: t('Envios Pendentes'), value: stats.pendingDeliveries, icon: Truck, color: 'from-violet-500 to-purple-500' }
          ].map((card, idx) => (
            <div key={idx} className="relative group overflow-hidden bg-slate-900/40 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-white/10 hover:translate-y-[-2px]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 font-medium">{card.title}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10 text-white`}>
                  <card.icon size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold mt-4 tracking-tight">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-slate-800 rounded animate-pulse" />
                ) : (
                  card.value.toLocaleString()
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Action Shortcuts Grid */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-slate-300 tracking-wide">{t('Gerenciamento da Plataforma')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Manage Logistix (Special highlight) */}
            <Link 
              to="/admin/logistix"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/60 hover:translate-y-[-4px] md:col-span-2 lg:col-span-1"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500/20 transition-all">
                  <Truck size={24} />
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {t('Logística')}
                </span>
              </div>
              <h3 className="text-lg font-bold mt-6 text-white group-hover:text-blue-400 transition-colors">
                {t('Gerenciar Logistix')}
              </h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                {t('Acesse o painel completo de WMS, controle de armazéns 3D, emissão de etiquetas Sagawa e rotas GPS.')}
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mt-6">
                <span>{t('Acessar Logística')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Other tools */}
            {[
              {
                to: '/admin/users',
                title: t('Gerenciar Usuários'),
                desc: t('Modere contas de compradores/vendedores, edite permissões, altere roles e verifique cadastros.'),
                icon: Users,
                colorClass: 'text-cyan-400 bg-cyan-500/10'
              },
              {
                to: '/admin/transactions',
                title: t('Gerenciar Transações'),
                desc: t('Acompanhe pagamentos via Stripe, status de entrega, liberação de fundos em custódia e modere disputas.'),
                icon: DollarSign,
                colorClass: 'text-emerald-400 bg-emerald-500/10'
              },
              {
                to: '/admin/reviews',
                title: t('Moderação de Avaliações'),
                desc: t('Monitore as avaliações de reputação dos vendedores e compradores, removendo feedbacks inadequados.'),
                icon: Star,
                colorClass: 'text-amber-400 bg-amber-500/10'
              },
              {
                to: '/admin/image-to-3d',
                title: t('Gerador 3D AI'),
                desc: t('Painel administrativo de renderização e modelagem de peças 2D para modelos interativos 3D.'),
                icon: Sparkles,
                colorClass: 'text-purple-400 bg-purple-500/10'
              }
            ].map((tool, idx) => (
              <Link 
                key={idx}
                to={tool.to}
                className="group bg-slate-900/40 border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-white/10 hover:translate-y-[-4px]"
              >
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl transition-all ${tool.colorClass}`}>
                    <tool.icon size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mt-6 text-white group-hover:text-slate-300 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  {tool.desc}
                </p>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-white text-sm font-semibold mt-6 transition-colors">
                  <span>{t('Gerenciar')}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
