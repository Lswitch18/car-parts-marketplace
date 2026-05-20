import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Package, Plus, DollarSign, Eye, MessageCircle, TrendingUp, User, Mail, Phone, MapPin, Camera, Save, CreditCard, ExternalLink } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { api } from '../lib/api'
import SimulateSale from '../components/SimulateSale'

export default function Dashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, loading: authLoading, initialized, setUser } = useAuthStore()
  const queryClient = useQueryClient()

  // Redirect se não logado (após inicialização completa)
  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip_code: user?.zip_code || ''
  })

  const { data: stats } = useQuery({
    queryKey: ['seller-stats', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      const [productsRes, ordersRes, messagesRes] = await Promise.all([
        supabase.from('parts').select('id, views, status').eq('seller_id', user.id),
        supabase.from('transactions').select('id, amount').eq('seller_id', user.id),
        supabase.from('messages').select('id').eq('receiver_id', user.id)
      ])

      const products = productsRes.data || []
      const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0)
      const activeProducts = products.filter(p => p.status === 'active').length
      const totalSales = (ordersRes.data || []).reduce((sum, o) => sum + (o.amount || 0), 0)
      const unreadMessages = (messagesRes.data || []).length

      return { totalViews, activeProducts, totalSales, unreadMessages }
    },
    enabled: !!user
  })

  const { data: transactions } = useQuery({
    queryKey: ['my-transactions', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('transactions')
        .select('*, parts(title, images)')
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
      return data || []
    },
    enabled: !!user
  })

  const updateTransaction = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { error } = await supabase.from('transactions').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['seller-stats'] })
    }
  })


  const { data: products } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('parts')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      return data || []
    },
    enabled: !!user
  })

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user')
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.name,
          phone: profileForm.phone,
          address: profileForm.address,
          city: profileForm.city,
          state: profileForm.state,
          cep: profileForm.zip_code
        })
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      setUser({
        ...user,
        name: data.full_name,
        role: data.role,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.cep,
        avatar_url: data.avatar_url
      })
      setEditingProfile(false)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })

  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)

  const { data: profile } = useQuery({
    queryKey: ['profile-stripe', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_onboarding_complete')
        .eq('id', user.id)
        .single()
      return data as { stripe_account_id: string | null; stripe_onboarding_complete: boolean }
    },
    enabled: !!user
  })

  const handleStripeConnect = async () => {
    if (!user) return
    setStripeLoading(true)
    setStripeError(null)
    try {
      if (!profile?.stripe_account_id) {
        const result = await api.stripe.createConnectedAccount(user.id, user.email)
        if (result.account_id) {
          const linkResult = await api.stripe.createAccountLink(result.account_id, user.id)
          if (linkResult.url) window.location.href = linkResult.url
        }
      } else {
        const linkResult = await api.stripe.createAccountLink(profile.stripe_account_id, user.id)
        if (linkResult.url) window.location.href = linkResult.url
      }
    } catch (err: any) {
      setStripeError(err.message)
    } finally {
      setStripeLoading(false)
    }
  }

  const handleStripePortal = async () => {
    if (!user) return
    setStripeLoading(true)
    setStripeError(null)
    try {
      const result = await api.stripe.createPortalSession(user.id)
      if (result.url) window.location.href = result.url
    } catch (err: any) {
      setStripeError(err.message)
    } finally {
      setStripeLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-text">
              {t('Dashboard')}
            </h1>
            <p className="text-text-secondary">{t('Bem-vindo de volta')}, {user.name || user.email}</p>
          </div>
          <Link
            to="/create-listing"
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>{t('Nova Listagem')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/catalog" className="card p-6 hover:border-primary/50 transition-all block group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-text-secondary text-sm">{t('Anúncios Ativos')}</p>
            <p className="text-2xl font-bold text-text group-hover:text-primary transition-colors">{stats?.activeProducts || 0}</p>
          </Link>

          <Link to="/catalog" className="card p-6 hover:border-info/50 transition-all block group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center group-hover:bg-info/30 transition-colors">
                <Eye className="w-6 h-6 text-info" />
              </div>
            </div>
            <p className="text-text-secondary text-sm">{t('Total de Visualizações')}</p>
            <p className="text-2xl font-bold text-text group-hover:text-info transition-colors">{stats?.totalViews || 0}</p>
          </Link>

          <div className="card p-6 hover:border-green-500/50 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-text-secondary text-sm">{t('Vendas Totais')}</p>
            <p className="text-2xl font-bold text-text group-hover:text-green-500 transition-colors">
              ¥ {(stats?.totalSales || 0).toLocaleString('ja-JP')}
            </p>
          </div>

          <Link to="/messages" className="card p-6 hover:border-purple-500/50 transition-all block group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <MessageCircle className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-text-secondary text-sm">{t('Mensagens')}</p>
            <p className="text-2xl font-bold text-text group-hover:text-purple-500 transition-colors">{stats?.unreadMessages || 0}</p>
          </Link>
        </div>

        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-text mb-4">Demonstração - Simular Vendas</h2>
          <SimulateSale />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">{t('Meus Anúncios')}</h2>
                <Link to="/catalog" className="text-primary text-sm hover:underline">
                  {t('Ver todos')}
                </Link>
              </div>

              {products && products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="flex items-center space-x-4 p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-all group"
                    >
                      <div className="w-16 h-16 bg-surface rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-text-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text font-medium group-hover:text-primary transition-colors truncate">{product.title}</h3>
                        <p className="text-text-secondary text-sm">
                          ¥ {product.price.toLocaleString('ja-JP')} • {product.views || 0} visualizações
                        </p>
                      </div>
                      <span className={`badge ${product.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {product.status === 'active' ? 'Ativo' : product.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">{t('Você ainda não tem anúncios')}</p>
                  <Link
                    to="/create-listing"
                    className="text-primary hover:underline"
                  >
                    {t('Criar primeiro anúncio')}
                  </Link>
                </div>
              )}
            </div>
            
            <div className="card p-6 mt-8 border-daig-purple">
              <h2 className="text-xl font-semibold text-text mb-6">Minhas Transações</h2>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((t) => {
                    const isBuyer = t.buyer_id === user.id;
                    const roleText = isBuyer ? 'Compra' : 'Venda';
                    return (
                      <div key={t.id} className="p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                        <Link to={`/product/${t.part_id}`} className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-surface rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {t.parts?.images?.[0] ? (
                              <img src={t.parts.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : <Package className="w-6 h-6 text-text-secondary" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-text font-medium group-hover:text-primary transition-colors truncate">{t.parts?.title || 'Produto'}</p>
                            <p className="text-text-secondary text-sm">
                              {roleText} • ¥ {t.amount?.toLocaleString('ja-JP')}
                            </p>
                          </div>
                        </Link>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">Status: {t.fulfillment_status === 'pending' ? 'Pendente' : t.fulfillment_status === 'shipped' ? 'Enviado' : 'Concluído'}</p>
                          </div>
                          
                          {!isBuyer && t.fulfillment_status === 'pending' && t.payment_status === 'escrow' && (
                            <button 
                              onClick={() => updateTransaction.mutate({ id: t.id, updates: { fulfillment_status: 'shipped' } })}
                              className="bg-daig-blue hover:bg-daig-blue/80 text-white px-4 py-2 rounded text-sm font-medium"
                            >
                              Marcar Enviado
                            </button>
                          )}
                          
                          {isBuyer && t.fulfillment_status === 'shipped' && (
                            <button 
                              onClick={() => updateTransaction.mutate({ id: t.id, updates: { fulfillment_status: 'received', payment_status: 'completed' } })}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
                            >
                              Confirmar Recebimento
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-secondary">Nenhuma transação encontrada</p>
                </div>
              )}
            </div>

          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text">{t('Meu Perfil')}</h2>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="text-primary hover:underline text-sm"
                >
                  {editingProfile ? t('Cancelar') : t('Editar')}
                </button>
              </div>

              {editingProfile ? (
                <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate() }} className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-1">{t('Nome')}</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-1">{t('Telefone')}</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-1">{t('Endereço')}</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-secondary text-sm mb-1">{t('Cidade')}</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-sm mb-1">{t('Estado')}</label>
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-1">{t('CEP')}</label>
                    <input
                      type="text"
                      value={profileForm.zip_code}
                      onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updateProfile.isPending ? t('Salvando...') : t('Salvar')}</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User className="w-10 h-10 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-text-secondary">
                      <User className="w-4 h-4" />
                      <span className="text-text">{user.name || t('Nome não definido')}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-text-secondary">
                      <Mail className="w-4 h-4" />
                      <span className="text-text">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3 text-text-secondary">
                        <Phone className="w-4 h-4" />
                        <span className="text-text">{user.phone}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center space-x-3 text-text-secondary">
                        <MapPin className="w-4 h-4" />
                        <span className="text-text">{user.address}, {user.city} - {user.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-text mb-6">{t('Ações Rápidas')}</h2>
              <div className="space-y-3">
                <Link
                  to="/create-listing"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-background hover:bg-primary/10 transition-colors border border-border"
                >
                  <Plus className="w-5 h-5 text-primary" />
                  <span className="text-text">{t('Nova Listagem')}</span>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-background hover:bg-primary/10 transition-colors border border-border"
                >
                  <MessageCircle className="w-5 h-5 text-info" />
                  <span className="text-text">{t('Mensagens')}</span>
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-background hover:bg-primary/10 transition-colors border border-border"
                >
                  <Package className="w-5 h-5 text-warning" />
                  <span className="text-text">{t('Favoritos')}</span>
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-text mb-4">{t('Recebimentos')}</h2>
              <p className="text-text-secondary text-sm mb-4">
                Configure sua conta para receber pagamentos das vendas diretamente na sua conta bancária.
              </p>
              {stripeError && (
                <p className="text-red-500 text-sm mb-3">{stripeError}</p>
              )}
              <div className="space-y-3">
                <button
                  onClick={handleStripeConnect}
                  disabled={stripeLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>
                    {stripeLoading
                      ? t('Processando...')
                      : profile?.stripe_account_id
                        ? t('Completar cadastro Stripe')
                        : t('Conectar conta Stripe')}
                  </span>
                </button>
                {profile?.stripe_account_id && (
                  <button
                    onClick={handleStripePortal}
                    disabled={stripeLoading}
                    className="w-full flex items-center justify-center space-x-2 border border-border hover:border-primary text-text px-4 py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>{t('Painel Stripe')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}