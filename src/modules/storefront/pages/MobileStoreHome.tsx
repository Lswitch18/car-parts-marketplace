import { Link } from 'react-router'
import { 
  PackageSearch, MessageSquare, Gavel, Globe, User, Bell, ChevronRight, Zap, 
  ShieldCheck, Sparkles, Cpu, Search, ArrowUpRight, CheckCircle2 
} from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'

export default function MobileStoreHome() {
  const { t, language, setLanguage } = useI18n()
  const { user, signOut, signInGoogle, signInApple } = useAuthStore()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [searchVin, setSearchVin] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const triggerHaptic = (ms = 10) => {
    try { (navigator as any).vibrate?.(ms) } catch {}
  }

  const toggleLanguage = () => {
    triggerHaptic(12)
    const langs = ['ja', 'pt'] as const
    const nextIndex = (langs.indexOf(language as any) + 1) % langs.length
    setLanguage(langs[nextIndex])
  }

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    triggerHaptic(15)
    try {
      await signInGoogle()
    } catch (err) {
      console.error('[MobileStoreHome] Erro login Google:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setAuthLoading(true)
    triggerHaptic(15)
    try {
      await signInApple()
    } catch (err) {
      console.error('[MobileStoreHome] Erro login Apple:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleChassisSearch = (chassisCode: string) => {
    triggerHaptic(12)
    navigate(`/catalog?q=${encodeURIComponent(chassisCode)}`)
  }

  const popularChassis = [
    { label: 'Skyline R34', code: 'BNR34' },
    { label: 'Supra A80', code: 'JZA80' },
    { label: 'Silvia S15', code: 'S15' },
    { label: 'RX-7 FD', code: 'FD3S' },
    { label: 'Civic EK9', code: 'EK9' },
  ]

  const featuredParts = [
    {
      id: 'rb26-plenum',
      title: 'RB26DETT Nismo Intake Plenum',
      chassis: 'Skyline BNR34 / R33',
      price: '¥ 145,000',
      grade: t('Raridade Grade A+'),
      tagColor: '#00E5FF',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'brembo-gold',
      title: 'Brembo Gold 4-Piston Caliper Kit',
      chassis: 'Impreza GDB / Fairlady Z33',
      price: '¥ 88,000',
      grade: t('OEM Original'),
      tagColor: '#0D75FF',
      image: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'tein-flex',
      title: 'Tein Mono Sport Damper Coilover',
      chassis: 'Mazda RX-7 FD3S',
      price: '¥ 112,000',
      grade: t('Raridade Grade A+'),
      tagColor: '#7000FF',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    },
  ]

  const quickServices = [
    { to: '/catalog', icon: PackageSearch, label: t('Catálogo'), sub: 'JDM Parts', color: '#0D75FF', bg: 'rgba(13,117,255,0.12)' },
    { to: '/messages', icon: MessageSquare, label: t('Mensagens'), sub: 'Direct Chat', color: '#00E5FF', bg: 'rgba(0,229,255,0.12)' },
    { to: '/catalog', icon: Gavel, label: t('Leilões'), sub: 'Live Bids', color: '#FFA000', bg: 'rgba(255,160,0,0.12)' },
    { to: '/profile', icon: User, label: t('Perfil'), sub: 'My Garage', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  ]

  return (
    <div className="min-h-screen bg-[#060B14] text-white flex flex-col relative overflow-hidden font-sans pb-32">
      {/* Ambient Cyber Space Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-15%] left-[-20%] w-[85%] h-[55%] rounded-full opacity-25 blur-[130px] transition-all duration-1000 ${mounted ? 'scale-100' : 'scale-50'}`} style={{ background: '#0D75FF' }} />
        <div className={`absolute top-[40%] right-[-30%] w-[80%] h-[60%] rounded-full opacity-15 blur-[140px] transition-all duration-1000 delay-300 ${mounted ? 'scale-100' : 'scale-50'}`} style={{ background: '#7000FF' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay"></div>
      </div>

      {/* Header com Safe-Area */}
      <header className="relative z-10 px-5 pt-12 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => { triggerHaptic(10); navigate(user ? '/profile' : '/login') }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0D75FF] via-[#00E5FF] to-[#7000FF] rounded-full blur-[6px] opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-[#0B0E17] border border-white/15 overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-black text-base text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#0D75FF]">
              {user ? t('Bem-vindo de volta') : t('Bem-vindo')}
            </span>
            <h1 className="font-display font-bold text-lg text-white tracking-tight truncate max-w-[170px]">
              {user?.name?.split(' ')[0] || t('Visitante')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleLanguage} 
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] backdrop-blur-md active:scale-95"
            aria-label="Alterar idioma"
          >
            <Globe className="w-4 h-4 text-zinc-300" />
            <span className="absolute -top-1 -right-1 text-[8px] font-black uppercase bg-[#0D75FF] text-white px-1 rounded-full border border-[#060B14]">
              {language}
            </span>
          </button>
          
          <button 
            onClick={() => triggerHaptic(8)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] backdrop-blur-md active:scale-95"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4 text-zinc-300" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00E5FF] rounded-full shadow-[0_0_8px_#00E5FF]"></span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-5 pt-1 flex flex-col gap-5">
        
        {/* Banner Hero Cinematográfico */}
        <div 
          className={`relative w-full rounded-[1.75rem] p-5 overflow-hidden transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          style={{ 
            background: 'linear-gradient(135deg, rgba(13,117,255,0.18) 0%, rgba(112,0,255,0.14) 100%)', 
            boxShadow: '0 20px 40px -15px rgba(13,117,255,0.28)', 
            border: '1px solid rgba(255,255,255,0.1)' 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-40 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D75FF]/20 border border-[#0D75FF]/30 mb-3">
              <Zap className="w-3 h-3 text-[#00E5FF]" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#00E5FF]">{t('Marketplace JDM')}</span>
            </div>
            <h2 className="text-xl font-display font-extrabold text-white mb-1.5 leading-tight">
              {t('Encontre a peça ideal')}<br/>{t('para o seu projeto')}
            </h2>
            <Link 
              to="/catalog" 
              onClick={() => triggerHaptic(12)}
              className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-xl border border-white/15 hover:bg-white/20 transition-all backdrop-blur-md active:scale-95"
            >
              {t('Explorar Catálogo')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="absolute right-[-15%] bottom-[-30%] w-[60%] h-[140%] bg-gradient-to-l from-[#0D75FF]/35 to-transparent blur-2xl rotate-12 pointer-events-none"></div>
        </div>

        {/* Valuation & Trust Bar — Selos Oficiais do Japão */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm text-center">
            <ShieldCheck className="w-4 h-4 text-[#00E5FF] mb-1" />
            <span className="text-[9px] font-bold tracking-tight text-white/90 leading-tight">{t('Inspeção Kobutsu-sho')}</span>
            <span className="text-[8px] text-zinc-400 mt-0.5">古物商許可</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm text-center">
            <Zap className="w-4 h-4 text-[#0D75FF] mb-1" />
            <span className="text-[9px] font-bold tracking-tight text-white/90 leading-tight">{t('Proteção Escrow Stripe JDM')}</span>
            <span className="text-[8px] text-zinc-400 mt-0.5">Stripe JPY</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm text-center">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] mb-1" />
            <span className="text-[9px] font-bold tracking-tight text-white/90 leading-tight">{t('Autenticidade Garantida')}</span>
            <span className="text-[8px] text-zinc-400 mt-0.5">{t('Disponível no Japão')}</span>
          </div>
        </div>

        {/* Card de Login Direto com Google e Apple para Visitantes */}
        {!user && (
          <div
            className={`relative rounded-[1.5rem] p-4.5 overflow-hidden transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            style={{
              background: 'linear-gradient(135deg, rgba(13,117,255,0.08) 0%, rgba(10,14,26,0.92) 100%)',
              border: '1px solid rgba(13,117,255,0.22)',
              boxShadow: '0 16px 36px -10px rgba(0,0,0,0.6), 0 0 30px rgba(13,117,255,0.06) inset',
            }}
          >
            <div className="mb-3.5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#0D75FF]">
                {t('Acesse sua conta')}
              </p>
              <p className="text-white font-semibold text-xs mt-0.5">
                {t('Entre para salvar favoritos e comprar')}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                aria-label={t('Continuar com Google')}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-900 py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-xs font-bold truncate">
                  {authLoading ? t('Entrando...') : t('Continuar com Google')}
                </span>
              </button>

              <button
                onClick={handleAppleLogin}
                disabled={authLoading}
                aria-label={t('Continuar com Apple')}
                className="w-full bg-black hover:bg-zinc-900 text-white border border-white/20 py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.36 12.76c0-2.3 1.88-3.4 1.97-3.45-1.08-1.57-2.75-1.79-3.34-1.81-1.42-.14-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.97.9-3.77 2.28-1.61 2.79-.41 6.93 1.16 9.2.76 1.1 1.67 2.34 2.86 2.29 1.15-.04 1.58-.74 2.97-.74s1.78.74 3 .72c1.24-.02 2.02-1.12 2.78-2.23.88-1.28 1.24-2.52 1.26-2.58-.03-.01-2.42-.93-2.39-3.72zM14.16 4.06c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.02.08 2.07-.52 2.71-1.28z"/>
                </svg>
                <span className="text-xs font-bold truncate">
                  {authLoading ? t('Entrando...') : t('Continuar com Apple')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Busca Instantânea por Chassi (VIN / Frame #) */}
        <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
              {t('Buscar por Chassi / VIN')}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">OEM Fitment</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0B0E17] border border-white/10 rounded-xl px-3 py-2 mb-3">
            <Search className="w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              value={searchVin}
              onChange={(e) => setSearchVin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchVin.trim()) {
                  handleChassisSearch(searchVin.trim())
                }
              }}
              placeholder="Ex: BNR34, S15, JZA80..." 
              className="bg-transparent text-xs text-white placeholder-zinc-500 flex-1 outline-none font-mono"
            />
            {searchVin && (
              <button 
                onClick={() => handleChassisSearch(searchVin.trim())}
                className="text-[10px] font-bold text-[#0D75FF] px-2 py-0.5 rounded bg-[#0D75FF]/15 active:scale-95"
              >
                Go
              </button>
            )}
          </div>

          {/* Quick Chassis Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {popularChassis.map((item) => (
              <button
                key={item.code}
                onClick={() => handleChassisSearch(item.code)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#0D75FF]/40 text-[10px] font-semibold text-zinc-300 hover:text-white whitespace-nowrap transition-all active:scale-95 font-mono"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase: Peças JDM Raras (Tech Spec Trading Cards) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0D75FF]" />
              <h3 className="font-display font-bold text-base text-white">{t('Peças JDM Raras')}</h3>
            </div>
            <Link 
              to="/catalog" 
              onClick={() => triggerHaptic(8)}
              className="text-[11px] font-semibold text-[#00E5FF] flex items-center gap-0.5 hover:underline"
            >
              {t('Ver todos')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
            {featuredParts.map((part) => (
              <div
                key={part.id}
                onClick={() => { triggerHaptic(10); navigate('/catalog') }}
                className="flex-shrink-0 w-[210px] rounded-2xl p-3 bg-white/[0.03] border border-white/[0.08] hover:border-[#0D75FF]/40 transition-all duration-300 backdrop-blur-md cursor-pointer group active:scale-[0.98]"
              >
                <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2.5 bg-black/40">
                  <img 
                    src={part.image} 
                    alt={part.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span 
                    className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase px-2 py-0.5 rounded-md backdrop-blur-md border border-white/20 text-white"
                    style={{ background: `${part.tagColor}80` }}
                  >
                    {part.grade}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-white truncate mb-1">{part.title}</h4>
                <p className="text-[10px] text-zinc-400 font-mono truncate mb-2">{part.chassis}</p>
                
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="font-mono font-black text-sm text-[#00E5FF]">{part.price}</span>
                  <span className="text-[9px] font-semibold text-white/70 bg-white/5 px-2 py-0.5 rounded-md group-hover:bg-[#0D75FF] group-hover:text-white transition-colors">
                    {t('Ver Detalhes')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Serviços Rápidos (Grid 2x2 Harmonioso) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-display font-bold text-base text-white">{t('Serviços Rápidos')}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickServices.map((action, idx) => (
              <Link 
                key={action.label}
                to={action.to} 
                onClick={() => triggerHaptic(10)}
                className={`group relative flex flex-col p-4 rounded-2xl transition-all duration-300 overflow-hidden backdrop-blur-md transform active:scale-95 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ 
                  background: 'rgba(255,255,255,0.025)', 
                  border: '1px solid rgba(255,255,255,0.07)',
                  transitionDelay: `${idx * 60}ms`
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  style={{ background: `radial-gradient(circle at center, ${action.color}15 0%, transparent 80%)` }} 
                />
                
                <div 
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105" 
                  style={{ background: action.bg, border: `1px solid ${action.color}40`, boxShadow: `0 6px 18px -4px ${action.color}50` }}
                >
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                
                <span className="font-bold text-white text-xs tracking-wide">{action.label}</span>
                <span className="text-[9px] text-zinc-400 font-mono mt-0.5">{action.sub}</span>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

