import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { useI18n } from '@/modules/shared/lib/i18n';
import { supabase } from '@/modules/shared/lib/supabase';
import { 
  Users, DollarSign, Star, Truck, Sparkles, 
  ArrowRight, LogOut, Building2, Wallet, Shield
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
    <div className="min-h-screen bg-white text-black p-6 md:p-10 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black uppercase">
            {t('Painel de Controle Admin')}
          </h1>
          <p className="text-slate-600 mt-2 text-sm md:text-base">
            {t('Bem-vindo de volta,')} <span className="font-bold text-black">{user.name || user.email}</span>. {t('Visão geral da plataforma.')}
          </p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-black/80 rounded-lg text-sm font-semibold transition-all border border-black"
        >
          <LogOut size={16} />
          {t('Sair')}
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t('Total de Usuários'), value: stats.usersCount, icon: Users, to: '/admin/users' },
            { title: t('Transações'), value: stats.transactionsCount, icon: DollarSign, to: '/admin/transactions' },
            { title: t('Avaliações'), value: stats.reviewsCount, icon: Star, to: '/admin/reviews' },
            { title: t('Envios Pendentes'), value: stats.pendingDeliveries, icon: Truck, to: '/admin/logistix' }
          ].map((card, idx) => (
            <Link 
              key={idx} 
              to={card.to}
              className="bg-white border-2 border-black rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block cursor-pointer text-left text-black decoration-transparent"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{card.title}</span>
                <div className="p-2 bg-slate-100 text-black rounded-lg border border-black/5">
                  <card.icon size={18} />
                </div>
              </div>
              <p className="text-3xl font-black mt-4 tracking-tight text-black">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-slate-100 rounded animate-pulse" />
                ) : (
                  card.value.toLocaleString()
                )}
              </p>
            </Link>
          ))}
        </div>

        {/* Action Shortcuts Grid */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider mb-6 text-slate-400">{t('Gerenciamento da Plataforma')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Manage Logistix (Special highlight) */}
            <Link 
              to="/admin/logistix"
              className="group bg-black text-white border-2 border-black rounded-xl p-6 transition-all duration-300 hover:bg-white hover:text-black hover:translate-y-[-4px] md:col-span-2 lg:col-span-1"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 group-hover:bg-black/5 text-white group-hover:text-black rounded-lg transition-all border border-white/10 group-hover:border-black/10">
                  <Truck size={24} />
                </div>
                <span className="text-xs bg-white/20 group-hover:bg-black/10 text-white group-hover:text-black font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {t('Logística')}
                </span>
              </div>
              <h3 className="text-xl font-black mt-6 uppercase tracking-tight">
                {t('Gerenciar Logistix')}
              </h3>
              <p className="text-slate-300 group-hover:text-slate-600 text-sm mt-2 leading-relaxed">
                {t('Acesse o painel completo de WMS, controle de armazéns 3D, emissão de etiquetas Sagawa e rotas GPS.')}
              </p>
              <div className="flex items-center gap-2 text-white group-hover:text-black text-sm font-bold mt-6">
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
                icon: Users
              },
              {
                to: '/admin/transactions',
                title: t('Gerenciar Transações'),
                desc: t('Acompanhe pagamentos via Stripe, status de entrega, liberação de fundos em custódia e modere disputas.'),
                icon: DollarSign
              },
              {
                to: '/admin/reviews',
                title: t('Moderação de Avaliações'),
                desc: t('Monitore as avaliações de reputação dos vendedores e compradores, removendo feedbacks inadequados.'),
                icon: Star
              },
              {
                to: '/admin/image-to-3d',
                title: t('Gerador 3D AI'),
                desc: t('Painel administrativo de renderização e modelagem de peças 2D para modelos interativos 3D.'),
                icon: Sparkles
              },
              {
                to: '/admin/crm/contacts',
                title: t('Contatos (CRM)'),
                desc: t('Gerencie clientes corporativos B2B, fornecedores logísticos e parceiros da plataforma.'),
                icon: Building2
              },
              {
                to: '/admin/finance/payable',
                title: t('Contas a Pagar'),
                desc: t('Administre despesas internas operacionais, folha de pagamento e centro de custos.'),
                icon: Wallet
              },
              {
                to: '/admin/transportation/drivers',
                title: t('Motoristas (TMS)'),
                desc: t('Controle biométrico de motoristas, aprovação de CNH e auditoria facial do App Worker.'),
                icon: Shield
              }
            ].map((tool, idx) => (
              <Link 
                key={idx}
                to={tool.to}
                className="group bg-white border-2 border-black rounded-xl p-6 transition-all duration-300 hover:bg-slate-50 hover:translate-y-[-4px]"
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-100 text-black rounded-lg border border-black/10">
                    <tool.icon size={24} />
                  </div>
                </div>
                <h3 className="text-xl font-black mt-6 uppercase tracking-tight text-black">
                  {tool.title}
                </h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  {tool.desc}
                </p>
                <div className="flex items-center gap-2 text-slate-500 group-hover:text-black text-sm font-bold mt-6 transition-colors">
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
