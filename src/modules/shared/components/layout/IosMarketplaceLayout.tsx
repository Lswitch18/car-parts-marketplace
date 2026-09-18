import { Outlet, Link, useLocation, useNavigate } from 'react-router'
import { Home, Search, MessageCircle, User, LogOut, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useI18n } from '@/modules/shared/lib/i18n'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/**
 * IosMarketplaceLayout — dock premium Cyber Neon para iOS marketplace puro
 * - Mantém paleta DAIG_TOKENS intacta (glass-ultra, neon)
 * - Safe-area + thumb-zone + backdrop-blur (iOS 17+)
 * - GSAP stagger 0.04, haptics light no tap, hide on scroll-down
 */
export default function IosMarketplaceLayout() {
  const { user, signOut } = useAuthStore()
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const dockRef = useRef<HTMLDivElement>(null)
  const prevScrollY = useRef(0)

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  const handleLogout = async () => {
    try { (navigator as any).vibrate?.(20) } catch {}
    await signOut()
    navigate('/login')
  }

  // GSAP dock entrance (madewithgsap.com: stagger + back.out)
  useGSAP(() => {
    if (!dockRef.current || isAuthPage) return
    const items = dockRef.current.querySelectorAll('.dock-item')
    gsap.fromTo(
      items,
      { y: 20, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.04, ease: 'back.out(1.4)', clearProps: 'transform' }
    )
  }, { dependencies: [isAuthPage], scope: dockRef })

  // Hide dock on scroll-down (premium iOS behavior)
  useEffect(() => {
    if (isAuthPage) return
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - prevScrollY.current
      if (!dockRef.current) return
      if (delta > 10 && y > 120) {
        gsap.to(dockRef.current, { y: 120, opacity: 0, duration: 0.3, ease: 'power3.in' })
      } else if (delta < -10) {
        gsap.to(dockRef.current, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
      }
      prevScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isAuthPage])

  const tabs = [
    { to: '/', icon: Home, label: t('Home'), test: (p: string) => p === '/' },
    { to: '/catalog', icon: Search, label: t('Catálogo'), test: (p: string) => p.startsWith('/catalog') || p.startsWith('/product') },
    { to: '/messages', icon: MessageCircle, label: t('Mensagens'), test: (p: string) => p.startsWith('/messages') },
    { to: '/profile', icon: User, label: t('Perfil'), test: (p: string) => p.startsWith('/profile') },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#060B14] relative">
      {/* Ambient glows (subtle) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px] opacity-[0.07]" style={{ background: '#0D75FF' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.05]" style={{ background: '#7000FF' }} />
      </div>

      <main className={`flex-1 relative z-10 ios-content ${isAuthPage ? '!pb-0' : ''}`}>
        <Outlet />
      </main>

      {!isAuthPage && (
        <div
          ref={dockRef}
          className="fixed z-50 left-6 right-6 flex justify-center pointer-events-none"
          style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}
        >
          <nav
            className="pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-[28px] border shadow-2xl"
            style={{
              background: 'rgba(11,14,23,0.82)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderColor: 'rgba(13,117,255,0.14)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 60px rgba(13,117,255,0.08)',
            }}
            aria-label="Navegação principal"
          >
            {tabs.map((tab) => {
              const active = tab.test(location.pathname)
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  onClick={() => { try { (navigator as any).vibrate?.(10) } catch {} }}
                  className={`dock-item relative flex flex-col items-center justify-center min-w-[64px] px-3 py-2 rounded-2xl transition-all ${active ? 'text-white' : 'text-white/45 hover:text-white/80'}`}
                  style={active ? { background: 'rgba(13,117,255,0.14)', boxShadow: '0 0 20px rgba(13,117,255,0.18) inset' } : undefined}
                >
                  <tab.icon className={`w-[22px] h-[22px] ${active ? 'text-[#0D75FF]' : ''}`} strokeWidth={active ? 2.4 : 1.8} />
                  <span className={`text-[10px] font-semibold tracking-wide mt-1 ${active ? 'text-white' : 'text-white/50'}`}>{tab.label}</span>
                  {active && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#0D75FF] shadow-[0_0_10px_rgba(13,117,255,0.8)]" />}
                </Link>
              )
            })}

            {/* Separador + carrinho/sair */}
            <div className="w-px h-10 bg-white/10 mx-1" />
            <Link
              to="/catalog"
              className="dock-item flex flex-col items-center justify-center min-w-[56px] px-2 py-2 rounded-2xl text-white/45 hover:text-white/80"
              aria-label={t('Catálogo')}
            >
              <ShoppingBag className="w-[20px] h-[20px]" />
              <span className="text-[10px] font-semibold mt-1">Shop</span>
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="dock-item flex flex-col items-center justify-center min-w-[56px] px-2 py-2 rounded-2xl text-white/40 hover:text-red-400"
                aria-label={t('Sair')}
              >
                <LogOut className="w-[20px] h-[20px]" />
                <span className="text-[10px] font-semibold mt-1">{t('Sair')}</span>
              </button>
            ) : (
              <Link to="/login" className="dock-item flex items-center justify-center px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#0D75FF] to-[#7000FF] text-white text-xs font-bold shadow-[0_4px_20px_rgba(13,117,255,0.35)]">
                {t('Entrar')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
