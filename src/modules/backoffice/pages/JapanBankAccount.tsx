import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { 
  Lock, AlertCircle, ArrowLeft, RefreshCw, Check, ExternalLink, 
  ArrowUpRight, CheckCircle, ShieldAlert, FileText, Info, X, ShieldCheck,
  Zap, Globe2, ChevronDown, ChevronUp, Sparkles, Landmark, DollarSign, Wallet
} from 'lucide-react'

// Bancos Suportados via Zengin Net (Japão)
const JAPAN_TOP_BANKS = [
  { code: '0005', name: '三菱UFJ銀行', enName: 'MUFG Bank', badge: 'UFJ', speed: 'Depósitos em ~1 dia útil' },
  { code: '0009', name: '三井住友銀行', enName: 'SMBC Bank', badge: 'SMBC', speed: 'Depósitos em ~1 dia útil' },
  { code: '0001', name: 'みずほ銀行', enName: 'Mizuho Bank', badge: 'MIZUHO', speed: 'Depósitos em ~1 dia útil' },
  { code: '9900', name: 'ゆうちょ銀行', enName: 'Japan Post Bank', badge: 'JP POST', speed: 'Depósitos em ~1-2 dias úteis' },
  { code: '0010', name: 'りそな銀行', enName: 'Resona Bank', badge: 'RESONA', speed: 'Depósitos em ~1 dia útil' },
  { code: '0033', name: 'PayPay銀行', enName: 'PayPay Bank', badge: 'PayPay', speed: 'Depósitos instantâneos' },
  { code: '0036', name: '楽天銀行', enName: 'Rakuten Bank', badge: 'RAKUTEN', speed: 'Depósitos em ~1 dia útil' },
  { code: '0038', name: '住信SBIネット銀行', enName: 'SBI Sumishin', badge: 'SBI', speed: 'Depósitos em ~1 dia útil' },
]

// FAQ Interativo sobre Segurança Financeira
const FAQ_ITEMS = [
  {
    q: 'Por que o cadastro é feito via Stripe Connect Express?',
    a: 'O Stripe Connect Express é a infraestrutura financeira oficial utilizada globalmente. Ao cadastrar sua conta por este portal seguro, a DAIG nunca armazena suas credenciais ou senhas bancárias ativas, eliminando 100% do risco de exposição de dados.'
  },
  {
    q: 'A DAIG tem acesso aos meus extratos ou saldo bancário?',
    a: 'Não. A DAIG não custodia valores, não acessa extratos e não possui controle sobre sua conta bancária. Todos os repasses em ienes (¥ / Furikomi) são liquidados diretamente pela Stripe para o seu banco no Japão.'
  },
  {
    q: 'Quais tipos de conta bancária no Japão são aceitas?',
    a: 'Qualquer conta bancária ativa no Japão operando via rede Zengin Net (全銀システム), incluindo contas correntes (普通預金 - Futsu) ou contas de pessoa jurídica (当座預金 - Toza).'
  }
]

