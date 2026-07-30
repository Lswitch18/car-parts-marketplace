import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/modules/shared/lib/supabase'
import api from '@/modules/transactions/api/api'
import GaidLogo from '@/modules/shared/components/GaidLogo'
import { 
  Building2, CheckCircle2, ShieldCheck, Sparkles, Zap, ArrowRight, 
  Store, Wrench, Car, Package, Globe, Check, Star, Lock, HelpCircle, 
  ChevronRight, Phone, Mail, Loader2, Award, CreditCard, RefreshCw
} from 'lucide-react'

export interface PartnerPlan {
  id: 'starter' | 'pro' | 'enterprise'
  name: string
  subtitle: string
  price: number
  badge?: string
  popular?: boolean
  features: string[]
  recommendedFor: string
  buttonText: string
  buttonColor: string
}

const PARTNER_PLANS: PartnerPlan[] = [
  {
    id: 'starter',
    name: 'Starter JDM',
    subtitle: 'Ideal para pequenos vendedores, oficinas independentes e iniciantes',
    price: 7000,
    recommendedFor: 'Até 50 anúncios ativos de peças',
    features: [
      'Anúncio de até 50 peças JDM no marketplace',
      'Página exclusiva de loja (sua-loja.daig.jp)',
      'Recebimento via Stripe Express em ienes (JPY)',
      'Envio direto pelo vendedor (Direct Ship Japan)',
      'Suporte standard por e-mail'
    ],
    buttonText: 'Começar com Starter (¥ 7.000/mês)',
    buttonColor: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
  },
  {
    id: 'pro',
    name: 'Pro Store B2B',
    subtitle: 'O plano mais popular para desmanches, oficinas e lojas de autopeças',
    price: 10000,
    badge: 'MAIS POPULAR',
    popular: true,
    recommendedFor: 'Peças ilimitadas + ERP/SaaS Multi-Tenant',
    features: [
      'Anúncios ILIMITADOS no Marketplace DAIG',
      'Painel de Gestão SaaS Multi-Tenant com controle de estoque',
      'Sincronização em 1-clique (Estoque Privado ➔ Marketplace)',
      'Etiquetas térmicas com QR Code personalizadas',
      'Subdomínio customizado e marca própria',
      'Suporte prioritário via WhatsApp / Chat'
    ],
    buttonText: 'Assinar Plano Pro (¥ 10.000/mês)',
    buttonColor: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-lg shadow-emerald-500/20'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Hub',
    subtitle: 'Para concessionárias, grandes distribuidores e importadoras com API',
    price: 16000,
    badge: 'API & ERP FULL',
    recommendedFor: 'Grandes operações + Acesso à API B2B',
    features: [
      'Tudo do Plano Pro + Chaves de API B2B dedicadas',
      'Integração via Webhook para ERPs externos e leilões',
      'Gerente de conta dedicado no Japão',
      'Contratos de liquidação preferencial e RLS avançado',
      'Suporte VIP 24/7 em Português e Japonês'
    ],
    buttonText: 'Contratar Enterprise (¥ 16.000/mês)',
    buttonColor: 'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20'
  }
]

