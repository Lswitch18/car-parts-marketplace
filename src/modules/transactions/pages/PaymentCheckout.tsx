import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/modules/shared/lib/supabase'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { api } from '@/modules/transactions/api/api'
import { calculateFees, formatJPY } from '@/modules/transactions/api/fees'
import { useI18n } from '@/modules/shared/lib/i18n'
import { sanitizeInput } from '@/modules/shared/lib/securitySanitizer'
import { 
  CreditCard, Lock, ShieldCheck, Package, 
  ArrowLeft, Check, AlertCircle, Loader2,
  Sparkles, Truck, MapPin, User, Mail, Phone,
  ChevronRight, ShieldAlert, Globe
} from 'lucide-react'
import SafeImage from '@/modules/parts-catalog/components/SafeImage'
import { fetchPostal } from '@/modules/shared/lib/postal'

interface Part {
  id: string
  title: string
  price: number
  images: string[]
  seller_id: string
  status: string
  brands?: { name: string }
  categories?: { name: string }
}

interface Seller {
  id: string
  full_name: string
  avatar_url: string
  rating: number
  is_verified: boolean
  total_sales: number
}

export default function PaymentCheckout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { t, language, setLanguage } = useI18n()
  
  const [step, setStep] = useState<'details' | 'processing' | 'success' | 'error'>('details')
  const [mobileTab, setMobileTab] = useState<'shipping' | 'payment'>('shipping')
  const [errorMessage, setErrorMessage] = useState('')
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [postalLoading, setPostalLoading] = useState(false)

  // Preenche dados do usuário logado se ainda não preenchidos
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        name: prev.name || user.full_name || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

  // Sanitizador Shift-Left de inputs do formulário
  const handleShippingChange = (field: keyof typeof shippingInfo, value: string) => {
    const sanitized = sanitizeInput(value)
    setShippingInfo(prev => ({ ...prev, [field]: sanitized }))
  }

  // Auto-preenchimento de CEP / 郵便番号 (Japão 7 dígitos / Brasil 8 dígitos)
  const handlePostalBlur = useCallback(async () => {
    const raw = shippingInfo.zipCode.replace(/\D/g, '')
    if (raw.length < 5) return
    setPostalLoading(true)
    const result = await fetchPostal(raw)
    if (result) {
      setShippingInfo(prev => ({
        ...prev,
        address: result.street ? sanitizeInput(result.street) : (result.fullAddress ? sanitizeInput(result.fullAddress) : prev.address),
        city: result.city ? sanitizeInput(result.city) : prev.city,
        state: result.state ? sanitizeInput(result.state) : prev.state,
      }))
    }
    setPostalLoading(false)
  }, [shippingInfo.zipCode])

  const { data: part, isLoading } = useQuery({
    queryKey: ['part', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('parts')
        .select('*, brands(name), categories(name)')
        .eq('id', id)
        .single()
      return data as Part
    }
  })

  const { data: seller } = useQuery({
    queryKey: ['seller', part?.seller_id],
    queryFn: async () => {
      if (!part?.seller_id) return null
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, rating, is_verified, total_sales')
        .eq('id', part.seller_id)
        .single()
      return data as Seller
    },
    enabled: !!part?.seller_id
  })

  const urlParams = new URLSearchParams(window.location.search)
  const negotiatedPrice = urlParams.get('price')
  /** ID da mensagem de proposta confirmada — enviado ao backend para validar o preço real */
  const confirmedMessageId = urlParams.get('msg') || undefined
  const finalPrice = negotiatedPrice ? Number(negotiatedPrice) : part?.price
  const fees = part ? calculateFees(finalPrice || part.price) : null

  /** Ref para garantir idempotência client-side */
  const isSubmitting = useRef(false)

  /** Gera chave de idempotência determinística com Web Crypto */
  const buildIdempotencyKey = useCallback(async (): Promise<string | undefined> => {
    if (!user || !id) return undefined
    const raw = [user.id, id, confirmedMessageId ?? 'direct'].join('|')
    try {
      const encoded = new TextEncoder().encode(raw)
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch {
      return btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 64)
    }
  }, [user, id, confirmedMessageId])

  const createTransaction = useMutation({
    mutationFn: async () => {
      if (!user || !part) throw new Error(t('Usuário não autenticado'))

      // Lock de idempotência no cliente
      if (isSubmitting.current) throw new Error(t('Processando...'))
      isSubmitting.current = true

      try {
        const idempotencyKey = await buildIdempotencyKey()

        const fullAddress = [
          shippingInfo.address,
          shippingInfo.number && `${t('Número')} ${shippingInfo.number}`,
          shippingInfo.complement,
        ].filter(Boolean).map(s => sanitizeInput(s)).join(', ')

        const tx: any = await api.transactions.create({
          part_id: part.id,
          amount: finalPrice || part.price,
          shipping: { 
            name: sanitizeInput(shippingInfo.name),
            email: sanitizeInput(shippingInfo.email),
            phone: sanitizeInput(shippingInfo.phone),
            zipCode: sanitizeInput(shippingInfo.zipCode),
            city: sanitizeInput(shippingInfo.city),
            state: sanitizeInput(shippingInfo.state),
            address: fullAddress 
          },
          idempotency_key: idempotencyKey,
          confirmed_message_id: confirmedMessageId,
        })

        return tx.transaction || tx
      } catch (err) {
        isSubmitting.current = false
        throw err
      }
    },
    onSuccess: async (transaction) => {
      setStep('processing')

      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

      if (!stripePublicKey || !stripePublicKey.startsWith('pk_')) {
        throw new Error("Pagamento via Stripe não configurado. Por favor, contate o suporte.")
      }

      const fullAddress = [
        shippingInfo.address,
        shippingInfo.number && `${t('Número')} ${shippingInfo.number}`,
        shippingInfo.complement,
      ].filter(Boolean).map(s => sanitizeInput(s)).join(', ')

      const result = await api.stripe.createCheckout({
        transaction_id: transaction.id,
        part_id: part!.id,
        buyer_id: user!.id,
        seller_id: part!.seller_id,
        amount: finalPrice || part!.price,
        shipping: {
          name: sanitizeInput(shippingInfo.name),
          email: sanitizeInput(shippingInfo.email),
          phone: sanitizeInput(shippingInfo.phone),
          zipCode: sanitizeInput(shippingInfo.zipCode),
          city: sanitizeInput(shippingInfo.city),
          state: sanitizeInput(shippingInfo.state),
          address: fullAddress,
        },
      })

      if (result.url) {
        window.location.href = result.url
        return
      } else {
        throw new Error("Não foi possível gerar a sessão de pagamento do Stripe.")
      }
    },
    onError: (err: any) => {
      isSubmitting.current = false
      setErrorMessage(err?.message ? sanitizeInput(err.message) : t('Erro no Pagamento'))
      setStep('error')
    }
  })

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout/' + id)
    }
  }, [user, navigate, id])

  const isFormValid = Boolean(
    shippingInfo.name.trim() &&
    shippingInfo.email.trim() &&
    shippingInfo.zipCode.trim() &&
    shippingInfo.address.trim() &&
    shippingInfo.city.trim()
  )

  if (isLoading || !part || !fees) {
    return (
      <div className="min-h-screen bg-[#06080F] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
          <Sparkles className="w-6 h-6 text-[#00E5FF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-cyan-400 text-xs font-mono tracking-widest uppercase">{t('Processando...')}</p>
      </div>
    )
  }

  if (part.status === 'sold') {
    return (
      <div className="min-h-screen bg-[#06080F] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(13,117,255,0.15)] backdrop-blur-xl">
          <Package className="w-16 h-16 text-cyan-400/50 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-black text-white mb-2">{t('Produto Indisponível')}</h1>
          <p className="text-slate-400 mb-6 text-sm">{t('Este produto já foi vendido.')}</p>
          <Link to="/catalog" className="inline-flex items-center justify-center min-h-[48px] px-6 bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(13,117,255,0.4)]">
            {t('Voltar ao catálogo')}
          </Link>
        </div>
      </div>
    )
  }

  if (part.seller_id === user?.id) {
    return (
      <div className="min-h-screen bg-[#06080F] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#0B0E17]/90 border border-amber-500/30 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">{t('Compra Inválida')}</h1>
          <p className="text-slate-400 mb-6 text-sm">{t('Você não pode comprar seu próprio produto.')}</p>
          <Link to={`/product/${id}`} className="inline-flex items-center justify-center min-h-[48px] px-6 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-amber-500/10 transition">
            {t('Voltar ao produto')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 py-6 md:py-10 relative overflow-x-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0D75FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 pb-24 lg:pb-10">
        
        {/* Top Header Bar with Language Switcher */}
        <div className="flex items-center justify-between mb-6 border-b border-blue-500/20 pb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-slate-400 hover:text-cyan-300 transition text-sm font-medium min-h-[44px] px-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-cyan-400" /> {t('Voltar')}
          </button>

          {/* Quick Language Toggle */}
          <div className="flex items-center space-x-1.5 bg-[#0B0E17] border border-blue-500/30 rounded-xl p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
            <button
              onClick={() => setLanguage('ja')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${language === 'ja' ? 'bg-[#0D75FF] text-white shadow-[0_0_10px_rgba(13,117,255,0.5)]' : 'text-slate-400 hover:text-white'}`}
            >
              JP 日本語
            </button>
            <button
              onClick={() => setLanguage('pt')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${language === 'pt' ? 'bg-[#0D75FF] text-white shadow-[0_0_10px_rgba(13,117,255,0.5)]' : 'text-slate-400 hover:text-white'}`}
            >
              PT Português
            </button>
          </div>
        </div>

        {/* Page Title & Hi-Tech Badge */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
              <span>DAIG JDM Escrow Checkout</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {t('Finalizar Compra')}
            </h1>
          </div>

          <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-blue-500/10 text-cyan-300 border border-[#00E5FF]/30">
            <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
            <span>SSL 256-bit Encrypted</span>
          </span>
        </div>

        {/* Mobile Step Navigation Bar */}
        {step === 'details' && (
          <div className="flex lg:hidden bg-[#0B0E17] border border-blue-500/30 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMobileTab('shipping')}
              className={`flex-1 min-h-[44px] font-bold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 ${
                mobileTab === 'shipping' 
                  ? 'bg-gradient-to-r from-[#0D75FF] to-blue-600 text-white shadow-[0_0_15px_rgba(13,117,255,0.4)]' 
                  : 'text-slate-400'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('Passo 1: Entrega')}</span>
            </button>
            <button
              onClick={() => setMobileTab('payment')}
              className={`flex-1 min-h-[44px] font-bold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 ${
                mobileTab === 'payment' 
                  ? 'bg-gradient-to-r from-[#0D75FF] to-blue-600 text-white shadow-[0_0_15px_rgba(13,117,255,0.4)]' 
                  : 'text-slate-400'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{t('Passo 2: Pagamento')}</span>
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Left Column: Delivery Form (Visible on desktop or when mobileTab === 'shipping') */}
            <div className={`space-y-6 ${mobileTab === 'shipping' ? 'block' : 'hidden lg:block'}`}>
              
              {/* Shipping Address Card (Japanese Address Layout First) */}
              <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(13,117,255,0.12)] backdrop-blur-xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-blue-500/20 pb-3">
                  <MapPin className="w-5 h-5 text-[#00E5FF]" />
                  <h2 className="text-lg font-bold text-white tracking-wide">{t('Informações de Entrega')}</h2>
                </div>

                <div className="space-y-4">
                  
                  {/* Japanese Postal Code Search (〒 郵便番号) */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-cyan-300 flex items-center space-x-1">
                      <span>〒 {t('CEP (ex: 01001-000)')}</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="100-0001 (〒 7 digits / CEP)" 
                        value={shippingInfo.zipCode} 
                        onChange={(e) => handleShippingChange('zipCode', e.target.value)} 
                        onBlur={handlePostalBlur} 
                        className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition" 
                      />
                      {postalLoading && (
                        <Loader2 className="w-5 h-5 text-[#00E5FF] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  {/* State & City (Prefecture 都道府県 & City 市区町村) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400">{t('Estado')}</label>
                      <input 
                        type="text" 
                        placeholder="東京都 / State" 
                        value={shippingInfo.state} 
                        onChange={(e) => handleShippingChange('state', e.target.value)} 
                        className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400">{t('Cidade')}</label>
                      <input 
                        type="text" 
                        placeholder="千代田区 / City" 
                        value={shippingInfo.city} 
                        onChange={(e) => handleShippingChange('city', e.target.value)} 
                        className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition" 
                      />
                    </div>
                  </div>

                  {/* Street Address (丁目・番地・号) */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400">{t('Endereço (Rua, Avenida, etc.)')}</label>
                    <input 
                      type="text" 
                      placeholder="千代田 1-1 / Street address" 
                      value={shippingInfo.address} 
                      onChange={(e) => handleShippingChange('address', e.target.value)} 
                      className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition" 
                    />
                  </div>

                  {/* Number & Complement (番地 & 建物名・部屋番号) */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400">{t('Número')}</label>
                      <input 
                        type="text" 
                        placeholder="101" 
                        value={shippingInfo.number} 
                        onChange={(e) => handleShippingChange('number', e.target.value)} 
                        className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition font-mono" 
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-mono text-slate-400">{t('Complemento (Apto, bloco, etc.)')}</label>
                      <input 
                        type="text" 
                        placeholder="Apto 302 / Building" 
                        value={shippingInfo.complement} 
                        onChange={(e) => handleShippingChange('complement', e.target.value)} 
                        className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition" 
                      />
                    </div>
                  </div>

                  {/* Recipient Personal Contact Details */}
                  <div className="pt-2 border-t border-blue-500/20 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t('Nome completo')}</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="Patrick Suzuki" 
                        value={shippingInfo.name} 
                        onChange={(e) => handleShippingChange('name', e.target.value)} 
                        className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t('E-mail')}</span>
                        </label>
                        <input 
                          type="email" 
                          placeholder="client@daig.jp" 
                          value={shippingInfo.email} 
                          onChange={(e) => handleShippingChange('email', e.target.value)} 
                          className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition font-mono" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t('Telefone')}</span>
                        </label>
                        <input 
                          type="tel" 
                          placeholder="090-1234-5678" 
                          value={shippingInfo.phone} 
                          onChange={(e) => handleShippingChange('phone', e.target.value)} 
                          className="w-full bg-[#06080F] border border-blue-500/30 rounded-xl px-4 py-3.5 min-h-[48px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] transition font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Mobile Advance Button to Payment Tab */}
              <div className="block lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileTab('payment')}
                  disabled={!isFormValid}
                  className="w-full min-h-[50px] bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition shadow-[0_0_25px_rgba(13,117,255,0.35)] flex items-center justify-center space-x-2 border border-[#00E5FF]/40 active:scale-95"
                >
                  <span>{t('Prosseguir para Pagamento')}</span>
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Security Payment Info Card */}
              <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(13,117,255,0.12)] backdrop-blur-xl">
                <div className="flex items-center space-x-2 border-b border-blue-500/20 pb-3 mb-4">
                  <CreditCard className="w-5 h-5 text-[#00E5FF]" />
                  <h2 className="text-lg font-bold text-white tracking-wide">{t('Pagamento Seguro via Stripe')}</h2>
                </div>

                <div className="p-4 border border-[#00E5FF]/30 bg-blue-950/20 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#00E5FF] flex-shrink-0" />
                    <p className="text-white font-bold text-sm">{t('Métodos de Pagamento JDM')}</p>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {t('Aceita Cartão de Crédito, Lojas de Conveniência (Konbini), Google Pay e Apple Pay. O método de cobrança final em Iene (JPY) será selecionado de forma segura na tela oficial do Stripe.')}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-cyan-300">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">Stripe Escrow</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">Konbini Pay</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">Apple / Google Pay</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Action (Visible on desktop or when mobileTab === 'payment') */}
            <div className={`space-y-6 ${mobileTab === 'payment' ? 'block' : 'hidden lg:block'}`}>
              
              {/* Order Summary Card */}
              <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(13,117,255,0.12)] backdrop-blur-xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-blue-500/20 pb-3">
                  <Package className="w-5 h-5 text-[#00E5FF]" />
                  <h2 className="text-lg font-bold text-white tracking-wide">{t('Resumo do Pedido')}</h2>
                </div>

                <div className="flex items-start space-x-4 p-3 rounded-xl bg-[#06080F] border border-blue-500/20">
                  <div className="w-20 h-20 bg-[#0B0E17] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-blue-500/30">
                    <SafeImage 
                      src={part.images?.[0]} 
                      alt={part.title} 
                      className="w-full h-full object-cover" 
                      fallback={<Package className="w-10 h-10 text-slate-600" />} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-snug line-clamp-2">{part.title}</p>
                    <p className="text-cyan-400 text-xs font-mono mt-1">{part.brands?.name || part.categories?.name || 'JDM Part'}</p>
                  </div>
                </div>

                {/* Financial Breakdowns */}
                <div className="border-t border-blue-500/20 pt-4 space-y-2.5 text-sm">
                  {negotiatedPrice && (
                    <div className="flex justify-between text-emerald-400 text-xs">
                      <span>{t('Preço original')}</span>
                      <span className="line-through font-mono">{formatJPY(part.price)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300">
                    <span>{negotiatedPrice ? t('Preço negociado') : t('Subtotal')}</span>
                    <span className="font-mono text-white font-semibold">{formatJPY(finalPrice || part.price)}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center">
                      <Truck className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                      {t('Envio (Yamato/Sagawa)')}
                    </span>
                    <span className="text-[#00E5FF] font-bold text-xs uppercase tracking-wider">{t('Grátis')}</span>
                  </div>

                  <div className="flex justify-between text-white font-black text-xl pt-3 border-t border-blue-500/30">
                    <span>{t('Total a Pagar')}</span>
                    <span className="text-[#00E5FF] font-mono shadow-cyan-500/20 drop-shadow">{formatJPY(finalPrice || part.price)}</span>
                  </div>

                  <p className="text-slate-400 text-[11px] leading-tight pt-1">
                    {t('* Taxas de serviço e processamento inclusas (cobertas pelo vendedor).')}
                  </p>
                </div>
              </div>

              {/* Seller Information Card */}
              {seller && (
                <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(13,117,255,0.12)] backdrop-blur-xl">
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">{t('Vendedor')}</h2>
                  <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-[#06080F] border border-blue-500/20">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D75FF] to-[#00E5FF] p-0.5 flex-shrink-0 shadow-[0_0_15px_rgba(13,117,255,0.3)]">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#0B0E17] flex items-center justify-center font-bold text-cyan-300">
                          {seller.full_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm flex items-center">
                        {seller.full_name}
                        {seller.is_verified && (
                          <ShieldCheck className="w-4 h-4 text-[#00E5FF] ml-1.5" />
                        )}
                      </p>
                      <p className="text-slate-400 text-xs font-mono mt-0.5">
                        {seller.total_sales || 0} {t('vendas')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Submit Button */}
              <div className="hidden lg:block space-y-3">
                <button 
                  onClick={() => createTransaction.mutate()} 
                  disabled={createTransaction.isPending || !isFormValid}
                  className="w-full min-h-[54px] bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF] hover:opacity-95 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center transition shadow-[0_0_30px_rgba(13,117,255,0.4)] border border-[#00E5FF]/40 cursor-pointer active:scale-95"
                >
                  {createTransaction.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2 text-white" /> 
                      {t('Pagar')} {formatJPY(fees.gross_amount)}
                    </>
                  )}
                </button>

                <p className="text-slate-400 text-xs text-center flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#00E5FF]" /> 
                  <span>{t('Pagamento seguro e garantido')}</span>
                </p>
              </div>

              {/* Shift-Left Security Footer Indicator */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-cyan-400/80 font-mono flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>{t('Informações validadas com segurança Shift-Left')}</span>
                </p>
              </div>

            </div>

          </div>
        )}

        {/* Processing Step Screen */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(13,117,255,0.2)] backdrop-blur-xl text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
              <Lock className="w-8 h-8 text-[#00E5FF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white">{t('Processando Pagamento')}</h2>
            <p className="text-slate-300 text-sm max-w-sm">{t('Aguarde, estamos processando sua transação...')}</p>
          </div>
        )}

        {/* Success Confirmation Screen */}
        {step === 'success' && (
          <div className="py-12 bg-[#0B0E17]/90 border border-emerald-500/30 rounded-2xl p-6 md:p-10 shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-xl text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{t('Pagamento Confirmado!')}</h2>
              <p className="text-slate-300 text-sm">{t('Sua compra foi processada com sucesso.')}</p>
            </div>

            <div className="bg-[#06080F] border border-blue-500/30 p-6 rounded-2xl max-w-md mx-auto text-left space-y-3">
              <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                <span>{t('Próximos passos:')}</span>
              </h3>
              <ol className="list-decimal list-inside text-slate-300 text-xs space-y-2 leading-relaxed">
                <li>{t('Vendedor japonês foi notificado e preparará a peça')}</li>
                <li>{t('Envio direto feito pelo próprio vendedor (Direct Ship)')}</li>
                <li>{t('Você receberá o código de rastreamento no seu painel')}</li>
                <li>{t('Acompanhe a entrega em Minhas Compras')}</li>
                <li>{t('Após receber a peça, confirme a entrega no painel para concluir a transação')}</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
              <Link to="/dashboard" className="flex-1 min-h-[48px] bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] px-6 py-3 rounded-xl font-bold text-white text-xs uppercase tracking-wider flex items-center justify-center shadow-[0_0_20px_rgba(13,117,255,0.4)]">
                {t('Ver minhas compras')}
              </Link>
              <Link to="/catalog" className="flex-1 min-h-[48px] border border-blue-500/40 px-6 py-3 rounded-xl font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center justify-center hover:bg-blue-500/10">
                {t('Continuar comprando')}
              </Link>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {step === 'error' && (
          <div className="py-12 bg-[#0B0E17]/90 border border-rose-500/30 rounded-2xl p-6 md:p-10 shadow-[0_0_40px_rgba(244,63,94,0.2)] backdrop-blur-xl text-center space-y-6 max-w-md mx-auto">
            <ShieldAlert className="w-16 h-16 text-rose-400 mx-auto" />
            <div>
              <h2 className="text-2xl font-black text-white mb-2">{t('Erro no Pagamento')}</h2>
              <p className="text-rose-300/90 text-sm font-mono bg-rose-950/30 p-3 rounded-xl border border-rose-500/20">{errorMessage}</p>
            </div>
            <button 
              onClick={() => setStep('details')} 
              className="min-h-[48px] bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] px-8 py-3 rounded-xl font-bold text-white text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(13,117,255,0.4)]"
            >
              {t('Tentar novamente')}
            </button>
          </div>
        )}

      </div>

      {/* Mobile Sticky Thumb-Zone Action Bar (Fixed at bottom on Mobile devices) */}
      {step === 'details' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D14]/95 border-t border-blue-500/30 backdrop-blur-xl p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-md mx-auto flex items-center justify-between space-x-3">
            <div>
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{t('Total a Pagar')}</p>
              <p className="text-lg font-black text-white font-mono">{formatJPY(fees.gross_amount)}</p>
            </div>

            {mobileTab === 'shipping' ? (
              <button
                type="button"
                onClick={() => setMobileTab('payment')}
                disabled={!isFormValid}
                className="flex-1 min-h-[48px] bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(13,117,255,0.4)] flex items-center justify-center space-x-1.5 border border-[#00E5FF]/40 active:scale-95"
              >
                <span>{t('Prosseguir para Pagamento')}</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => createTransaction.mutate()} 
                disabled={createTransaction.isPending || !isFormValid}
                className="flex-1 min-h-[48px] bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(13,117,255,0.4)] flex items-center justify-center space-x-1.5 border border-[#00E5FF]/40 active:scale-95"
              >
                {createTransaction.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" /> 
                    <span>{t('Pagar')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
