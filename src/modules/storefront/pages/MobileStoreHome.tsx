import { Link } from 'react-router'
import { PackageSearch, MessageSquare, CreditCard, Gavel, Globe, User, LogOut, Bell, ChevronRight, Zap } from 'lucide-react'
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

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleLanguage = () => {
    const langs = ['ja', 'pt'] as const
    const nextIndex = (langs.indexOf(language as any) + 1) % langs.length
    setLanguage(langs[nextIndex])
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    try {
      try { (navigator as any).vibrate?.(10) } catch {}
      await signInGoogle()
    } catch (err) {
      console.error('[MobileStoreHome] Erro login Google:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setAuthLoading(true)
    try {
      try { (navigator as any).vibrate?.(10) } catch {}
      await signInApple()
    } catch (err) {
      console.error('[MobileStoreHome] Erro login Apple:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  const actions = [
    { to: '/catalog', icon: PackageSearch, label: t('Catálogo'), color: '#0D75FF', bg: 'rgba(13,117,255,0.1)' },
    { to: '/messages', icon: MessageSquare, label: t('Mensagens'), color: '#00E5FF', bg: 'rgba(0,229,255,0.1)' },
    { to: '/catalog', icon: Gavel, label: t('Leilões'), color: '#FFA000', bg: 'rgba(255,160,0,0.1)' },
    { to: '/catalog', icon: CreditCard, label: t('Pagamentos'), color: '#7000FF', bg: 'rgba(112,0,255,0.1)' },
    { to: '/profile', icon: User, label: t('Perfil'), color: '#4CAF50', bg: 'rgba(76,175,80,0.1)' },
  ]

  return (
    <div className="min-h-screen bg-[#060B14] text-text flex flex-col relative overflow-hidden font-sans pb-28">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[60%] rounded-full opacity-30 blur-[120px] transition-all duration-1000 ${mounted ? 'scale-100' : 'scale-50'}`} style={{ background: '#0D75FF' }} />
        <div className={`absolute bottom-[10%] right-[-30%] w-[80%] h-[60%] rounded-full opacity-20 blur-[120px] transition-all duration-1000 delay-300 ${mounted ? 'scale-100' : 'scale-50'}`} style={{ background: '#7000FF' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-14 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar com Gradiente Animado */}
          <div className="relative group cursor-pointer" onClick={() => navigate(user ? '/profile' : '/login')}>
            <div className="absolute inset-0 bg-gradient-to-r from-daig-blue to-[#7000FF] rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-12 h-12 rounded-full flex items-center justify-center border-2 border-transparent bg-background overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-lg text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#0D75FF' }}>
              {user ? t('Bem-vindo de volta') : t('Bem-vindo')}
            </span>
            <h1 className="font-display font-bold text-xl text-white tracking-tight truncate max-w-[170px]">
              {user?.name?.split(' ')[0] || t('Visitante')}
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={toggleLanguage} 
            className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md"
            aria-label="Alterar idioma"
          >
            <Globe className="w-4 h-4 text-gray-300" />
            <span className="absolute top-0 right-0 text-[9px] font-bold uppercase bg-[#0D75FF] text-white px-1 rounded-full border border-[#060B14]">
              {language}
            </span>
          </button>
          
          <button 
            className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4 text-gray-300" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#060B14]"></span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-6 pt-2 flex flex-col gap-6">
        
        {/* Banner Hero / Destaque */}
        <div className={`relative w-full rounded-[2rem] p-6 overflow-hidden transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
             style={{ background: 'linear-gradient(135deg, rgba(13,117,255,0.15) 0%, rgba(112,0,255,0.15) 100%)', boxShadow: '0 24px 48px -12px rgba(13,117,255,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-daig-blue/20 border border-daig-blue/30 mb-4">
              <Zap className="w-3.5 h-3.5 text-daig-blue" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-daig-blue">{t('Marketplace JDM')}</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2 leading-tight">
              {t('Encontre a peça ideal')}<br/>{t('para o seu projeto')}
            </h2>
            <Link to="/catalog" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-white bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md">
              {t('Explorar Catálogo')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Decoração Abstrata do Banner */}
          <div className="absolute right-[-20%] bottom-[-40%] w-[70%] h-[150%] bg-gradient-to-l from-daig-blue/30 to-transparent blur-2xl rotate-12 pointer-events-none"></div>
        </div>

        {/* Card de Login Direto com Google e Apple na Home para Visitantes */}
        {!user && (
          <div
            className={`relative rounded-[1.75rem] p-5 overflow-hidden transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{
              background: 'linear-gradient(135deg, rgba(13,117,255,0.09) 0%, rgba(10,14,26,0.9) 100%)',
              border: '1px solid rgba(13,117,255,0.24)',
              boxShadow: '0 16px 36px -10px rgba(0,0,0,0.6), 0 0 30px rgba(13,117,255,0.08) inset',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#0D75FF]">
                  {t('Acesse sua conta')}
                </p>
                <p className="text-white font-semibold text-sm mt-0.5">
                  {t('Entre para salvar favoritos e comprar')}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                aria-label={t('Continuar com Google')}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-900 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-semibold truncate">
                  {authLoading ? t('Entrando...') : t('Continuar com Google')}
                </span>
              </button>

              <button
                onClick={handleAppleLogin}
                disabled={authLoading}
                aria-label={t('Continuar com Apple')}
                className="w-full bg-black hover:bg-zinc-900 text-white border border-white/20 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.36 12.76c0-2.3 1.88-3.4 1.97-3.45-1.08-1.57-2.75-1.79-3.34-1.81-1.42-.14-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.97.9-3.77 2.28-1.61 2.79-.41 6.93 1.16 9.2.76 1.1 1.67 2.34 2.86 2.29 1.15-.04 1.58-.74 2.97-.74s1.78.74 3 .72c1.24-.02 2.02-1.12 2.78-2.23.88-1.28 1.24-2.52 1.26-2.58-.03-.01-2.42-.93-2.39-3.72zM14.16 4.06c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.02.08 2.07-.52 2.71-1.28z"/>
                </svg>
                <span className="text-sm font-semibold truncate">
                  {authLoading ? t('Entrando...') : t('Continuar com Apple')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Serviços Principais */}
        <div>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="font-display font-bold text-lg text-white">{t('Serviços Rápidos')}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {actions.map((action, idx) => (
              <Link 
                key={action.label}
                to={action.to} 
                className={`group relative flex flex-col p-5 rounded-[1.5rem] transition-all duration-500 overflow-hidden backdrop-blur-lg transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  transitionDelay: `${idx * 100}ms`
                }}
              >
                {/* Efeito Hover Glass */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                     style={{ background: `radial-gradient(circle at center, ${action.color}15 0%, transparent 80%)` }} />
                
                {/* Ícone com Glow */}
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" 
                     style={{ background: action.bg, border: `1px solid ${action.color}40`, boxShadow: `0 8px 24px -6px ${action.color}60` }}>
                  <action.icon className="w-6 h-6" style={{ color: action.color }} />
                </div>
                
                <span className="font-semibold text-white text-sm tracking-wide">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
