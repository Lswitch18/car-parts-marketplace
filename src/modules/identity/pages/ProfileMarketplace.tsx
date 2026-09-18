import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { useI18n } from '@/modules/shared/lib/i18n'
import { User, Phone, MapPin, Loader2, Sparkles, CheckCircle2, LogOut, Globe, Mail } from 'lucide-react'
import { fetchPostal } from '@/modules/shared/lib/postal'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'

/**
 * ProfileMarketplace — perfil iOS puro (sem Logistix/WMS/bank/MFA)
 * - Campos: nome, email (read-only), telefone, endereço JP (zipcloud)
 * - Idioma pt↔ja, logout, avatar inicial
 * - Glass-ultra + GSAP premium (madewithgsap)
 */
export default function ProfileMarketplace() {
  const { t, language, setLanguage } = useI18n()
  const navigate = useNavigate()
  const { user, setUser, signOut } = useAuthStore()
  const containerRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip_code: user?.zip_code || (user as any)?.cep || '',
  })
  const [postalLoading, setPostalLoading] = useState(false)
  const [postalMsg, setPostalMsg] = useState<string | null>(null)

  useGSAP(() => {
    if (!containerRef.current) return
    gsap.from('.profile-card', { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', clearProps: 'transform' })
  }, { scope: containerRef })

  const handlePostalLookup = useCallback(async (code?: string) => {
    const raw = (code ?? formData.zip_code).replace(/\D/g, '')
    if (raw.length < 5) return
    setPostalLoading(true)
    setPostalMsg(null)
    const result = await fetchPostal(raw)
    if (result) {
      setFormData(prev => ({
        ...prev,
        address: result.street || result.fullAddress || prev.address,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }))
      setPostalMsg(t('Endereço preenchido automaticamente via Zipcloud Japan!'))
      setTimeout(() => setPostalMsg(null), 5000)
    }
    setPostalLoading(false)
  }, [formData.zip_code, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setLoading(true)
    try {
      const { data, error } = await supabase.from('profiles').update({
        full_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        cep: formData.zip_code,
      }).eq('id', user.id).select().single()
      if (error) throw error
      setUser({ ...user, name: data.full_name, full_name: data.full_name, phone: data.phone, address: data.address, city: data.city, state: data.state, zip_code: data.cep } as any)
    } catch (err: any) {
      alert(t('Erro ao atualizar perfil') + ': ' + (err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => { await signOut(); navigate('/login') }

  if (!user) { navigate('/login'); return null }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#060B14] py-6 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="profile-card flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">{t('Meu Perfil')}</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0B0E17] border border-white/10 rounded-full p-1">
              <button onClick={() => setLanguage('ja')} className={`px-3 py-1 rounded-full text-xs font-bold ${language==='ja'?'bg-[#0D75FF] text-white':'text-white/50'}`}>JA</button>
              <button onClick={() => setLanguage('pt')} className={`px-3 py-1 rounded-full text-xs font-bold ${language==='pt'?'bg-[#0D75FF] text-white':'text-white/50'}`}>PT</button>
              <Globe className="w-3 h-3 text-white/30 mr-1" />
            </div>
            <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="profile-card flex items-center gap-4 p-5 rounded-[20px] glass-ultra">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D75FF] to-[#00E5FF] p-0.5">
            <div className="w-full h-full rounded-full bg-[#0B0E17] flex items-center justify-center text-white font-display font-bold text-xl">
              {(formData.name || user.email || 'U')[0].toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{formData.name || t('Nome não definido')}</p>
            <p className="text-white/50 text-sm truncate flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-card p-5 rounded-[20px] glass-ultra space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><User className="w-4 h-4 text-[#00E5FF]" />{t('Dados Pessoais & Perfil')}</h2>

          <div>
            <label className="text-white/60 text-xs font-semibold">{t('Nome completo')}</label>
            <div className="relative mt-1.5">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})}
                className="w-full pl-10 pr-4 py-3.5 bg-[#06080F] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs font-semibold">Email</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={user.email} readOnly className="w-full pl-10 pr-4 py-3.5 bg-white/[0.04] border border-white/5 rounded-xl text-white/60 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs font-semibold">{t('Telefone')}</label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})}
                placeholder="090-1234-5678"
                className="w-full pl-10 pr-4 py-3.5 bg-[#06080F] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#00E5FF] outline-none" />
            </div>
          </div>

          {/* CEP JP Zipcloud */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">{t('CEP (Japão)')}</label>
              <span className="text-[10px] font-mono text-cyan-300 bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">🇯🇵 Zipcloud</span>
            </div>
            <div className="relative">
              <input value={formData.zip_code} onChange={e=>{ const v=e.target.value; setFormData({...formData,zip_code:v}); const d=v.replace(/\D/g,''); if(d.length===7) handlePostalLookup(v) }} onBlur={()=>handlePostalLookup()}
                placeholder="100-0001"
                className="w-full pl-4 pr-24 py-3.5 bg-[#06080F] border border-white/10 rounded-xl text-white font-mono text-sm placeholder-white/30 focus:border-[#00E5FF] outline-none" />
              <button type="button" disabled={postalLoading} onClick={()=>handlePostalLookup()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0D75FF]/20 border border-[#00E5FF]/30 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1">
                {postalLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                {t('Buscar 🇯🇵')}
              </button>
            </div>
            {postalMsg && <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>{postalMsg}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs">{t('Cidade')}</label>
                <input value={formData.city} onChange={e=>setFormData({...formData,city:e.target.value})}
                  className="mt-1 w-full px-3 py-3 bg-[#06080F] border border-white/10 rounded-xl text-white text-sm focus:border-[#00E5FF] outline-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs">{t('Estado')}</label>
                <input value={formData.state} onChange={e=>setFormData({...formData,state:e.target.value})}
                  className="mt-1 w-full px-3 py-3 bg-[#06080F] border border-white/10 rounded-xl text-white text-sm focus:border-[#00E5FF] outline-none" />
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs flex items-center gap-1"><MapPin className="w-3 h-3"/>{t('Endereço')}</label>
              <input value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})}
                placeholder={t('Rua, número, complemento')}
                className="mt-1 w-full px-3 py-3 bg-[#06080F] border border-white/10 rounded-xl text-white text-sm focus:border-[#00E5FF] outline-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(13,117,255,0.35)] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>{t('Salvando...')}</> : t('Salvar Alterações')}
          </button>
        </form>

        <p className="text-center text-[11px] text-white/25 font-mono px-4">
          {t('Seus dados bancários estão protegidos com padrão internacional de segurança financeira.')}
        </p>
      </div>
    </div>
  )
}
