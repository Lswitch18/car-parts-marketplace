import { useState, useEffect } from 'react'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { 
  Building2, Landmark, CheckCircle2, ShieldCheck, 
  Calendar, DollarSign, Lock, AlertCircle, Save, Loader2, RefreshCw, Zap
} from 'lucide-react'

const JAPAN_BANKS = [
  { id: 'MUFG', name: 'MUFG (三菱UFJ銀行)', code: '0005', color: '#00E5FF' },
  { id: 'SMBC', name: 'SMBC (三井住友銀行)', code: '0009', color: '#0D75FF' },
  { id: 'Mizuho', name: 'Mizuho (みずほ銀行)', code: '0001', color: '#3B82F6' },
  { id: 'JapanPost', name: 'Japan Post Bank (ゆうちょ銀行)', code: '9900', color: '#38BDF8' },
  { id: 'Outro', name: 'Outro Banco no Japão', code: '0000', color: '#A1A1AA' }
]

export default function JapanBankForm() {
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Bank Form State matching Image 2
  const [entityType, setEntityType] = useState<'individual' | 'empresa'>('individual')
  const [accountHolder, setAccountHolder] = useState('')
  const [selectedBank, setSelectedBank] = useState('MUFG')
  const [customBankName, setCustomBankName] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountTypeJapan, setAccountTypeJapan] = useState<'futsu' | 'toza'>('futsu')
  const [payoutFrequency, setPayoutFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [isVerified, setIsVerified] = useState(true)

  // Load existing bank info from Supabase profiles.bank_info
  useEffect(() => {
    if (!user?.id) return
    loadBankInfo()
  }, [user?.id])

  const loadBankInfo = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
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

  const handleSaveBankInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

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
      setSuccessMessage('Dados da conta bancária japonesa salvos com sucesso!')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      console.error('Erro ao salvar dados bancários:', err)
      setErrorMessage(err.message || 'Falha ao salvar dados bancários. Tente novamente.')
    } finally {
      setSaving(false)
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
            <span>Configurações de Pagamento & Repasses JPY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Registro de Conta Bancária Japonesa (JPY)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastre os dados da sua conta corrente no Japão para recebimento de vendas em ienes.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isVerified ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-cyan-300 border border-[#00E5FF]/40 flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
              <span>Conta Bancária Verificada</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-900/30 text-blue-300 border border-blue-500/30 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span>Pendente de Registro</span>
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

          {/* 1. Tipo de Conta (Individual vs Empresa) */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Tipo de Conta (Física / Jurídica)
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
                <span>Individual</span>
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
                <span>Empresa</span>
              </button>
            </div>
          </div>

          {/* 2. Nome do Titular da Conta (口座名義) */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Nome do Titular da Conta (口座名義) *
            </label>
            <input
              type="text"
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Ex: ヤマダ タロウ ou YAMADA TARO"
              className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none transition shadow-inner"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Digite o nome idêntico ao cadastrado no banco (em Katakana ou Alfabeto).
            </p>
          </div>

          {/* 3. Nome do Banco no Japão (日本国内銀行) */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Nome do Banco no Japão (日本国内銀行) *
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
                      <p className="text-xs font-bold truncate">{b.name}</p>
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
                  placeholder="Nome do Banco (Ex: Shinkin Bank / 信用金庫)"
                  className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition"
                />
              </div>
            )}
          </div>

          {/* 4. Agência (支店コード) & Número da Conta (口座番号) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Agência / Branch Code (支店コード) *
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
                Número da Conta (口座番号) *
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

          {/* 5. Tipo de Conta Japonesa (Futsu 普通 / Toza 当座) */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Tipo de Conta (口座種別) *
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
                <p className="font-bold">Futsu 普通</p>
                <p className="text-[10px] font-normal text-zinc-400">Conta Corrente Normal</p>
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
                <p className="font-bold">Toza 当座</p>
                <p className="text-[10px] font-normal text-zinc-400">Conta Corrente Especial</p>
              </button>
            </div>
          </div>

          {/* Save Button with Neon Blue Styling */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF] hover:from-blue-600 hover:to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_30px_rgba(13,117,255,0.4)] disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer border border-[#00E5FF]/40"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Salvando no Servidor...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Salvar Registro de Conta Bancária</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Overview Sidebar Right */}
        <div className="space-y-5">
          
          {/* Card: Visão Geral dos Pagamentos */}
          <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
              Visão Geral dos Pagamentos
            </h3>

            <div>
              <p className="text-[11px] text-zinc-400">Saldo Total de Pagamento</p>
              <p className="text-2xl font-black text-white font-mono mt-0.5">
                ¥1,250,000 <span className="text-xs font-normal text-[#00E5FF] font-sans">JPY</span>
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60">
              <p className="text-[11px] text-zinc-400">Próximo Pagamento Agendado</p>
              <p className="text-xs font-bold text-zinc-200 mt-0.5 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>15 de Outubro</span>
              </p>
            </div>
          </div>

          {/* Card: Frequência de Transferência */}
          <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2">
              Frequência de Transferência
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'daily', label: 'Diário' },
                { id: 'weekly', label: 'Semanal' },
                { id: 'monthly', label: 'Mensal' },
              ].map((freq) => {
                const isSel = payoutFrequency === freq.id
                return (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setPayoutFrequency(freq.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
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
              As transferências automáticas para sua conta bancária no Japão são realizadas com criptografia e segurança integrada.
            </p>
          </div>

          {/* Security Box */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00E5FF]">
              <ShieldCheck className="w-4 h-4" />
              <span>Ambiente Criptografado</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Seus dados bancários estão protegidos com padrão internacional de segurança financeira.
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}
