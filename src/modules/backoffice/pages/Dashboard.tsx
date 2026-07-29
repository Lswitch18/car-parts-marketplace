import { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import SafeImage from '@/modules/parts-catalog/components/SafeImage'
import GaidLogo from '@/modules/shared/components/GaidLogo'
import { api } from '@/modules/transactions/api/api'
import { useI18n } from '@/modules/shared/lib/i18n'
import { fetchPostal } from '@/modules/shared/lib/postal'
import { 
  Package, Plus, DollarSign, Eye, MessageCircle, TrendingUp, User, Mail, Phone, MapPin, 
  Save, CreditCard, ExternalLink, Loader2, LayoutDashboard, ShoppingBag, 
  CheckCircle2, Sparkles, Search, Wallet, ChevronRight, ArrowRight, Landmark
} from 'lucide-react'

type TabType = 'overview' | 'products' | 'transactions' | 'stripe' | 'profile'

export default function Dashboard() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, loading: authLoading, initialized, setUser } = useAuthStore()
  const queryClient = useQueryClient()

  // Redirect se não logado
  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [editingProfile, setEditingProfile] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [txFilter, setTxFilter] = useState<'all' | 'sales' | 'purchases'>('all')

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip_code: user?.zip_code || ''
  })
  const [postalLoading, setPostalLoading] = useState(false)

  const handlePostalBlur = useCallback(async () => {
    const raw = profileForm.zip_code.replace(/\D/g, '')
    if (raw.length < 5) return
    setPostalLoading(true)
    const result = await fetchPostal(raw)
    if (result) {
      setProfileForm(prev => ({
        ...prev,
        address: result.fullAddress || prev.address,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }))
    }
    setPostalLoading(false)
  }, [profileForm.zip_code])

  // Stats Query
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

  // Transactions Query
  const { data: transactions = [] } = useQuery({
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
      await api.transactions.update(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['seller-stats'] })
    }
  })

  // Products Query
  const { data: products = [] } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('parts')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      return data || []
    },
    enabled: !!user
  })

  // Profile Stripe Query
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

  // Filtered lists
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products
    const term = productSearch.toLowerCase()
    return products.filter(p => p.title?.toLowerCase().includes(term))
  }, [products, productSearch])

  const filteredTransactions = useMemo(() => {
    if (txFilter === 'sales') return transactions.filter(t => t.seller_id === user?.id)
    if (txFilter === 'purchases') return transactions.filter(t => t.buyer_id === user?.id)
    return transactions
  }, [transactions, txFilter, user?.id])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#07070A] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Principal com Logo DAIG e Estética Neon Azul (#00E5FF) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00E5FF]/20 pb-6 bg-[#0D0D14]/60 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/10">
              <GaidLogo size={46} animated />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Digital A.I. Garage Marketplace
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-[#00E5FF] bg-clip-text text-transparent">
                {t('Painel do Usuário')}
              </h1>
              <p className="text-gray-400 text-xs">
                {t('Bem-vindo de volta')}, <span className="text-white font-semibold">{user.name || user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/create-listing"
              className="inline-flex items-center justify-center gap-2 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-lg shadow-[#00E5FF]/25 transition-all hover:scale-[1.03]"
            >
              <Plus className="w-4 h-4" />
              <span>{t('Nova Listagem')}</span>
            </Link>
          </div>
        </div>

        {/* Navegação por Abas com Tema Neon Azul */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#00E5FF]/20 scrollbar-none">
          {[
            { id: 'overview', label: t('Visão Geral'), icon: LayoutDashboard },
            { id: 'products', label: t('Meus Anúncios'), icon: Package, count: products.length },
            { id: 'transactions', label: t('Transações'), icon: ShoppingBag, count: transactions.length },
            { id: 'stripe', label: t('Recebimentos'), icon: Wallet },
            { id: 'profile', label: t('Meu Perfil'), icon: User },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 shadow-md shadow-[#00E5FF]/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 text-[#00E5FF]" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/10 text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ─── ABA 1: VISÃO GERAL (OVERVIEW) ────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Metric Cards Grid - Neon Cyan Palette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Vendas */}
              <div className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 transition-all space-y-3 group hover:scale-[1.02] shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-1 rounded-full border border-[#00E5FF]/30">
                    JPY ¥
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('Vendas Totais')}</p>
                  <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
                    ¥ {(stats?.totalSales || 0).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>

              {/* Card 2: Anúncios Ativos */}
              <button 
                onClick={() => setActiveTab('products')}
                className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 transition-all text-left space-y-3 group hover:scale-[1.02] shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                    <Package className="w-5 h-5" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('Anúncios Ativos')}</p>
                  <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
                    {stats?.activeProducts || 0}
                  </p>
                </div>
              </button>

              {/* Card 3: Visualizações */}
              <div className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 transition-all space-y-3 group hover:scale-[1.02] shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('Visualizações')}</p>
                  <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
                    {stats?.totalViews || 0}
                  </p>
                </div>
              </div>

              {/* Card 4: Mensagens */}
              <Link 
                to="/messages"
                className="bg-[#0D0D14] border border-[#00E5FF]/20 hover:border-[#00E5FF] rounded-2xl p-5 transition-all block space-y-3 group hover:scale-[1.02] shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  {stats?.unreadMessages ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping" />
                  ) : null}
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('Mensagens Recebidas')}</p>
                  <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
                    {stats?.unreadMessages || 0}
                  </p>
                </div>
              </Link>

            </div>

            {/* Ações Rápidas em Destaque */}
            <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00E5FF]" /> {t('Ações Rápidas Operacionais')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  to="/create-listing"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 border border-[#00E5FF]/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF]">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">{t('Vender Peça JDM')}</p>
                      <p className="text-xs text-gray-400">{t('Cadastrar produto no catálogo')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#00E5FF] transition-colors" />
                </Link>

                <Link
                  to="/messages"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 border border-[#00E5FF]/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF]">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">{t('Chat de Vendas')}</p>
                      <p className="text-xs text-gray-400">{t('Responder compradores')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#00E5FF] transition-colors" />
                </Link>

                <Link
                  to="/rastreio"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 border border-[#00E5FF]/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">{t('Rastreamento WMS')}</p>
                      <p className="text-xs text-gray-400">{t('Consultar entregas Japão')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#00E5FF] transition-colors" />
                </Link>
              </div>
            </div>

            {/* Layout Duplo: Prévias Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Prévia Anúncios Recentes */}
              <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#00E5FF]" /> {t('Anúncios Recentes')}
                  </h3>
                  <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-[#00E5FF] hover:underline flex items-center gap-1">
                    {t('Ver todos')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {products.length > 0 ? (
                  <div className="space-y-3">
                    {products.slice(0, 3).map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 border border-white/5 hover:border-[#00E5FF]/30 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                            <SafeImage src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:text-[#00E5FF] truncate">{p.title}</p>
                            <p className="text-xs text-gray-400">¥ {p.price?.toLocaleString('ja-JP')} • {p.views || 0} views</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                          {p.status === 'active' ? 'Ativo' : p.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">{t('Você ainda não tem anúncios cadastrados.')}</p>
                )}
              </div>

              {/* Prévia Transações Recentes */}
              <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#00E5FF]" /> {t('Transações Recentes')}
                  </h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-xs font-bold text-[#00E5FF] hover:underline flex items-center gap-1">
                    {t('Ver todas')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map(tx => {
                      const isBuyer = tx.buyer_id === user.id
                      return (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                              <SafeImage src={tx.parts?.images?.[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{tx.parts?.title || 'Peça Automotiva'}</p>
                              <p className="text-xs text-gray-400">
                                {isBuyer ? 'Compra' : 'Venda'} • ¥ {tx.amount?.toLocaleString('ja-JP')}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                            {tx.fulfillment_status === 'pending' ? 'Pendente' : tx.fulfillment_status === 'shipped' ? 'Enviado' : 'Concluído'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">{t('Nenhuma transação registrada ainda.')}</p>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ─── ABA 2: MEUS ANÚNCIOS (MY LISTINGS) ──────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{t('Gerenciar Meus Anúncios')}</h2>
                  <p className="text-gray-400 text-xs">{t('Confira e gerencie suas peças anunciadas no marketplace')}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#00E5FF] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('Buscar peça...')}
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white/5 border border-[#00E5FF]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
                    />
                  </div>

                  <Link
                    to="/create-listing"
                    className="inline-flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black px-4 py-2 rounded-xl text-sm font-extrabold transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('Criar Anúncio')}</span>
                  </Link>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 hover:border-[#00E5FF]/40 transition-all group">
                      <div className="aspect-[16/9] rounded-lg bg-black/40 border border-white/10 overflow-hidden relative">
                        <SafeImage src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 backdrop-blur-md">
                          {p.status === 'active' ? 'Ativo' : p.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-semibold text-white group-hover:text-[#00E5FF] transition-colors truncate">{p.title}</h3>
                        <p className="text-[#00E5FF] font-extrabold text-lg font-mono">
                          ¥ {p.price?.toLocaleString('ja-JP')}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-[#00E5FF]" /> {p.views || 0} visualizações
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <Link
                          to={`/product/${p.id}`}
                          className="text-xs font-bold text-[#00E5FF] hover:underline flex items-center gap-1"
                        >
                          Ver no catálogo <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-12 h-12 text-[#00E5FF] mx-auto" />
                  <p className="text-gray-400 text-sm">{t('Nenhuma peça encontrada.')}</p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ─── ABA 3: TRANSAÇÕES (TRANSACTIONS) ────────────────── */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{t('Histórico de Transações')}</h2>
                  <p className="text-gray-400 text-xs">{t('Acompanhe suas compras e vendas com custódia segura DAIG Escrow')}</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'sales', label: 'Minhas Vendas' },
                    { id: 'purchases', label: 'Minhas Compras' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setTxFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        txFilter === f.id
                          ? 'bg-[#00E5FF] text-black shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                  {filteredTransactions.map(tx => {
                    const isBuyer = tx.buyer_id === user.id
                    return (
                      <div key={tx.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00E5FF]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                            <SafeImage src={tx.parts?.images?.[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="text-white font-semibold text-sm truncate">{tx.parts?.title || 'Peça Automotiva'}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="px-2 py-0.5 rounded font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                                {isBuyer ? 'COMPRA' : 'VENDA'}
                              </span>
                              <span>•</span>
                              <span className="text-[#00E5FF] font-bold font-mono">¥ {tx.amount?.toLocaleString('ja-JP')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-xs font-semibold text-gray-400 block">Status de Entrega</span>
                            <span className="text-sm font-bold text-white">
                              {tx.fulfillment_status === 'pending' ? '⏳ Pendente de Envio' : tx.fulfillment_status === 'shipped' ? '🚚 Enviado' : '✅ Entregue & Concluído'}
                            </span>
                          </div>

                          {!isBuyer && tx.fulfillment_status === 'pending' && tx.payment_status === 'escrow' && (
                            <button 
                              onClick={() => updateTransaction.mutate({ id: tx.id, updates: { fulfillment_status: 'shipped' } })}
                              className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#00E5FF]/20"
                            >
                              Marcar como Enviado 🚚
                            </button>
                          )}

                          {isBuyer && tx.fulfillment_status === 'shipped' && (
                            <button 
                              onClick={() => updateTransaction.mutate({ id: tx.id, updates: { fulfillment_status: 'received', payment_status: 'completed' } })}
                              className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#00E5FF]/20"
                            >
                              Confirmar Recebimento 🎉
                            </button>
                          )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#00E5FF] mx-auto" />
                  <p className="text-gray-400 text-sm">{t('Nenhuma transação encontrada nesta categoria.')}</p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ─── ABA 4: RECEBIMENTOS & STRIPE (STRIPE) ───────────── */}
        {activeTab === 'stripe' && (
          <div className="space-y-6">
            <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t('Conta de Recebimentos (Stripe Connect)')}</h2>
                  <p className="text-gray-400 text-xs">{t('Configure sua conta bancária para receber os repasses das suas vendas automaticamente')}</p>
                </div>
              </div>

              {stripeError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {stripeError}
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 max-w-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 font-semibold">Status de Onboarding:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                    {profile?.stripe_onboarding_complete ? '✅ Conta Verificada' : '⏳ Pendente / Incompleto'}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleStripeConnect}
                    disabled={stripeLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black px-5 py-3 rounded-xl font-extrabold text-sm transition-all disabled:opacity-50 shadow-lg shadow-[#00E5FF]/20"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {stripeLoading
                        ? t('Processando...')
                        : profile?.stripe_account_id
                          ? t('Completar Cadastro no Stripe')
                          : t('Conectar Conta Stripe')}
                    </span>
                  </button>

                  {profile?.stripe_account_id && (
                    <button
                      onClick={handleStripePortal}
                      disabled={stripeLoading}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                      <span>{t('Abrir Painel Stripe')}</span>
                    </button>
                  )}

                  <Link
                    to="/bank-account"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                  >
                    <Landmark className="w-5 h-5 text-emerald-400" />
                    <span>Cadastrar Conta Bancária do Japão (振込口座)</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── ABA 5: PERFIL (PROFILE) ─────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{t('Dados do Meu Perfil')}</h2>
                  <p className="text-gray-400 text-xs">{t('Gerencie suas informações pessoais e endereço de entrega no Japão')}</p>
                </div>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-4 py-2 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-xs font-bold text-[#00E5FF] transition-all"
                >
                  {editingProfile ? t('Cancelar') : t('Editar Perfil')}
                </button>
              </div>

              {editingProfile ? (
                <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate() }} className="space-y-5 max-w-xl">
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{t('Nome Completo')}</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-[#00E5FF]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{t('Telefone')}</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-[#00E5FF]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{t('CEP (Código Postal Japão)')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="100-0001"
                        value={profileForm.zip_code}
                        onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })}
                        onBlur={handlePostalBlur}
                        className="w-full px-4 py-2.5 bg-white/5 border border-[#00E5FF]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#00E5FF] pr-10"
                      />
                      {postalLoading && (
                        <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{t('Endereço Completo')}</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-[#00E5FF]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{t('Cidade')}</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-[#00E5FF]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{t('Província / Estado')}</label>
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-[#00E5FF]/30 rounded-xl text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black py-3 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updateProfile.isPending ? t('Salvando...') : t('Salvar Alterações')}</span>
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Nome</span>
                    <p className="text-white font-medium">{user.name || t('Não informado')}</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">E-mail</span>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Telefone</span>
                    <p className="text-white font-medium">{user.phone || t('Não informado')}</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Endereço de Entrega</span>
                    <p className="text-white font-medium">
                      {user.address ? `${user.address}, ${user.city} - ${user.state} (CEP ${user.zip_code || ''})` : t('Não informado')}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  )
}