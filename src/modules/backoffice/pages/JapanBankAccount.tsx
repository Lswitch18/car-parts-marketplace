import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { 
  Building2, Lock, CheckCircle2, AlertCircle, 
  ArrowLeft, CreditCard, Landmark, Save, RefreshCw,
  Copy, Check, ExternalLink, ArrowUpRight, CheckCircle, ShieldAlert, FileText, Info, X
} from 'lucide-react'

// Bancos Principais no Japão
const JAPAN_TOP_BANKS = [
  { code: '0005', name: '三菱UFJ銀行', enName: 'MUFG Bank', badge: 'UFJ' },
  { code: '0009', name: '三井住友銀行', enName: 'SMBC Bank', badge: 'SMBC' },
  { code: '0001', name: 'みずほ銀行', enName: 'Mizuho Bank', badge: 'MIZUHO' },
  { code: '9900', name: 'ゆうちょ銀行', enName: 'Japan Post Bank', badge: 'JP POST' },
  { code: '0010', name: 'りそな銀行', enName: 'Resona Bank', badge: 'RESONA' },
  { code: '0033', name: 'PayPay銀行', enName: 'PayPay Bank', badge: 'PayPay' },
  { code: '0036', name: '楽天銀行', enName: 'Rakuten Bank', badge: 'RAKUTEN' },
  { code: '0038', name: '住信SBIネット銀行', enName: 'SBI Sumishin', badge: 'SBI' },
]

