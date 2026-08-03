import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { useI18n } from '@/modules/shared/lib/i18n'
import JapanBankForm from '@/modules/backoffice/components/JapanBankForm'
import { 
  User, Phone, MapPin, Camera, Loader2, Shield, QrCode, CheckCircle2, 
  Building2, Landmark, PlusCircle, ArrowRight, Package, CreditCard,
  TrendingUp, ShoppingBag, DollarSign, Sparkles, MessageSquare
} from 'lucide-react'
import { fetchPostal } from '@/modules/shared/lib/postal'

export default function Profile() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const location = useLocation()
  const initialTab = location.hash === '#bank' || location.search.includes('tab=bank') ? 'bank' : 'personal'
  const [activeTab, setActiveTab] = useState<'personal' | 'bank'>(initialTab)

  const [sellerMetrics, setSellerMetrics] = useState({
    activeParts: 0,
    totalSalesJPY: 0,
    completedSales: 0
  })

  useEffect(() => {
    if (!user?.id) return
    loadSellerMetrics()
  }, [user?.id])

  const loadSellerMetrics = async () => {
    try {
      const { count } = await supabase
        .from('parts')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user?.id)

      const { data: txs } = await supabase
        .from('transactions')
        .select('amount, payment_status')
        .eq('seller_id', user?.id)

      const completed = txs?.filter(t => t.payment_status === 'completed' || t.payment_status === 'paid') || []
      const total = completed.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

      setSellerMetrics({
        activeParts: count || 0,
        totalSalesJPY: total,
        completedSales: completed.length
      })
    } catch (err) {
      console.warn('Erro ao carregar métricas:', err)
    }
  }

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip_code: user?.zip_code || ''
  })
  const [postalLoading, setPostalLoading] = useState(false)

  // MFA states
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaStatus, setMfaStatus] = useState<'disabled' | 'enrolling' | 'active'>('disabled')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [factors, setFactors] = useState<any[]>([])

  // Load factors on load
  const loadMfa = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error
      setFactors(data.all || [])
      const activeFactor = data.all?.find(f => f.status === 'verified')
      if (activeFactor) {
        setMfaStatus('active')
      } else {
        setMfaStatus('disabled')
      }
    } catch (err: any) {
      console.error('Error listing MFA factors:', err)
    }
  }, [])

  // Call loadMfa on mount
  useState(() => {
    loadMfa()
  })

  // Start enrollment
  const handleEnrollMfa = async () => {
    setMfaLoading(true)
    setMfaError(null)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'GAID Marketplace'
      })
      if (error) throw error
      setMfaFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setMfaStatus('enrolling')
    } catch (err: any) {
      setMfaError(err.message || 'Erro ao iniciar cadastro de MFA')
    } finally {
      setMfaLoading(false)
    }
  }

  // Verify code and complete enrollment
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaFactorId) return
    setMfaLoading(true)
    setMfaError(null)
    try {
      // 1. Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId
      })
      if (challengeError) throw challengeError

      // 2. Verify challenge
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: verificationCode
      })
      if (verifyError) throw verifyError

      // Success
      setMfaStatus('active')
      setQrCode(null)
      setVerificationCode('')
      alert('Autenticação de Dois Fatores (MFA) ativada com sucesso!')
      loadMfa()
    } catch (err: any) {
      setMfaError(err.message || 'Código de verificação incorreto ou expirado')
    } finally {
      setMfaLoading(false)
    }
  }

  // Disable MFA
  const handleUnenrollMfa = async (factorId: string) => {
    if (!confirm('Tem certeza que deseja desativar a Autenticação de Dois Fatores (MFA)? Isso reduz a segurança da sua conta.')) return
    setMfaLoading(true)
    setMfaError(null)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      setMfaStatus('disabled')
      alert('Autenticação de Dois Fatores (MFA) desativada.')
      loadMfa()
    } catch (err: any) {
      setMfaError(err.message || 'Erro ao desativar MFA')
    } finally {
      setMfaLoading(false)
    }
  }


  const handlePostalLookup = useCallback(async (codeToFetch?: string) => {
    const targetCode = codeToFetch ?? formData.zip_code
    const raw = targetCode.replace(/\D/g, '')
    if (raw.length < 5) return
    setPostalLoading(true)
    const result = await fetchPostal(raw)
    if (result) {
      setFormData(prev => ({
        ...prev,
        address: result.street || result.fullAddress || prev.address,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }))
    }
    setPostalLoading(false)
  }, [formData.zip_code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          cep: formData.zip_code
        })
        .eq('id', user?.id)
        .select()
        .single()

      if (error) throw error
      setUser({
        ...user,
        name: data.full_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.cep
      })
      alert('Perfil atualizado com sucesso!')
    } catch (err) {
      console.error(err)
      alert('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-8">
          {t('Meu Perfil')}
        </h1>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              activeTab === 'personal'
                ? 'bg-[#0D75FF]/20 text-cyan-300 border-[#00E5FF]/50 shadow-[0_0_20px_rgba(13,117,255,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-[#0B0E17] border-transparent'
            }`}
          >
            <User className="w-4 h-4 text-cyan-400" />
            <span>{t('Dados Pessoais & Perfil')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
              activeTab === 'bank'
                ? 'bg-[#0D75FF]/20 text-cyan-300 border-[#00E5FF]/50 shadow-[0_0_20px_rgba(13,117,255,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-[#0B0E17] border-transparent'
            }`}
          >
            <Landmark className="w-4 h-4 text-[#00E5FF]" />
            <span>{t('Conta Bancária (Japão)')}</span>
          </button>
        </div>

        {/* Tab 2: Configuração de Conta Bancária Japonesa */}
        {activeTab === 'bank' && (
          <div className="animate-in fade-in duration-300">
            <JapanBankForm />
          </div>
        )}

        {/* Tab 1: Dados Pessoais do Perfil */}
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Card de Métricas de Vendas (Mobile & Responsive) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B0E17] via-zinc-950 to-[#0A0D14] border border-blue-500/40 shadow-[0_0_30px_rgba(13,117,255,0.18)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-[#00E5FF]/30 text-cyan-400 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>{t('Painel de Vendas & Desempenho')}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {t('Desempenho da Conta')}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {t('Resumo de anúncios ativos, vendas acumuladas e atalhos de gerenciamento.')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate('/create-listing')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] hover:from-blue-600 hover:to-[#00E5FF] text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-blue-500/25 flex items-center space-x-1.5 border border-[#00E5FF]/40 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('Anunciar Peça')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('bank')}
                    className="px-3.5 py-2.5 rounded-xl bg-[#06080F] border border-blue-500/30 hover:border-[#00E5FF]/50 text-xs font-bold text-cyan-300 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Landmark className="w-4 h-4 text-[#00E5FF]" />
                    <span>{t('Conta Bancária')}</span>
                  </button>
                </div>
              </div>

              {/* Grid Responsivo de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[#06080F] border border-zinc-800/80 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{t('Anúncios Ativos')}</p>
                    <p className="text-xl font-black text-white font-mono">{sellerMetrics.activeParts}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#06080F] border border-zinc-800/80 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-[#00E5FF]/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{t('Total em Vendas')}</p>
                    <p className="text-xl font-black text-white font-mono">¥ {sellerMetrics.totalSalesJPY.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#06080F] border border-zinc-800/80 flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{t('Vendas Finalizadas')}</p>
                    <p className="text-xl font-black text-white font-mono">{sellerMetrics.completedSales}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8 bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0D75FF] to-[#00E5FF] flex items-center justify-center p-0.5 shadow-[0_0_25px_rgba(13,117,255,0.35)]">
                <div className="w-full h-full bg-[#06080F] rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-[#0D75FF] hover:bg-[#00E5FF] text-white rounded-full transition shadow-md">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user.name || 'Seu Nome'}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">{t('Nome completo')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl text-white outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">{t('Telefone')}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl text-white outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">{t('Endereço')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl text-white outline-none transition"
                  placeholder={t('Rua, número, complemento')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">{t('Cidade')}</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-4 py-3 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">{t('Estado')}</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-4 py-3 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">{t('CEP')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData(prev => ({ ...prev, zip_code: val }))
                      const digits = val.replace(/\D/g, '')
                      if (digits.length === 7 || digits.length === 8) {
                        handlePostalLookup(val)
                      }
                    }}
                    onBlur={() => handlePostalLookup()}
                    placeholder="Ex: 100-0001 (JP) ou 01001-000 (BR)"
                    className="w-full bg-[#06080F] border border-zinc-800 focus:border-[#00E5FF] rounded-xl pl-4 pr-10 py-3 text-white outline-none transition"
                  />
                  {postalLoading && (
                    <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF] hover:from-blue-600 hover:to-[#00E5FF] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(13,117,255,0.35)] border border-[#00E5FF]/40 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('Salvando...')}</span>
                </>
              ) : (
                <span>{t('Salvar Alterações')}</span>
              )}
            </button>
          </form>
        </div>

        {/* MFA Card */}
        <div className="card p-8 mt-8 border border-[#2a2a2a] bg-[#0e0e0e] rounded-xl animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-[#00e5ff]" />
            <h2 className="text-xl font-semibold text-white">{t('Autenticação de Dois Fatores (MFA)')}</h2>
          </div>

          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            {t('Adicione uma camada extra de segurança à sua conta exigindo um código de verificação sempre que fizer login.')}
          </p>

          {mfaError && (
            <div className="p-4 mb-6 bg-red-950/50 border border-red-900/50 rounded-lg text-red-400 text-sm">
              {mfaError}
            </div>
          )}

          {mfaStatus === 'disabled' && (
            <button
              onClick={handleEnrollMfa}
              disabled={mfaLoading}
              className="px-6 py-3 bg-gradient-to-r from-[#00e5ff] to-[#00b0ff] hover:opacity-90 text-black font-semibold rounded-lg transition-all flex items-center space-x-2 cursor-pointer"
            >
              {mfaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
              <span>{t('Ativar Autenticação de 2 Fatores (TOTP)')}</span>
            </button>
          )}

          {mfaStatus === 'enrolling' && qrCode && (
            <div className="space-y-6">
              <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] inline-block">
                <img src={qrCode} alt="Código QR do MFA" className="w-48 h-48 rounded" />
              </div>
              <div className="max-w-md">
                <p className="text-sm text-gray-400 mb-4">
                  Escaneie o código QR acima com o seu aplicativo de autenticação (como Google Authenticator ou Microsoft Authenticator) e digite o código de 6 dígitos gerado:
                </p>
                <form onSubmit={handleVerifyMfa} className="flex gap-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="w-32 text-center text-xl font-mono tracking-widest bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:border-[#00e5ff] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={mfaLoading}
                    className="px-6 py-3 bg-[#00e5ff] text-black font-semibold rounded-lg hover:bg-[#00c8e6] transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    {mfaLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{t('Confirmar Código')}</span>
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => { setMfaStatus('disabled'); setQrCode(null); }}
                  className="mt-2 text-sm text-gray-500 hover:text-white transition-colors block cursor-pointer"
                >
                  {t('Cancelar')}
                </button>
              </div>
            </div>
          )}

          {mfaStatus === 'active' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-green-400 font-medium mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('Seu MFA está ativado e protegendo sua conta!')}</span>
              </div>
              {factors.map(f => (
                <div key={f.id} className="flex justify-between items-center p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                  <div>
                    <p className="text-sm text-white font-medium">Aplicativo de Autenticação (TOTP)</p>
                    <p className="text-xs text-gray-500">Adicionado em: {new Date(f.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleUnenrollMfa(f.id)}
                    disabled={mfaLoading}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    {t('Desativar')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
    </div>
  </div>
  )
}