import { Link } from 'react-router-dom'
import { PackageSearch, MessageSquare, CreditCard, Gavel, Globe, User, LogOut, Bell, ChevronRight, Zap } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function MobileStoreHome() {
  const { t, language, setLanguage } = useI18n()
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleLanguage = () => {
    const langs = ['ja', 'pt', 'en'] as const
    const nextIndex = (langs.indexOf(language as any) + 1) % langs.length
    setLanguage(langs[nextIndex])
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const actions = [
    { to: '/catalog', icon: PackageSearch, label: t('Catálogo'), color: '#0D75FF', bg: 'rgba(13,117,255,0.1)' },
    { to: '/messages', icon: MessageSquare, label: t('Mensagens'), color: '#00E5FF', bg: 'rgba(0,229,255,0.1)' },
    { to: '/auctions', icon: Gavel, label: t('Leilões'), color: '#FFA000', bg: 'rgba(255,160,0,0.1)' },
    { to: '/dashboard', icon: CreditCard, label: t('Pagamentos'), color: '#7000FF', bg: 'rgba(112,0,255,0.1)' },
    { to: '/profile', icon: User, label: t('Perfil'), color: '#4CAF50', bg: 'rgba(76,175,80,0.1)' },
  ]

  return (
    <div className="min-h-screen bg-[#060B14] text-text flex flex-col relative overflow-hidden font-sans pb-24">
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
          <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
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
              Bem-vindo de volta
            </span>
            <h1 className="font-display font-bold text-xl text-white tracking-tight truncate max-w-[150px]">
              {user?.name?.split(' ')[0] || 'Visitante'}
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={toggleLanguage} className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md">
            <Globe className="w-4 h-4 text-gray-300" />
            <span className="absolute top-0 right-0 text-[9px] font-bold uppercase bg-[#0D75FF] text-white px-1 rounded-full border border-[#060B14]">
              {language}
            </span>
          </button>
          
          <button className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md">
            <Bell className="w-4 h-4 text-gray-300" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#060B14]"></span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-6 pt-4 flex flex-col gap-8">
        
        {/* Banner Hero / Destaque */}
        <div className={`relative w-full rounded-[2rem] p-6 overflow-hidden transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
             style={{ background: 'linear-gradient(135deg, rgba(13,117,255,0.15) 0%, rgba(112,0,255,0.15) 100%)', boxShadow: '0 24px 48px -12px rgba(13,117,255,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-daig-blue/20 border border-daig-blue/30 mb-4">
              <Zap className="w-3.5 h-3.5 text-daig-blue" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-daig-blue">Marketplace JDM</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2 leading-tight">
              Encontre a peça ideal<br/>para o seu projeto
            </h2>
            <Link to="/catalog" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-white bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md">
              Explorar Catálogo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Decoração Abstrata do Banner */}
          <div className="absolute right-[-20%] bottom-[-40%] w-[70%] h-[150%] bg-gradient-to-l from-daig-blue/30 to-transparent blur-2xl rotate-12 pointer-events-none"></div>
        </div>

        {/* Serviços Principais */}
        <div>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="font-display font-bold text-lg text-white">Serviços Rápidos</h3>
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