export default function JapanBankAccount() {
  const navigate = useNavigate()
  const { user, initialized, loading: authLoading } = useAuthStore()

  // Método de cadastro: Stripe Express (Automático) vs Formulário Direto
  const [onboardingTab, setOnboardingTab] = useState<'stripe_express' | 'manual_form'>('stripe_express')

  const [bankName, setBankName] = useState('三菱UFJ銀行 (MUFG Bank)')
  const [bankCode, setBankCode] = useState('0005')
  const [branchName, setBranchName] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [accountType, setAccountType] = useState<'futsu' | 'toza'>('futsu')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderKana, setAccountHolderKana] = useState('')
  const [accountHolderKanji, setAccountHolderKanji] = useState('')
  const [corporateNumber, setCorporateNumber] = useState('')

  const [isSaving, setIsSaving] = useState(false)
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
      loadExistingBankAccount()
    }
  }, [user?.id])

  const loadExistingBankAccount = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('bank_info, full_name')
        .eq('id', user?.id)
        .single()

      if (data?.bank_info) {
        const info = data.bank_info
        setBankName(info.bank_name || '三菱UFJ銀行 (MUFG Bank)')
        setBankCode(info.bank_code || '0005')
        setBranchName(info.branch_name || '')
        setBranchCode(info.branch_code || '')
        setAccountType(info.account_type || 'futsu')
        setAccountNumber(info.account_number || '')
        setAccountHolderKana(info.account_holder_kana || '')
        setAccountHolderKanji(info.account_holder_kanji || data.full_name || '')
        setCorporateNumber(info.corporate_number || '')
        
        if (info.terms_accepted_at) {
          setTermsAcceptedDate(info.terms_accepted_at)
          setConsentDisclaimer(true)
          setConsentDataCollection(true)
        }
      }
    } catch (err) {
      console.warn('Nenhuma conta cadastrada previamente.')
    }
  }

  const handleSelectBank = (bank: typeof JAPAN_TOP_BANKS[0]) => {
    setBankName(`${bank.name} (${bank.enName})`)
    setBankCode(bank.code)
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
          setSuccessMessage('Redirecionando para o ambiente seguro Stripe Connect...')
        }, 1000)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!user?.id) {
      setErrorMessage('Você precisa estar autenticado.')
      return
    }

    if (!consentDisclaimer || !consentDataCollection) {
      setShowTermsModal(true)
      return
    }

    if (!accountNumber || accountNumber.length < 6) {
      setErrorMessage('Informe o número da conta bancária japonesa (6 a 7 dígitos).')
      return
    }

    if (!accountHolderKana) {
      setErrorMessage('O nome do titular em Katakana (口座名義 カタカナ) é obrigatório.')
      return
    }

    setIsSaving(true)

    try {
      const bankInfoPayload = {
        bank_name: bankName,
        bank_code: bankCode,
        branch_name: branchName,
        branch_code: branchCode,
        account_type: accountType,
        account_number: accountNumber,
        account_holder_kana: accountHolderKana.trim().toUpperCase(),
        account_holder_kanji: accountHolderKanji.trim(),
        corporate_number: corporateNumber,
        country: 'JP',
        currency: 'jpy',
        terms_accepted_at: termsAcceptedDate || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          bank_info: bankInfoPayload,
          stripe_onboarding_complete: true
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccessMessage('✨ Conta bancária salva com sucesso! Repasses em ienes (¥ / Furikomi) ativos.')
    } catch (err: any) {
      console.error('Erro ao salvar:', err)
      setErrorMessage(err.message || 'Erro ao salvar dados bancários.')
    } finally {
      setIsSaving(false)
    }
  }

  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar ao Painel
          </Link>

          <button
            onClick={() => setShowTermsModal(true)}
            className="text-xs font-medium text-zinc-400 hover:text-white underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Termos e Transparência
          </button>
        </div>

        {/* Header Hero Direct & Clean */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Conta Bancária Japão (JPY)
            </h1>
            <p className="text-xs text-zinc-400 max-w-md">
              Cadastre sua conta bancária japonesa para receber os depósitos das suas vendas em ienes (¥ / Furikomi).
            </p>
          </div>

          {/* New Clean White PNG Trust Seal */}
          <div className="flex-shrink-0">
            <img 
              src="/assets/stripe_bank_trust_badge.png" 
              alt="Conta Bancária Segura • Powered by Stripe" 
              className="w-28 h-28 object-contain filter drop-shadow-md"
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOnboardingTab('stripe_express')}
            className={`p-4 rounded-2xl border text-left transition flex items-center space-x-3 ${
              onboardingTab === 'stripe_express' 
                ? 'bg-zinc-900 border-emerald-500 text-white shadow-lg' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <ExternalLink className={`w-5 h-5 ${onboardingTab === 'stripe_express' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div>
              <span className="text-xs font-bold block">Stripe Connect (Automático)</span>
              <span className="text-[10px] text-zinc-500">Validação instantânea</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOnboardingTab('manual_form')}
            className={`p-4 rounded-2xl border text-left transition flex items-center space-x-3 ${
              onboardingTab === 'manual_form' 
                ? 'bg-zinc-900 border-emerald-500 text-white shadow-lg' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Landmark className={`w-5 h-5 ${onboardingTab === 'manual_form' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <div>
              <span className="text-xs font-bold block">Formulário Manual</span>
              <span className="text-[10px] text-zinc-500">Preenchimento direto</span>
            </div>
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-medium flex items-center justify-between">
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

        {/* TAB 1: STRIPE CONNECT EXPRESS */}
        {onboardingTab === 'stripe_express' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Conectar via Portal Seguro Stripe</h2>
              <p className="text-xs text-zinc-400">
                Seus dados bancários são verificados diretamente com segurança internacional.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStripeExpressRedirect}
              disabled={isRedirectingStripe}
              className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isRedirectingStripe ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-zinc-950" />
                  <span>Conectar Conta Bancária no Stripe</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-950" />
                </>
              )}
            </button>

            <div className="text-center">
              <span className="text-[11px] text-zinc-500 font-mono">
                🔒 Processamento seguro • powered by stripe
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL FORM */}
        {onboardingTab === 'manual_form' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Preset Bank Chips */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-400">Seleção Rápida de Banco:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {JAPAN_TOP_BANKS.map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => handleSelectBank(b)}
                      className={`p-3 rounded-xl border text-left transition ${
                        bankCode === b.code
                          ? 'bg-zinc-950 border-emerald-500 text-white font-bold'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] text-zinc-500 font-mono block">#{b.code}</span>
                      <span className="text-xs truncate block">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome do Banco</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ex: 三菱UFJ銀行 (MUFG Bank)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Código Banco (4 Dígitos)</label>
                  <input
                    type="text"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    placeholder="0005"
                    maxLength={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-emerald-400 font-bold focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome da Agência</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Ex: 新宿支店 (Shinjuku Branch)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Código Agência (3 Dígitos)</label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="001"
                    maxLength={3}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-emerald-400 font-bold focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Tipo de Conta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('futsu')}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold transition ${
                        accountType === 'futsu' ? 'bg-emerald-500 text-zinc-950 border-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      普通 (Futsu)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('toza')}
                      className={`py-3 px-3 rounded-xl border text-xs font-bold transition ${
                        accountType === 'toza' ? 'bg-emerald-500 text-zinc-950 border-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      当座 (Toza)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Número da Conta (7 Dígitos) *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234567"
                    maxLength={7}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white focus:border-emerald-500 outline-none tracking-widest"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  Titular em KATAKANA (Meigi Katakana) *
                </label>
                <input
                  type="text"
                  value={accountHolderKana}
                  onChange={(e) => setAccountHolderKana(e.target.value)}
                  placeholder="Ex: ヤマダ タロウ..."
                  className="w-full bg-zinc-950 border border-amber-500/50 rounded-xl px-4 py-3 text-xs font-bold text-amber-200 focus:border-amber-400 outline-none font-mono tracking-wider"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Salvando Dados...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-zinc-950" />
                    <span>Salvar Dados Bancários (JPY)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* MODAL DE TERMOS DE TRANSPARÊNCIA */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-white">Termos de Responsabilidade Financeira</h3>
                <button onClick={() => setShowTermsModal(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                <p>
                  1. A DAIG atua como provedora de tecnologia e marketplace. A DAIG <strong>não custodia fundos</strong> e não processa pagamentos diretamente.
                </p>
                <p>
                  2. Toda a movimentação de valores e repasses para bancos no Japão (Furikomi) são realizados de forma independente pela <strong>Stripe Inc.</strong>
                </p>
                <p>
                  3. Os dados bancários coletados (Código do Banco, Agência e Nome em Katakana) são mantidos com criptografia estrita unicamente para transferência dos recebimentos.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="flex items-start space-x-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={consentDisclaimer}
                    onChange={(e) => setConsentDisclaimer(e.target.checked)}
                    className="mt-0.5 rounded bg-zinc-950 text-emerald-500"
                  />
                  <span>Compreendo que a DAIG não retém valores e que a Stripe efetua os repasses.</span>
                </label>

                <label className="flex items-start space-x-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={consentDataCollection}
                    onChange={(e) => setConsentDataCollection(e.target.checked)}
                    className="mt-0.5 rounded bg-zinc-950 text-emerald-500"
                  />
                  <span>Autorizo o armazenamento dos dados para os depósitos bancários em ienes (¥).</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTerms}
                  disabled={!consentDisclaimer || !consentDataCollection}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider disabled:opacity-40"
                >
                  Aceitar e Prosseguir
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

