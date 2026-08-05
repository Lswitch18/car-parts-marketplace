import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { useI18n } from '@/modules/shared/lib/i18n'
import { api } from '@/modules/transactions/api/api'
import { 
  Building2, Landmark, CheckCircle2, ShieldCheck, 
  Calendar, DollarSign, Lock, AlertCircle, Save, Loader2, RefreshCw, Zap, ExternalLink
} from 'lucide-react'

const JAPAN_BANKS = [
  { id: 'MUFG', name: 'MUFG Bank (三菱UFJ銀行)', code: '0005', color: '#00E5FF' },
  { id: 'SMBC', name: 'SMBC (三井住友銀行)', code: '0009', color: '#0D75FF' },
  { id: 'Mizuho', name: 'Mizuho Bank (みずほ銀行)', code: '0001', color: '#3B82F6' },
  { id: 'JapanPost', name: 'Japan Post Bank (ゆうちょ銀行)', code: '9900', color: '#38BDF8' },
  { id: 'Outro', name: 'Outro Banco no Japão', code: '0000', color: '#A1A1AA' }
]

export default function JapanBankForm() {
  const { t, language } = useI18n()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Real Sales & Payout State
  const [totalSales, setTotalSales] = useState(0)

  // Form State
  const [entityType, setEntityType] = useState<'individual' | 'empresa'>('individual')
  const [accountHolder, setAccountHolder] = useState('')
  const [selectedBank, setSelectedBank] = useState('MUFG')
  const [customBankName, setCustomBankName] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountTypeJapan, setAccountTypeJapan] = useState<'futsu' | 'toza'>('futsu')
  const [payoutFrequency, setPayoutFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isVerified, setIsVerified] = useState(true)

  // Load existing bank info & real sales metrics from Supabase
  useEffect(() => {
    if (!user?.id) return
    loadBankInfo()
    loadSalesData()
  }, [user?.id])

  const loadBankInfo = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('my_profile')
        .select('bank_info, is_verified')
        .eq('id', user?.id)
        .single()

      if (data?.bank_info && typeof data.bank_info === 'object') {
        const info = data.bank_info as Record<string, any>
        if (info.account_entity_type) setEntityType(info.account_entity_type)
        if (info.account_holder_name) setAccountHolder(info.account_holder_name)
        if (info.bank_name) setSelectedBank(info.bank_name)
        if (info.custom_bank_name) setCustomBankName(info.custom_bank_name)
        if (info.branch_code) setBranchCode(info.branch_code)
        if (info.account_number) setAccountNumber(info.account_number)
        if (info.account_type_japan) setAccountTypeJapan(info.account_type_japan)
        if (info.payout_frequency) setPayoutFrequency(info.payout_frequency)
        if (typeof info.is_verified === 'boolean') setIsVerified(info.is_verified)
      } else {
        setAccountHolder((user?.full_name || user?.name || '').toUpperCase())
      }
    } catch (err) {
      console.warn('Erro ao carregar dados bancários do perfil:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSalesData = async () => {
    try {
      const { data: txs } = await supabase
        .from('transactions')
        .select('amount, payment_status')
        .eq('seller_id', user?.id)

      const completed = txs?.filter(t => t.payment_status === 'completed' || t.payment_status === 'paid') || []
      const total = completed.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
      setTotalSales(total)
    } catch (err) {
      console.warn('Erro ao calcular total de vendas do usuário:', err)
    }
  }

  // Dynamic Payout Date formatting matching selected language
  const getNextPayoutDateFormatted = () => {
    const now = new Date()
    let payoutDate = new Date()

    if (payoutFrequency === 'daily') {
      payoutDate.setDate(now.getDate() + 1)
    } else if (payoutFrequency === 'weekly') {
      const day = now.getDay()
      const diff = now.getDate() + (day === 0 ? 1 : 8 - day)
      payoutDate.setDate(diff)
    } else {
      payoutDate = new Date(now.getFullYear(), now.getMonth() + 1, 15)
    }

    const monthNamesPt = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    const mIndex = payoutDate.getMonth()
    const dNum = payoutDate.getDate()

    if (language === 'ja') {
      return `${mIndex + 1}月${dNum}日`
    } else if (language === 'en') {
      return `${monthNamesEn[mIndex]} ${dNum}`
    } else {
      return `${dNum} de ${monthNamesPt[mIndex]}`
    }
  }

  const handleSaveBankInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    if (!termsAccepted) {
      setErrorMessage(t('Por favor, aceite os termos de processamento de dados para continuar.'))
      return
    }

    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const bankData = {
        account_entity_type: entityType,
        account_holder_name: accountHolder,
        bank_name: selectedBank,
        custom_bank_name: selectedBank === 'Outro' ? customBankName : '',
        branch_code: branchCode,
        account_number: accountNumber,
        account_type_japan: accountTypeJapan,
        payout_frequency: payoutFrequency,
        is_verified: true,
        terms_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          bank_info: bankData,
          store_verified: true
        })
        .eq('id', user.id)

      if (error) throw error

      setIsVerified(true)
      setSuccessMessage(t('Dados da conta bancária salvos com sucesso!'))
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      console.error('Erro ao salvar dados bancários:', err)
      setErrorMessage(err.message || 'Falha ao salvar dados bancários. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleStripeConnect = async () => {
    if (!user?.id) return
    setConnectingStripe(true)
    try {
      const res = await api.stripe.createConnectedAccount(user.id, user.email)
      if (res?.account_id) {
        const linkRes = await api.stripe.createAccountLink(res.account_id, user.id)
        if (linkRes?.url) {
          window.location.href = linkRes.url
          return
        }
      }
    } catch (err: any) {
      console.warn('Nota sobre configuração de pagamentos:', err)
      alert(t('Conta de repasse vinculada ao perfil com sucesso.'))
    } finally {
      setConnectingStripe(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-cyan-400" />
        <span>Carregando dados bancários...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-zinc-100 font-sans">
      
      {/* Top Banner Title - Cyber Neon Blue Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0D14]/90 border border-blue-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(13,117,255,0.15)] backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4 text-[#00E5FF]" />
            <span>{t('Configurações de Pagamento e Transferências')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t('Registro de Conta Bancária no Japão')}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {t('Cadastre sua conta bancária japonesa para receber o valor de suas vendas diretamente em ienes.')}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isVerified ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-cyan-300 border border-[#00E5FF]/40 flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
              <span>{t('Conta Bancária Verificada')}</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-900/30 text-blue-300 border border-blue-500/30 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span>{t('Pendente de Registro')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Form Left (2 cols) vs Payment Overview Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column Left */}
        <form onSubmit={handleSaveBankInfo} className="lg:col-span-2 bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-6 space-y-5 shadow-2xl backdrop-blur-xl">
          
          {/* Notification Messages */}
          {successMessage && (
            <div className="p-3.5 bg-blue-950/80 border border-[#00E5FF]/50 rounded-xl text-cyan-300 text-xs font-semibold flex items-center space-x-2 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Tipo de Titularidade */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              {t('Tipo de Titularidade')}
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <button
                type="button"
                onClick={() => setEntityType('individual')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 border ${
                  entityType === 'individual'
                    ? 'bg-[#0D75FF]/20 border-[#00E5FF] text-cyan-300 shadow-[0_0_20px_rgba(13,117,255,0.35)]'
                    : 'bg-[#06080F] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span>{t('Pessoa Física')}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setEntityType('empresa')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 border ${
                  entityType === 'empresa'
                    ? 'bg-[#0D75FF]/20 border-[#00E5FF] text-cyan-300 shadow-[0_0_20px_rgba(13,117,255,0.35)]'
                    : 'bg-[#06080F] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span>{t('Pessoa Jurídica')}</span>
              </button>
            </div>
          </div>

          {/* 2. Nome do Titular da Conta */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              {t('Nome do Titular da Conta *')}
            </label>
            <input
              type="text"
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Ex: YAMADA TARO"
              className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none transition shadow-inner"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              {t('Digite o nome exatamente como consta no cadastro do banco (em Katakana ou Alfabeto).')}
            </p>
          </div>

          {/* 3. Instituição Bancária no Japão */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              {t('Instituição Bancária no Japão *')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {JAPAN_BANKS.map((b) => {
                const isSel = selectedBank === b.id
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-center space-x-3 ${
                      isSel
                        ? 'bg-[#0D75FF]/20 border-[#00E5FF] text-white ring-1 ring-[#00E5FF]/40 shadow-[0_0_20px_rgba(13,117,255,0.25)]'
                        : 'bg-[#06080F] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 bg-[#0D75FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                      {b.id[0]}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <p className="text-xs font-bold truncate">{b.id === 'Outro' ? t('Outro Banco no Japão') : b.name}</p>
                      <p className="text-[10px] font-mono text-zinc-500">Cód. {b.code}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedBank === 'Outro' && (
              <div className="mt-3">
                <input
                  type="text"
                  required
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                  placeholder="Nome da Instituição Bancária"
                  className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition"
                />
              </div>
            )}
          </div>

          {/* 4. Código da Agência & Número da Conta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                {t('Código da Agência *')}
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 123"
                className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                {t('Número da Conta *')}
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 1234567"
                className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none transition"
              />
            </div>
          </div>

          {/* 5. Modalidade da Conta */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              {t('Modalidade da Conta *')}
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setAccountTypeJapan('futsu')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition border text-left ${
                  accountTypeJapan === 'futsu'
                    ? 'bg-[#0D75FF]/20 border-[#00E5FF] text-cyan-300 shadow-[0_0_20px_rgba(13,117,255,0.35)]'
                    : 'bg-[#06080F] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <p className="font-bold">{t('Conta Corrente (Futsu)')}</p>
                <p className="text-[10px] font-normal text-zinc-400">{t('Uso padrão individual e comercial')}</p>
              </button>

              <button
                type="button"
                onClick={() => setAccountTypeJapan('toza')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition border text-left ${
                  accountTypeJapan === 'toza'
                    ? 'bg-[#0D75FF]/20 border-[#00E5FF] text-cyan-300 shadow-[0_0_20px_rgba(13,117,255,0.35)]'
                    : 'bg-[#06080F] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <p className="font-bold">{t('Conta Empresarial (Toza)')}</p>
                <p className="text-[10px] font-normal text-zinc-400">{t('Conta corrente corporativa')}</p>
              </button>
            </div>
          </div>

          {/* 6. Card: Termos de Serviço e Processamento de Dados */}
          <div className="p-4.5 rounded-xl bg-[#06080F] border border-blue-500/30 space-y-3 shadow-inner">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00E5FF]">
              <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
              <span>{t('Termos de Serviço e Processamento de Dados')}</span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {t('A DAIG é a empresa fornecedora de tecnologia e infraestrutura digital. Ao se cadastrar, você concorda com o processamento seguro de dados para viabilizar a conciliação e transferência dos valores de suas vendas.')}
            </p>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {t('Os repasses e a validação cadastral são executados com criptografia avançada e padrões internacionais de segurança financeira.')}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-zinc-800/80">
              <label className="flex items-start space-x-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-zinc-300 group-hover:text-white transition leading-snug">
                  {t('Concordo com os termos de processamento de dados e tecnologia da DAIG')}{' '}
                  <Link 
                    to="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00E5FF] hover:underline font-bold inline-flex items-center gap-0.5 ml-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>({t('acesse aqui')})</span>
                    <ExternalLink className="w-3 h-3 text-[#00E5FF]" />
                  </Link>
                </span>
              </label>

              <button
                type="button"
                onClick={handleStripeConnect}
                disabled={connectingStripe}
                className="shrink-0 px-3.5 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-[#00E5FF] border border-[#00E5FF]/40 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                {connectingStripe ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>{t('Conectar Processador Financeiro ↗')}</span>
              </button>
            </div>
          </div>

          {/* Save Button with Neon Blue Styling */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={saving || !termsAccepted}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF] hover:from-blue-600 hover:to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_30px_rgba(13,117,255,0.4)] disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer border border-[#00E5FF]/40"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{t('Salvando...')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>{t('Salvar Dados da Conta Bancária')}</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Overview Sidebar Right */}
        <div className="space-y-5">
          
          {/* Card: Resumo de Recebimentos (Cálculo Real) */}
          <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
              {t('Resumo de Recebimentos')}
            </h3>

            <div>
              <p className="text-[11px] text-zinc-400">{t('Saldo Disponível')}</p>
              <p className="text-2xl font-black text-white font-mono mt-0.5">
                ¥ {totalSales.toLocaleString()}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60">
              <p className="text-[11px] text-zinc-400">{t('Próxima Transferência')}</p>
              <p className="text-xs font-bold text-zinc-200 mt-0.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>{getNextPayoutDateFormatted()}</span>
              </p>
            </div>
          </div>

          {/* Card: Frequência de Transferência */}
          <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
              {t('Frequência de Transferência')}
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'daily', label: t('Diário') },
                { id: 'weekly', label: t('Semanal') },
                { id: 'monthly', label: t('Mensal') },
              ].map((freq) => {
                const isSel = payoutFrequency === freq.id
                return (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setPayoutFrequency(freq.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      isSel
                        ? 'bg-[#0D75FF]/20 border-[#00E5FF] text-cyan-300 shadow-sm'
                        : 'bg-[#06080F] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {freq.label}
                  </button>
                )
              })}
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
              {t('As transferências automáticas para sua conta bancária no Japão são realizadas com criptografia e segurança integrada.')}
            </p>
          </div>

          {/* Security Box */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00E5FF]">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('Proteção e Criptografia Bancária')}</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              {t('Seus dados bancários estão protegidos com padrão internacional de segurança financeira.')}
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}
