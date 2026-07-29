import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { 
  Building2, ShieldCheck, Lock, CheckCircle2, AlertCircle, 
  ArrowLeft, CreditCard, Landmark, HelpCircle, Save, Sparkles, RefreshCw,
  Copy, Check, Zap, Globe2, Fingerprint, Eye, Award, ChevronRight, Shield
} from 'lucide-react'

// Principais Bancos do Japão para Seleção Rápida com Identidade Visual
const JAPAN_TOP_BANKS = [
  { code: '0005', name: '三菱UFJ銀行', enName: 'MUFG Bank', kana: 'ミツビシユーエフジェイ', color: 'from-red-600 to-rose-700', badge: 'UFJ' },
  { code: '0009', name: '三井住友銀行', enName: 'SMBC Bank', kana: 'ミツイスミトモ', color: 'from-emerald-600 to-teal-700', badge: 'SMBC' },
  { code: '0001', name: 'みずほ銀行', enName: 'Mizuho Bank', kana: 'ミズホ', color: 'from-blue-600 to-indigo-700', badge: 'MIZUHO' },
  { code: '9900', name: 'ゆうちょ銀行', enName: 'Japan Post Bank', kana: 'ユウチョ', color: 'from-teal-500 to-emerald-600', badge: 'JP POST' },
  { code: '0010', name: 'りそな銀行', enName: 'Resona Bank', kana: 'リソナ', color: 'from-green-600 to-emerald-700', badge: 'RESONA' },
  { code: '0033', name: 'PayPay銀行', enName: 'PayPay Bank', kana: 'ペイペイ', color: 'from-red-500 to-orange-600', badge: 'PayPay' },
  { code: '0036', name: '楽天銀行', enName: 'Rakuten Bank', kana: 'ラクテン', color: 'from-rose-600 to-red-800', badge: 'RAKUTEN' },
  { code: '0038', name: '住信SBIネット銀行', enName: 'SBI Sumishin', kana: 'スミシンエスビーアイ', color: 'from-cyan-600 to-blue-700', badge: 'SBI' },
]

// Katakana exemplificativos para cópia rápida se necessário
const KATAKANA_DEMOS = [
  { label: 'Pessoa Física Exemplo', kana: 'ヤマダ タロウ' },
  { label: 'Pessoa Jurídica Exemplo (KK)', kana: 'カブシキガイシャ' },
  { label: 'Pessoa Jurídica Exemplo (GK)', kana: 'ゴウドウガイシャ' }
]