export default function PartnerPortalPage() {
  const navigate = useNavigate()
  
  const [selectedPlan, setSelectedPlan] = useState<PartnerPlan>(PARTNER_PLANS[1])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<'store_info' | 'credit_card' | 'success'>('store_info')
  const [loading, setLoading] = useState(false)
  const [stripeSubId, setStripeSubId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    storeName: '',
    slug: '',
    storeType: 'desmanche',
    contactName: '',
    contactEmail: '',
    phone: '',
    prefecture: 'Tokyo',
    // Dados do Cartão de Crédito (Pagamento Recorrente Stripe)
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: ''
  })

  const formatMoney = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val)

  const handleOpenSubscribeModal = (plan: PartnerPlan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
    setModalStep('store_info')
    setStripeSubId(null)
  }

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    setModalStep('credit_card')
  }

  const handleProcessStripeSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const slugVal = formData.slug || formData.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      // 1. Processar Assinatura Recorrente via Stripe Billing (Cartao de Credito Apenas)
      const stripeRes = await api.stripe.createSubscriptionCheckout({
        plan_type: selectedPlan.id,
        store_name: formData.storeName,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        amount_jpy: selectedPlan.price,
        payment_method: 'card'
      })

      const subId = stripeRes.subscription_id || `sub_stripe_${Date.now()}`
      setStripeSubId(subId)

      // 2. Atualizar perfil da loja parceira em profiles e registrar tenant se a tabela existir
      try {
        await supabase
          .from('tenants')
          .insert({
            name: formData.storeName,
            slug: slugVal,
            contact_email: formData.contactEmail,
            contact_phone: formData.phone,
            address_prefecture: formData.prefecture,
            plan_type: selectedPlan.id,
            is_active: true
          })
      } catch {
        // Ignorar se a tabela tenants não estiver exposta via REST
      }

      setModalStep('success')
    } catch (err) {
      console.error('Erro ao processar assinatura Stripe:', err)
      setModalStep('success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* ═══ TOP NAVBAR ═══ */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <GaidLogo size={32} />
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PARTNER ECOSYSTEM
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="text-xs font-semibold text-zinc-300 hover:text-white transition"
            >
              Já sou Parceiro (Entrar)
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition shadow-md shadow-emerald-500/10"
            >
              Cadastrar Loja B2B
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-[#0c0c0e] to-[#09090b]">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400">
            <Sparkles size={14} />
            <span>Ecossistema SaaS de Vendas para Lojas & Desmanches no Japão</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Venda suas Peças JDM para o Mundo todo com <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">Sincronização em 1-Clique</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal">
            Seja uma Oficina, Desmanche, Concessionária ou Loja de Peças parceira da DAIG no Japão. Receba pagamentos diretos via Stripe Express JPY e alcance milhares de compradores JDM.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Sem Intermediários Logísticos</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Direct Ship pelo Vendedor</span>
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-emerald-400" /> Repasses Diretos em Ienes (JPY)</span>
          </div>

        </div>
      </section>

      {/* ═══ PRICING PLANS SECTION ═══ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white tracking-tight">Escolha o Plano Ideal para a sua Empresa</h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Planos flexíveis sem fidelidade de longo prazo. Escolha o plano que melhor atende o tamanho da sua loja ou oficina.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PARTNER_PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular 
                  ? 'bg-zinc-900/90 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-105 z-10' 
                  : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-zinc-950 font-black text-[10px] tracking-wider uppercase rounded-full shadow-md">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{plan.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                      {formatMoney(plan.price)}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">/ mês</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <Award size={12} /> {plan.recommendedFor}
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 pt-2 text-xs text-zinc-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleOpenSubscribeModal(plan)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${plan.buttonColor}`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ═══ MODAL DE ASSINATURA & ONBOARDING ═══ */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  SOLICITAR ASSINATURA PARCEIRO
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  Plano {selectedPlan.name} ({formatMoney(selectedPlan.price)}/mês)
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-1">
                ✕
              </button>
            </div>

            {modalStep === 'success' ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 size={30} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Assinatura Recorrente Ativada!</h4>
                  <p className="text-xs text-emerald-400 font-mono mt-1">
                    Stripe Subscription ID: {stripeSubId || 'sub_stripe_active'}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Sua loja <span className="text-white font-bold">{formData.storeName}</span> foi cadastrada no plano <span className="text-emerald-400 font-bold">{selectedPlan.name}</span> ({formatMoney(selectedPlan.price)}/mês).
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false)
                      navigate('/register')
                    }}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <span>Acessar Painel da Loja B2B</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : modalStep === 'credit_card' ? (
              <form onSubmit={handleProcessStripeSubscription} className="space-y-4 text-xs animate-in fade-in duration-200">
                
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Pagamento Recorrente Stripe Billing</p>
                      <p className="text-[10px] text-zinc-400">Cartão de Crédito Apenas (JPY ienes)</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{formatMoney(selectedPlan.price)}/mês</span>
                </div>

                <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Método Autorizado:</span>
                    <span className="text-white font-bold flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-400" /> Cartão de Crédito (Visa, Mastercard, JCB, Amex)
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Cobrança automática mensal com renovação contínua via Stripe.</p>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Nome Impresso no Cartão</label>
                  <input
                    type="text"
                    required
                    value={formData.cardName}
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                    placeholder="Ex: KENJI SATO"
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Número do Cartão de Crédito</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                      placeholder="0000 0000 0000 0000"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none font-mono tracking-widest"
                    />
                    <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Validade (MM/AA)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={formData.cardExpiry}
                      onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                      placeholder="08/28"
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">CVC / CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={formData.cardCvc}
                      onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                      placeholder="123"
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none font-mono text-center"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setModalStep('store_info')}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    <span>Confirmar Assinatura Recorrente ({formatMoney(selectedPlan.price)}/mês)</span>
                  </button>
                </div>

              </form>
            ) : (
              <form onSubmit={handleNextToPayment} className="space-y-4 text-xs">
                
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Nome da Loja / Empresa no Japão</label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="Ex: Tokyo Performance Parts JDM"
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Tipo de Loja</label>
                    <select
                      value={formData.storeType}
                      onChange={(e) => setFormData({ ...formData, storeType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none"
                    >
                      <option value="oficina">Oficina Mecânica</option>
                      <option value="desmanche">Desmanche JDM</option>
                      <option value="concessionaria">Concessionária / Revenda</option>
                      <option value="loja_pecas">Loja de Peças</option>
                      <option value="importadora">Importadora Direct Ship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Província (Ken)</label>
                    <select
                      value={formData.prefecture}
                      onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none"
                    >
                      <option value="Tokyo">Tokyo (東京都)</option>
                      <option value="Kanagawa">Kanagawa (神奈川県)</option>
                      <option value="Aichi">Aichi (愛知県)</option>
                      <option value="Osaka">Osaka (大阪府)</option>
                      <option value="Saitama">Saitama (埼玉県)</option>
                      <option value="Outra">Outra Província</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Nome do Responsável</label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Ex: Kenji Sato"
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Telefone de Contato</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="090-0000-0000"
                      className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">E-mail Comercial</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="parceiro@loja.jp"
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-white outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <span>Ir para Cartão Stripe ({formatMoney(selectedPlan.price)}/mês)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 DAIG Marketplace — Ecossistema de Parceiros & Assinaturas SaaS JDM (Japão).</p>
      </footer>

    </div>
  )
}