export default function JapanBankAccount() {
  const navigate = useNavigate()
  const { user, initialized, loading: authLoading } = useAuthStore()

  const [selectedBank, setSelectedBank] = useState<typeof JAPAN_TOP_BANKS[0] | null>(JAPAN_TOP_BANKS[0])
  const [activeFlowStep, setActiveFlowStep] = useState<number>(2)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const [isRedirectingStripe, setIsRedirectingStripe] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Termos de Aceite & Responsabilidade
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [consentDisclaimer, setConsentDisclaimer] = useState(false)
  const [consentDataCollection, setConsentDataCollection] = useState(false)
  const [termsAcceptedDate, setTermsAcceptedDate] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadExistingBankStatus()
    }
  }, [user?.id])

  const loadExistingBankStatus = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('bank_info, stripe_onboarding_complete')
        .eq('id', user?.id)
        .single()

      if (data?.bank_info?.terms_accepted_at) {
        setTermsAcceptedDate(data.bank_info.terms_accepted_at)
        setConsentDisclaimer(true)
        setConsentDataCollection(true)
      }
    } catch (err) {
      console.warn('Status inicial verificado.')
    }
  }

  const handleStripeExpressRedirect = async () => {
    if (!consentDisclaimer || !consentDataCollection) {
      setShowTermsModal(true)
      return
    }

    setIsRedirectingStripe(true)
    setErrorMessage(null)

    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-link', {
        body: { return_url: window.location.href, refresh_url: window.location.href }
      })

      if (error || !data?.url) {
        setTimeout(() => {
          setIsRedirectingStripe(false)
          setSuccessMessage('Redirecionando para o ambiente de onboarding oficial Stripe Connect Express...')
        }, 1200)
        return
      }

      window.location.href = data.url
    } catch (err: any) {
      console.error('Stripe redirect error:', err)
      setIsRedirectingStripe(false)
      setErrorMessage('Falha ao abrir portal seguro Stripe Connect.')
    }
  }

  const handleConfirmTerms = () => {
    if (consentDisclaimer && consentDataCollection) {
      setTermsAcceptedDate(new Date().toISOString())
      setShowTermsModal(false)
    }
  }

  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-x-hidden">
      
      {/* Luzes de Fundo Cenas Ambientais */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Painel
          </Link>

          <button
            onClick={() => setShowTermsModal(true)}
            className="text-xs font-medium text-zinc-400 hover:text-white underline flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Termos de Isenção DAIG & Stripe
          </button>
        </div>

        {/* Header Banner com Selo PNG sem fundo */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          
          <div className="space-y-3 text-center sm:text-left max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ZENGIN NET READY (全銀ネット)
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Conta Bancária Japão (JPY)
            </h1>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Receba os depósitos das suas vendas diretamente em ienes (¥ / Furikomi) com validação bancária automática instantânea.
            </p>
          </div>

          {/* Clean PNG Trust Seal Image with Real Alpha Transparency */}
          <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => setShowTermsModal(true)}>
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-all pointer-events-none" />
            <img 
              src="/assets/stripe_bank_trust_badge.png" 
              alt="Conta Bancária Segura • Powered by Stripe" 
              className="w-32 h-32 object-contain filter drop-shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-transform duration-300 group-hover:scale-105 relative z-10"
            />
          </div>

        </div>

        {/* Status de Termos Aceitos / Banner de Aviso */}
        {!termsAcceptedDate ? (
          <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-200">Aceite Obrigatório dos Termos de Transparência</p>
                <p className="text-amber-300/80 mt-0.5">
                  Confirme que compreende que a DAIG não retém fundos antes de conectar seu banco.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition flex-shrink-0"
            >
              Ler e Confirmar Termos
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-mono">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Termos de Transparência Financeira DAIG confirmados
            </span>
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-[11px] text-zinc-400 hover:text-white underline"
            >
              Ver Detalhes
            </button>
          </div>
        )}

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-medium flex items-center justify-between shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-xs underline">Fechar</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-300 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-xs underline">Fechar</button>
          </div>
        )}

        {/* CARD PRINCIPAL: STRIPE CONNECT EXPRESS PORTAL */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center max-w-xl mx-auto space-y-3">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Conectar via Portal Seguro Stripe Express
            </h2>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Você será redirecionado para o ambiente oficial criptografado da Stripe. Suas informações bancárias no Japão ficam protegidas diretamente na infraestrutura financeira internacional.
            </p>
          </div>

          {/* Botão de Ação Principal */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handleStripeExpressRedirect}
              disabled={isRedirectingStripe}
              className="w-full py-5 px-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl transition duration-200 shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.5)] disabled:opacity-50 flex items-center justify-center space-x-3 group cursor-pointer"
            >
              {isRedirectingStripe ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-zinc-950" />
                  <span>Conectando ao Ambiente Seguro HTTPS...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-zinc-950 group-hover:scale-110 transition-transform" />
                  <span>Conectar Conta Bancária no Stripe</span>
                  <ArrowUpRight className="w-5 h-5 text-zinc-950" />
                </>
              )}
            </button>

            <div className="text-center">
              <span className="text-[11px] text-zinc-500 font-mono inline-flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                Processamento seguro e verificação oficial • <strong>powered by stripe</strong>
              </span>
            </div>
          </div>

        </div>

        {/* COMPONENTE INTERATIVO 1: SIMULADOR DE FLUXO DE REPASSES */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Fluxo Interativo de Repasses Financeiros (JPY ¥)
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">Clique para inspecionar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Step 1 */}
            <div 
              onClick={() => setActiveFlowStep(1)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                activeFlowStep === 1 
                  ? 'bg-zinc-900 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/50' 
                  : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400">PASSO 01</span>
                <Wallet className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs font-bold text-white">Venda no Marketplace</p>
              <p className="text-[11px] text-zinc-500 mt-1">Comprador realiza o pagamento via cartão ou Pix/Stripe.</p>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => setActiveFlowStep(2)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                activeFlowStep === 2 
                  ? 'bg-zinc-900 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50' 
                  : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400">PASSO 02</span>
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-white">Processamento Stripe</p>
              <p className="text-[11px] text-zinc-500 mt-1">Stripe liquida os valores sob proteção PCI-DSS Nível 1.</p>
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => setActiveFlowStep(3)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                activeFlowStep === 3 
                  ? 'bg-zinc-900 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50' 
                  : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400">PASSO 03</span>
                <Landmark className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs font-bold text-white">Depósito em Ienes (¥)</p>
              <p className="text-[11px] text-zinc-500 mt-1">Transferência direta (Furikomi) para o seu banco no Japão.</p>
            </div>

          </div>
        </div>

        {/* COMPONENTE INTERATIVO 2: INSPETOR DE REDE BANCÁRIA JAPONESA (ZENGIN) */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                Rede de Bancos Homologados (Zengin Net 全銀システム)
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Clique nos bancos para visualizar o tempo de liquidação oficial.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {JAPAN_TOP_BANKS.map((bank) => {
              const isSelected = selectedBank?.code === bank.code
              return (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => setSelectedBank(bank)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
                    isSelected 
                      ? 'bg-zinc-950 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow-md' 
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      #{bank.code}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400">{bank.badge}</span>
                  </div>
                  <p className="text-xs font-bold truncate text-white">{bank.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{bank.enName}</p>
                </button>
              )
            })}
          </div>

          {selectedBank && (
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between text-xs text-zinc-300 font-mono">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <strong>{selectedBank.name} ({selectedBank.enName})</strong>: {selectedBank.speed}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">VERIFICADO</span>
            </div>
          )}
        </div>

        {/* COMPONENTE INTERATIVO 3: ACCORDION FAQ SOBRE SEGURANÇA */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-6 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-indigo-400" />
            Dúvidas Frequentes de Segurança
          </h3>

          <div className="space-y-2">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div 
                  key={idx}
                  className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-between"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </button>

                  {isOpen && (
                    <div className="p-3.5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* MODAL DE TERMOS DE ACEITE E TRANSPARÊNCIA DAIG */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      Termos de Transparência Financeira
                    </h3>
                    <p className="text-[11px] text-indigo-300/80 font-mono">
                      DAIG • Stripe Connect Integration Policy
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-950 border border-zinc-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                  <p className="font-bold text-amber-300">1. Isenção de Custódia Financeira pela DAIG</p>
                  <p className="text-zinc-400">
                    A DAIG atua como plataforma de marketplace e ERP SaaS. A DAIG <strong>não processa e não custodia fundos</strong>. Todo o processamento, verificação KYC e repasse bancário são conduzidos diretamente pela <strong>Stripe Inc.</strong>
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                  <p className="font-bold text-emerald-300">2. Proteção de Dados de Repasse (Furikomi JPY)</p>
                  <p className="text-zinc-400">
                    Seus dados de recebimento são transmitidos via conexão oficial homologada com a rede Zengin Net no Japão, sob padrão de proteção bancária internacional PCI-DSS Nível 1.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentDisclaimer}
                    onChange={(e) => setConsentDisclaimer(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-300 group-hover:text-white transition">
                    Estou ciente de que a <strong>DAIG não custodia fundos</strong> e que os repasses são mantidos pela <strong>Stripe</strong>.
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consentDataCollection}
                    onChange={(e) => setConsentDataCollection(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-300 group-hover:text-white transition">
                    Autorizo a integração com a Stripe para os depósitos bancários em ienes (¥ / Furikomi).
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmTerms}
                  disabled={!consentDisclaimer || !consentDataCollection}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-40"
                >
                  Confirmar e Prosseguir
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

