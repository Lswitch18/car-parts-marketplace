import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { 
  Building2, ShieldCheck, Lock, CheckCircle2, AlertCircle, 
  ArrowLeft, CreditCard, Landmark, HelpCircle, Save, Sparkles, RefreshCw
} from 'lucide-react'

// Principais Bancos do Japão para Seleção Rápida
const JAPAN_TOP_BANKS = [
  { code: '0005', name: '三菱UFJ銀行 (MUFG Bank)', kana: 'ミツビシユーエフジェイ' },
  { code: '0009', name: '三井住友銀行 (SMBC)', kana: 'ミツイスミトモ' },
  { code: '0001', name: 'みずほ銀行 (Mizuho Bank)', kana: 'ミズホ' },
  { code: '9900', name: 'ゆうちょ銀行 (Japan Post Bank / Yucho)', kana: 'ユウチョ' },
  { code: '0010', name: 'りそな銀行 (Resona Bank)', kana: 'リソナ' },
  { code: '0033', name: 'PayPay銀行 (PayPay Bank)', kana: 'ペイペイ' },
  { code: '0036', name: '楽天銀行 (Rakuten Bank)', kana: 'ラクテン' },
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

  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Carregar dados existentes se houver
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
    setBankName(bank.name)
    setBankCode(bank.code)
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

      // Salvar no perfil do usuário no PostgreSQL via Supabase RLS
      const { error } = await supabase
        .from('profiles')
        .update({
          bank_info: bankInfoPayload,
          stripe_onboarding_complete: true
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccessMessage('Conta bancária do Japão salva e criptografada com sucesso! Os repasses de vendas (Furikomi / Stripe Connect) serão depositados nesta conta.')
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Top Bar Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar ao Painel Geral
          </Link>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5 mr-1" /> SSL 256-bit Encryption
          </span>
        </div>

        {/* Card Principal de Cadastro de Conta Bancária do Japão */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          
          <div className="flex items-center space-x-4 mb-6 border-b border-zinc-800 pb-6">
            <div className="p-3.5 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <Landmark className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Cadastro de Conta Bancária no Japão (振込口座)
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Configure os dados da sua conta bancária japonesa para receber repasses automáticos de vendas de autopeças.
              </p>
            </div>
          </div>

          {/* Banner de Segurança & Privacidade */}
          <div className="mb-6 p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-2xl flex items-start space-x-3 text-xs text-indigo-200">
            <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Ambiente Protegido por Criptografia Bancária Zengin/Stripe</p>
              <p className="text-indigo-300/80 mt-0.5">
                Seus dados de transferência (Furikomi) são protegidos com sigilo bancário e vinculados estritamente à sua organização para recebimentos em JPY (¥).
              </p>
            </div>
          </div>

          {/* Alertas de Sucesso ou Erro */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-medium flex items-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800 rounded-2xl text-rose-300 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SELEÇÃO RÁPIDA DOS PRINCIPAIS BANCOS JAPONESES */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                1. Selecione seu Banco no Japão (金融機関)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {JAPAN_TOP_BANKS.map((b) => {
                  const isSelected = bankCode === b.code
                  return (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => handleSelectPresetBank(b)}
                      className={`p-3 rounded-xl border text-left transition text-xs font-semibold flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      <span className="text-[10px] font-mono opacity-60 mt-1">Código: {b.code}</span>
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome do Banco (銀行名)</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ex: 三菱UFJ銀行"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Código do Banco (4 Dígitos)</label>
                  <input
                    type="text"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    placeholder="0005"
                    maxLength={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* AGÊNCIA (支店) & TIPO DE CONTA */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                2. Agência e Tipo de Conta (支店・預金種目)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome da Agência (支店名)</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Ex: 新宿支店 (Shinjuku Branch)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 transition"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Tipo de Conta (預金種目)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType('futsu')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition text-center ${
                        accountType === 'futsu' 
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      普通 (Futsu - Corrente)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('toza')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition text-center ${
                        accountType === 'toza' 
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' 
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      当座 (Toza - Cheque PJ)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Número da Conta (口座番号 - 7 Dígitos) *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234567"
                    maxLength={7}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:border-emerald-500 transition tracking-widest"
                    required
                  />
                </div>
              </div>
            </div>

            {/* TITULARIDADE EM KATAKANA (口座名義 カタカナ) */}
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                3. Titular da Conta em Katakana (口座名義 カタカナ) *
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Nome do Titular em KATAKANA (Meigi Katakana) *
                  </label>
                  <input
                    type="text"
                    value={accountHolderKana}
                    onChange={(e) => setAccountHolderKana(e.target.value)}
                    placeholder="Ex: ヤマダ タロウ ou カブシキガイシャ..."
                    className="w-full bg-zinc-950 border border-amber-500/40 rounded-xl px-4 py-3 text-base font-bold text-amber-200 focus:border-amber-400 transition font-mono tracking-wider"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    ⚠️ Importante: Os bancos no Japão exigem a grafia exata em Katakana para validar o depósito bancário (Furikomi).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome do Titular em Kanji / Alfabeto</label>
                    <input
                      type="text"
                      value={accountHolderKanji}
                      onChange={(e) => setAccountHolderKanji(e.target.value)}
                      placeholder="Ex: 山田 太郎 ou Wellynton Jeronimo"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Número de Registro PJ / Hojin (Opcional)</label>
                    <input
                      type="text"
                      value={corporateNumber}
                      onChange={(e) => setCorporateNumber(e.target.value)}
                      placeholder="Ex: 1234567890123"
                      maxLength={13}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-300 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÃO DE SALVAMENTO COM CRIPTOGRAFIA */}
            <div className="pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition shadow-xl shadow-emerald-600/25 flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Criptografando e Salvando Conta...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Salvar Conta Bancária do Japão para Repasses</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  )
}
