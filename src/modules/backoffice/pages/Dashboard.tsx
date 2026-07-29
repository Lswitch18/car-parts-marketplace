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
  CheckCircle2, Sparkles, Search, Wallet, ChevronRight, ArrowRight, Landmark,
  ShieldCheck, RefreshCw, X, Tag, SlidersHorizontal, Store
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-6 px-3 sm:px-6 lg:px-8 relative font-sans overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">

        {/* APP NATIVE TOP BAR & USER PROFILE HERO */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            
            {/* Left User Identity */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20">
                  <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-emerald-400" />
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full shadow-sm" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {user.name || user.email?.split('@')[0]}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Vendedor
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[220px] sm:max-w-md">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                to="/create-listing"
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center justify-center space-x-2 group"
              >
                <Plus className="w-4 h-4 text-zinc-950 group-hover:scale-110 transition-transform" />
                <span>+ Anunciar Peça</span>
              </Link>

              <Link
                to="/japan-bank-account"
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 text-amber-400 transition flex items-center justify-center"
                title="Conta Bancária Japão (JPY)"
              >
                <Landmark className="w-5 h-5" />
              </Link>
            </div>

          </div>

          {/* QUICK METRICS HIGHLIGHT RIBBON */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Receita de Vendas</p>
                <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                  ¥ {(stats?.totalSales || 0).toLocaleString('ja-JP')}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Anúncios Ativos</p>
                <p className="text-lg font-mono font-bold text-white mt-0.5">
                  {stats?.activeProducts || 0}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Visualizações</p>
                <p className="text-lg font-mono font-bold text-cyan-400 mt-0.5">
                  {stats?.totalViews || 0}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <Link 
              to="/messages"
              className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition flex items-center justify-between group"
            >
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Mensagens</p>
                <p className="text-lg font-mono font-bold text-amber-300 mt-0.5 group-hover:text-amber-200">
                  {stats?.unreadMessages || 0}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 relative">
                <MessageCircle className="w-4 h-4" />
                {stats?.unreadMessages ? (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ) : null}
              </div>
            </Link>
          </div>

        </div>

        {/* MOBILE SEGMENTED APP NAVIGATION BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sticky top-16 z-30 py-2 bg-zinc-950/80 backdrop-blur-xl">
          {[
            { id: 'overview', label: t('Visão Geral'), icon: LayoutDashboard },
            { id: 'products', label: t('Minhas Peças'), icon: Package, count: products.length },
            { id: 'transactions', label: t('Vendas & Compras'), icon: ShoppingBag, count: transactions.length },
            { id: 'stripe', label: t('Conta Bancária'), icon: Landmark },
            { id: 'profile', label: t('Meu Perfil'), icon: User },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-zinc-950/40 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-300'
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
          <div className="space-y-6 animate-fade-in">
            
            {/* Quick Operational Tiles */}
            <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Ações Rápidas de Vendedor
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <Link
                  to="/create-listing"
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Anunciar Peça JDM</p>
                      <p className="text-[10px] text-zinc-500">Cadastrar no catálogo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                </Link>

                <Link
                  to="/japan-bank-account"
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-amber-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Conta Japão (Furikomi)</p>
                      <p className="text-[10px] text-zinc-500">Configurar depósitos JPY</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-300 transition-colors" />
                </Link>

                <Link
                  to="/messages"
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">Chat com Compradores</p>
                      <p className="text-[10px] text-zinc-500">Responder perguntas</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-300 transition-colors" />
                </Link>

              </div>
            </div>

            {/* Split Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Products Preview */}
              <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" /> Seus Anúncios Recentes
                  </h3>
                  <button 
                    onClick={() => setActiveTab('products')} 
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    Ver todas <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {products.length > 0 ? (
                  <div className="space-y-2.5">
                    {products.slice(0, 4).map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/40 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                            <SafeImage src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-emerald-400 truncate">{p.title}</p>
                            <p className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">
                              ¥ {p.price?.toLocaleString('ja-JP')} • {p.views || 0} views
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {p.status === 'active' ? 'Ativo' : p.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-zinc-500">
                    Você ainda não possui peças anunciadas.
                  </div>
                )}
              </div>

              {/* Recent Transactions Preview */}
              <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" /> Útimas Vendas & Compras
                  </h3>
                  <button 
                    onClick={() => setActiveTab('transactions')} 
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    Ver histórico <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {transactions.length > 0 ? (
                  <div className="space-y-2.5">
                    {transactions.slice(0, 4).map(tx => {
                      const isBuyer = tx.buyer_id === user.id
                      return (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/40 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                              <SafeImage src={tx.parts?.images?.[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{tx.parts?.title || 'Peça Automotiva'}</p>
                              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                                {isBuyer ? 'COMPRA' : 'VENDA'} • <span className="text-emerald-400 font-bold">¥ {tx.amount?.toLocaleString('ja-JP')}</span>
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                            {tx.fulfillment_status === 'pending' ? 'Pendente' : tx.fulfillment_status === 'shipped' ? 'Enviado' : 'Concluído'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-zinc-500">
                    Nenhuma transação efetuada até o momento.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ─── ABA 2: MINHAS PEÇAS (MY LISTINGS) ───────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Suas Peças no Catálogo</h2>
                  <p className="text-xs text-zinc-400">Gerencie preços, visualizações e status dos seus anúncios</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar peça..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-emerald-500 transition outline-none"
                    />
                  </div>

                  <Link
                    to="/create-listing"
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar</span>
                  </Link>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3 hover:border-emerald-500/40 transition-all group flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="aspect-[16/9] rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                          <SafeImage src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-950/90 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                            {p.status === 'active' ? 'Ativo' : p.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">{p.title}</h3>
                          <p className="text-emerald-400 font-black text-base font-mono">
                            ¥ {p.price?.toLocaleString('ja-JP')}
                          </p>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
                            <Eye className="w-3.5 h-3.5 text-zinc-500" /> {p.views || 0} visualizações
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <Link
                          to={`/product/${p.id}`}
                          className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Ver no Catálogo <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3 text-zinc-500">
                  <Package className="w-10 h-10 mx-auto text-zinc-700" />
                  <p className="text-xs">Nenhuma peça encontrada.</p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ─── ABA 3: VENDAS & COMPRAS (TRANSACTIONS) ───────────── */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">Histórico de Vendas & Compras</h2>
                  <p className="text-xs text-zinc-400">Acompanhe suas negociações e status de entrega</p>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
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
                          ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map(tx => {
                    const isBuyer = tx.buyer_id === user.id
                    return (
                      <div key={tx.id} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                            <SafeImage src={tx.parts?.images?.[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="text-white font-bold text-xs truncate">{tx.parts?.title || 'Peça Automotiva'}</p>
                            <div className="flex items-center gap-2.5 text-[11px] font-mono">
                              <span className="px-2 py-0.5 rounded font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {isBuyer ? 'COMPRA' : 'VENDA'}
                              </span>
                              <span className="text-emerald-400 font-bold">¥ {tx.amount?.toLocaleString('ja-JP')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-zinc-800/80 pt-3 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase">Status</span>
                            <span className="text-xs font-bold text-white">
                              {tx.fulfillment_status === 'pending' ? '⏳ Pendente de Envio' : tx.fulfillment_status === 'shipped' ? '🚚 Enviado' : '✅ Concluído'}
                            </span>
                          </div>

                          {!isBuyer && tx.fulfillment_status === 'pending' && (
                            <button 
                              onClick={() => updateTransaction.mutate({ id: tx.id, updates: { fulfillment_status: 'shipped' } })}
                              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition shadow-md"
                            >
                              Marcar Enviado 🚚
                            </button>
                          )}

                          {isBuyer && tx.fulfillment_status === 'shipped' && (
                            <button 
                              onClick={() => updateTransaction.mutate({ id: tx.id, updates: { fulfillment_status: 'received', payment_status: 'completed' } })}
                              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition shadow-md"
                            >
                              Confirmar Entrega 🎉
                            </button>
                          )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-zinc-500">
                  Nenhuma transação encontrada nesta categoria.
                </div>
              )}

            </div>
          </div>
        )}

        {/* ─── ABA 4: CONTA BANCÁRIA JAPÃO (STRIPE) ─────────────── */}
        {activeTab === 'stripe' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
              
              <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Dados Bancários & Repasses (JPY)</h2>
                  <p className="text-xs text-zinc-400">Configuração para recebimento de vendas no Japão (Furikomi)</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Status no Japão:</span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Zengin Net Ready
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Cadastre seus dados bancários (Código do Banco, Agência e Katakana) para repasses em ienes (¥).
                </p>

                <div className="pt-2">
                  <Link
                    to="/japan-bank-account"
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Landmark className="w-4 h-4 text-zinc-950" />
                    <span>Acessar Cadastro de Conta Bancária Japão</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── ABA 5: PERFIL (PROFILE) ─────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white">Dados Pessoais</h2>
                  <p className="text-xs text-zinc-400">Informações da sua conta de vendedor</p>
                </div>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-emerald-400 hover:text-white transition"
                >
                  {editingProfile ? 'Cancelar' : 'Editar Dados'}
                </button>
              </div>

              {editingProfile ? (
                <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutate() }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">CEP (Código Postal Japão)</label>
                    <input
                      type="text"
                      value={profileForm.zip_code}
                      onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })}
                      onBlur={handlePostalBlur}
                      placeholder="100-0001"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 transition outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-emerald-500 transition outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4 text-zinc-950" />
                    <span>{updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between">
                    <span className="text-zinc-500 font-mono">Nome:</span>
                    <span className="text-white font-bold">{user.name || 'Não informado'}</span>
                  </div>

                  <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between">
                    <span className="text-zinc-500 font-mono">E-mail:</span>
                    <span className="text-white font-bold">{user.email}</span>
                  </div>

                  <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between">
                    <span className="text-zinc-500 font-mono">Telefone:</span>
                    <span className="text-white font-bold">{user.phone || 'Não informado'}</span>
                  </div>

                  <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                    <span className="text-zinc-500 font-mono block">Endereço no Japão:</span>
                    <span className="text-white font-medium block">
                      {user.address ? `${user.address}, ${user.city} - ${user.state} (CEP ${user.zip_code || ''})` : 'Não informado'}
                    </span>
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
Name="text-white font-medium">
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