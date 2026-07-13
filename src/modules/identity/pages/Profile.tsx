import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { User, Phone, MapPin, Camera, Loader2, Shield, QrCode, CheckCircle2 } from 'lucide-react'
import { fetchPostal } from '@/modules/shared/lib/postal'

export default function Profile() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
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


  const handlePostalBlur = useCallback(async () => {
    const raw = formData.zip_code.replace(/\D/g, '')
    if (raw.length < 5) return
    setPostalLoading(true)
    const result = await fetchPostal(raw)
    if (result) {
      setFormData(prev => ({
        ...prev,
        address: result.fullAddress || prev.address,
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
          Meu Perfil
        </h1>

        <div className="card p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff3d00] to-[#00e5ff] flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-[#ff3d00] rounded-full text-white">
                <Camera className="w-4 h-4" />
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
                <label className="block text-gray-400 text-sm mb-2">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Endereço</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white"
                  placeholder="Rua, número, complemento"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Estado</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">CEP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    onBlur={handlePostalBlur}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-4 pr-10 py-3 text-white"
                  />
                  {postalLoading && (
                    <Loader2 className="w-4 h-4 text-[#ff3d00] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff3d00] hover:bg-[#dd2c00] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar Alterações</span>
              )}
            </button>
          </form>
        </div>

        {/* MFA Card */}
        <div className="card p-8 mt-8 border border-[#2a2a2a] bg-[#0e0e0e] rounded-xl animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-[#00e5ff]" />
            <h2 className="text-xl font-semibold text-white">Autenticação de Dois Fatores (MFA)</h2>
          </div>

          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Adicione uma camada extra de segurança à sua conta exigindo um código de verificação sempre que fizer login. Recomendado para todos os vendedores e administradores.
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
              className="px-6 py-3 bg-gradient-to-r from-[#00e5ff] to-[#00b0ff] hover:opacity-90 text-black font-semibold rounded-lg transition-all flex items-center space-x-2"
            >
              {mfaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
              <span>Ativar Autenticação de 2 Fatores (TOTP)</span>
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
                    className="px-6 py-3 bg-[#00e5ff] text-black font-semibold rounded-lg hover:bg-[#00c8e6] transition-colors flex items-center space-x-2"
                  >
                    {mfaLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>Confirmar Código</span>
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => { setMfaStatus('disabled'); setQrCode(null); }}
                  className="mt-2 text-sm text-gray-500 hover:text-white transition-colors block"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {mfaStatus === 'active' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-green-400 font-medium mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span>Seu MFA está ativado e protegendo sua conta!</span>
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
                    className="text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    Desativar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}