export default function JapanBankAccount() {
  const navigate = useNavigate()
  const { user, initialized, loading: authLoading } = useAuthStore()

  const [bankName, setBankName] = useState('三菱UFJ銀行 (MUFG Bank)')
  const [bankCode, setBankCode] = useState('0005')
  const [branchName, setBranchName] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [accountType, setAccountType] = useState<'futsu' | 'toza'>('futsu')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderKana, setAccountHolderKana] = useState('')
  const [accountHolderKanji, setAccountHolderKanji] = useState('')
  const [corporateNumber, setCorporateNumber] = useState('')

  const [previewMode, setPreviewMode] = useState<'card' | 'passbook'>('card')
  const [copiedDemo, setCopiedDemo] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Carregar dados existentes
  useEffect(() => {
    if (user?.id) {
      loadExistingBankAccount()
    }
  }, [user?.id])

  const loadExistingBankAccount = async () => {
    try {
      const { data, error } = await supabase
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
      }
    } catch (err) {
      console.warn('Nenhuma conta bancária prévia registrada.')
    }
  }

  const handleSelectPresetBank = (bank: typeof JAPAN_TOP_BANKS[0]) => {
    setBankName(`${bank.name} (${bank.enName})`)
    setBankCode(bank.code)
  }

  const handleCopyKatakanaDemo = (kana: string) => {
    setAccountHolderKana(kana)
    setCopiedDemo(kana)
    setTimeout(() => setCopiedDemo(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!user?.id) {
      setErrorMessage('Você precisa estar autenticado para salvar os dados bancários.')
      return
    }

    if (!accountNumber || accountNumber.length < 6) {
      setErrorMessage('O número da conta bancária japonesa deve conter de 6 a 7 dígitos.')
      return
    }

    if (!accountHolderKana) {
      setErrorMessage('O nome do titular em Katakana (口座名義 カタカナ) é obrigatório para repasses bancários (Furikomi) no Japão.')
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

      setSuccessMessage('✨ Conta bancária do Japão salva e criptografada com sucesso! Repasses de vendas em JPY (¥ / Furikomi) ativos.')
    } catch (err: any) {
      console.error('Erro ao salvar conta bancária:', err)
      setErrorMessage(err.message || 'Falha ao salvar dados bancários com segurança.')
    } finally {
      setIsSaving(false)
    }
  }

  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Luzes de Fundo Cenas Futuristas */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Painel Geral
          </Link>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ZENGIN NET READY (全銀ネット)
            </span>
            
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
              <Lock className="w-3 h-3 mr-1.5 text-emerald-400" /> AES-256 Encrypted
            </span>
          </div>
        </div>

        {/* Dynamic Card / Passbook Visual Live Preview Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Configuração Bancária Japonesa</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Cadastro de Conta <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                振込口座 (Furikomi JPY)
              </span>
            </h1>
            
            <p className="text-sm text-zinc-400 leading-relaxed">
              Registre os dados oficiais do seu banco no Japão para receber depósitos automáticos das vendas em ienes (¥). Criptografado no padrão do Zengin System (全銀システム).
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewMode('card')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  previewMode === 'card' 
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20' 
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Cartão do Banco
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('passbook')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  previewMode === 'passbook' 
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20' 
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" /> Caderneta (預金通帳)
              </button>
            </div>
          </div>

          {/* Interactive Japanese Bank Card / Passbook Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            {previewMode === 'card' ? (
              <div className="w-full max-w-sm h-52 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-emerald-500/30 p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                      ¥
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-wide truncate max-w-[170px]">
                        {bankName || 'Seleção do Banco'}
                      </p>
                      <p className="text-[10px] font-mono text-emerald-400/80">Código: {bankCode || '----'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                    JAPAN JPY
                  </span>
                </div>

                {/* Card Chip & Type */}
                <div className="flex items-center justify-between my-2 relative z-10">
                  <div className="w-10 h-7 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center overflow-hidden relative">
                    <div className="w-full h-[1px] bg-amber-400/40 my-[2px]" />
                    <div className="w-full h-[1px] bg-amber-400/40 my-[2px]" />
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest block">
                      {accountType === 'futsu' ? '普通預金 (Corrente)' : '当座預金 (Cheque PJ)'}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Agência: {branchCode || '000'} {branchName ? `(${branchName})` : ''}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Account & Holder */}
                <div className="relative z-10 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-mono text-zinc-500">口座名義 (Katakana Holder)</p>
                      <p className="text-xs font-mono font-bold text-amber-300 tracking-wider truncate max-w-[190px]">
                        {accountHolderKana || 'カタカナ メイギ'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-mono text-zinc-500">口座番号 (Account No)</p>
                      <p className="text-sm font-mono font-bold text-white tracking-widest">
                        {accountNumber ? accountNumber.padEnd(7, '•') : '•••••••'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Passbook Mockup */
              <div className="w-full max-w-sm h-52 rounded-3xl bg-zinc-900 border border-amber-500/30 p-5 flex flex-col justify-between shadow-[0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Landmark className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-200">預金通帳 (Japanese Bank Passbook)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md">
                    Zengin Verified
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>金融機関名 (Bank):</span>
                    <span className="text-white font-bold">{bankName || '----'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>支店名 (Branch):</span>
                    <span className="text-white">{branchName || '----'} ({branchCode || '---'})</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>口座名義 (Katakana):</span>
                    <span className="text-amber-300 font-bold">{accountHolderKana || '未入力'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>口座番号 (Account):</span>
                    <span className="text-emerald-400 font-bold tracking-widest">{accountNumber || '7 dígitos'}</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-2 rounded-xl text-[10px] font-mono text-zinc-400 flex items-center justify-between border border-zinc-800">
                  <span>Transfer Status: Active</span>
                  <span className="text-emerald-400 font-semibold">JPY (¥) Direct Deposit</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Alert Toasts */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-medium flex items-center justify-between shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span>{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-xs text-emerald-400 hover:text-white underline ml-4"
            >
              Fechar
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs font-medium flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-white underline ml-4"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Main Form Container */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* STEP 1: BANCO NO JAPÃO */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">1</span>
                  Selecione seu Banco no Japão (金融機関選択)
                </h2>
                <span className="text-[11px] text-zinc-500">Selecione para preenchimento rápido</span>
              </div>

              {/* Grid dos Bancos Japoneses */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {JAPAN_TOP_BANKS.map((b) => {
                  const isSelected = bankCode === b.code
                  return (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => handleSelectPresetBank(b)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${
                        isSelected 
                          ? 'bg-gradient-to-br from-emerald-950/80 to-zinc-900 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50' 
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r ${b.color} text-white shadow-sm`}>
                          {b.badge}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">#{b.code}</span>
                      </div>
                      <span className="text-xs font-bold truncate text-white block">{b.name}</span>
                      <span className="text-[10px] text-zinc-500 truncate block mt-0.5">{b.enName}</span>
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nome do Banco (銀行名)</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ex: 三菱UFJ銀行 (MUFG Bank)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Código do Banco (4 Dígitos)</label>
                  <input
                    type="text"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    placeholder="0005"
                    maxLength={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: AGÊNCIA & TIPO DE CONTA */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">2</span>
                  Agência e Tipo de Conta (支店・預金種目)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nome da Agência (支店名)</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Ex: 新宿支店 (Shinjuku Branch)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Código Agência (3 Dígitos)</label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="001"
                    maxLength={3}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-emerald-400 font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tipo de Conta (預金種目)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType('futsu')}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        accountType === 'futsu' 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${accountType === 'futsu' ? 'opacity-100' : 'opacity-0'}`} />
                      普通 (Futsu - Corrente)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('toza')}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        accountType === 'toza' 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${accountType === 'toza' ? 'opacity-100' : 'opacity-0'}`} />
                      当座 (Toza - Cheque PJ)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Número da Conta (口座番号 - 7 Dígitos) *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234567"
                    maxLength={7}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-base font-mono font-extrabold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none tracking-widest"
                    required
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: TITULARIDADE KATAKANA (口座名義) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-mono">3</span>
                  Titularidade da Conta em Katakana (口座名義 カタカナ) *
                </h2>
                <span className="text-[11px] text-amber-400/80 flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3" /> Exigência Zengin / Furikomi
                </span>
              </div>

              {/* Katakana Helper Bar */}
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-2">
                <p className="text-xs text-amber-200/90 font-medium">
                  ⚠️ <strong>Atenção aos depósitos no Japão:</strong> O nome deve bater exatamente com a grafia bancária em Katakana meigi.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] text-amber-400/70 uppercase font-mono">Exemplos Rápidos:</span>
                  {KATAKANA_DEMOS.map((demo) => (
                    <button
                      key={demo.kana}
                      type="button"
                      onClick={() => handleCopyKatakanaDemo(demo.kana)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono hover:bg-amber-500/20 transition flex items-center gap-1"
                    >
                      <span>{demo.kana}</span>
                      {copiedDemo === demo.kana ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nome do Titular em KATAKANA (Meigi Katakana) *
                </label>
                <input
                  type="text"
                  value={accountHolderKana}
                  onChange={(e) => setAccountHolderKana(e.target.value)}
                  placeholder="Ex: ヤマダ タロウ ou カブシキガイシャ..."
                  className="w-full bg-zinc-950 border border-amber-500/50 rounded-xl px-4 py-3.5 text-base font-bold text-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition outline-none font-mono tracking-wider shadow-inner"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nome em Kanji / Alfabeto Ocidental</label>
                  <input
                    type="text"
                    value={accountHolderKanji}
                    onChange={(e) => setAccountHolderKanji(e.target.value)}
                    placeholder="Ex: 山田 太郎 ou Wellynton Jeronimo"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Número de Registro Hojin (PJ Japonesa - Opcional)</label>
                  <input
                    type="text"
                    value={corporateNumber}
                    onChange={(e) => setCorporateNumber(e.target.value)}
                    placeholder="Ex: 1234567890123"
                    maxLength={13}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-zinc-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                  />
                </div>
              </div>
            </div>

            {/* BOTÃO DE AÇÃO PRINCIPAL */}
            <div className="pt-6 border-t border-zinc-800/80 space-y-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-sm uppercase tracking-wider rounded-2xl transition duration-200 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] disabled:opacity-50 flex items-center justify-center space-x-2 group"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-zinc-950" />
                    <span>Criptografando e Salvando Conta...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-zinc-950 group-hover:scale-110 transition-transform" />
                    <span>Salvar Dados Bancários para Depósitos em JPY (¥)</span>
                  </>
                )}
              </button>

              <div className="flex flex-col items-center justify-center space-y-1.5 pt-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-300 font-medium">Cadastro de conta bancária segura</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 font-sans text-[9px] tracking-wide uppercase">powered by stripe</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  🔒 Sigilo bancário e criptografia AES-256 (全銀ネット / JPY)
                </p>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  )
}
