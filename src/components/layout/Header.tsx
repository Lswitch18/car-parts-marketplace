import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useState, useEffect, useRef } from 'react'
import {
  Menu, X, Heart, User, LogOut,
  MessageCircle, ArrowRight, Package, Sparkles,
} from 'lucide-react'
import LanguageDetector from '../LanguageDetector'
import { useI18n } from '../../lib/i18n'
import { supabase } from '../../lib/supabase'
import GaidLogo from '../GaidLogo'

export default function Header() {
  const { user, signOut, isAdmin, loading, initialized, ensureSession } = useAuthStore()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)

  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const attempted = useRef(false)

  // Scroll shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Ensure auth session is loaded on any page that uses Header
  useEffect(() => {
    if (!initialized && !attempted.current) {
      attempted.current = true
      ensureSession()
    }
  }, [initialized, ensureSession])

  // Retry once after init if still no user
  useEffect(() => {
    if (initialized && !loading && !user && !attempted.current) {
      attempted.current = true
      ensureSession();
    }
  }, [initialized, loading, user, ensureSession]);

  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    if (!user) return
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false)
    if (!error) setUnreadCount(count || 0)
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const channel = supabase
        .channel(`unread_messages_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        }, () => fetchUnreadCount())
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [user])



  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  /* ── Shared nav-link style ── */
  const navLinkBase: React.CSSProperties = {
    color: '#B0B5C0',
    fontFamily: "'Sora', sans-serif",
    fontWeight: 500,
    fontSize: '0.875rem',
    padding: '6px 12px',
    borderRadius: '8px',
    transition: 'color 0.2s, background 0.2s',
    textDecoration: 'none',
  }

  // While loading, show skeleton in auth area - NEVER block the whole page
  const showAuthSkeleton = !initialized || loading

  if (!user) {
    return (
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? 'rgba(5,5,8,0.92)' : 'rgba(5,5,8,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(13,117,255,0.18)' : '1px solid rgba(255,255,255,0.04)',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(13,117,255,0.12)' : 'none',
          transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px] md:h-[76px]">
            <Link to="/" className="flex items-center flex-shrink-0" onClick={() => setMenuOpen(false)}>
              <GaidLogo size={52} animated />
            </Link>
            {showAuthSkeleton ? (
              // Subtle skeleton pulse while auth loads — don't flash "Entrar"
              <div
                style={{
                  width: 64,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ) : (
              <Link to="/login" className="text-sm font-medium" style={{ color: '#B0B5C0' }}>{t('Entrar')}</Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled
          ? 'rgba(5,5,8,0.92)'
          : 'rgba(5,5,8,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled
          ? '1px solid rgba(13,117,255,0.18)'
          : '1px solid rgba(255,255,255,0.04)',
        boxShadow: scrolled
          ? '0 4px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(13,117,255,0.12)'
          : 'none',
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] md:h-[76px]">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            <GaidLogo size={52} animated />
          </Link>



          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            <LanguageDetector />

            <Link
              to="/parts"
              style={navLinkBase}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = '#B0B5C0'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              Catálogo de Peças
            </Link>

            {(user) ? (
              <>
                {/* Favourites */}
                <Link
                  to="/favorites"
                  className="p-2 rounded-lg transition-all"
                  title={t('Favoritos')}
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.color = '#FFB800'
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,184,0,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Messages dropdown */}
                <div className="relative">
                  <button
                    id="header-messages-btn"
                    onClick={() => setMessagesOpen(!messagesOpen)}
                    onBlur={() => setTimeout(() => setMessagesOpen(false), 200)}
                    className="p-2 rounded-lg transition-all relative"
                    style={{ color: '#6B7280' }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.color = '#6B7280'
                      ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span
                        className="absolute top-1 right-1 text-[10px] font-bold min-w-[16px] text-center rounded-full"
                        style={{
                          background: '#FF4B4B',
                          color: '#FFFFFF',
                          padding: '1px 4px',
                          border: '2px solid rgba(5,5,8,0.9)',
                        }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {messagesOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 rounded-xl overflow-hidden"
                      style={{
                        background: 'rgba(10,10,15,0.95)',
                        border: '1px solid rgba(13,117,255,0.2)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                      }}
                    >
                      <div
                        className="p-4"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <h4 className="font-semibold text-white text-sm">{t('Mensagens')}</h4>
                        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                          {unreadCount > 0
                            ? `${unreadCount} mensagem${unreadCount > 1 ? 's' : ''} não lida${unreadCount > 1 ? 's' : ''}`
                            : 'Nenhuma mensagem nova'}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/messages"
                          className="flex items-center justify-between w-full p-3 rounded-lg text-sm font-medium transition-all group"
                          style={{ color: '#0D75FF' }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'rgba(13,117,255,0.1)')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'transparent')
                          }
                        >
                          <span>{t('Ir para Mensagens')}</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>





                {/* User avatar dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 p-1 rounded-lg transition-all"
                    style={{ color: '#B0B5C0' }}
                  >
                    {user?.avatar_url ? (
                      <img
                          src={user.avatar_url}
                          alt="User avatar"
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            // Fallback to default avatar if loading fails
                            (e.currentTarget as HTMLImageElement).src = '/default-avatar.png';
                          }}
                        />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #0D75FF 0%, #7000FF 100%)',
                          boxShadow: '0 0 10px rgba(13,117,255,0.4)',
                        }}
                      >
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                    style={{
                      background: 'rgba(10,10,15,0.97)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
                    }}
                  >
                    <div
                      className="p-4"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="text-white font-semibold text-sm truncate">
                        {user?.name || user?.email || 'Conectado'}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                        {user?.email || ''}
                      </p>
                    </div>

                    <div className="p-2">
                      {[
                        { to: '/dashboard', label: t('Dashboard') },
                        { to: '/profile', label: t('Perfil') },
                      ].map(({ to, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="block px-3 py-2 rounded-lg text-sm transition-all"
                          style={{ color: '#B0B5C0' }}
                          onMouseEnter={(e) => {
                            ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                            ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                          }}
                          onMouseLeave={(e) => {
                            ;(e.currentTarget as HTMLElement).style.color = '#B0B5C0'
                            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                          }}
                        >
                          {label}
                        </Link>
                      ))}

                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{ color: '#0D75FF' }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.background = 'rgba(13,117,255,0.1)')
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.background = 'transparent')
                            }
                          >
                            <Package className="w-4 h-4" />
                            Logistix WMS
                          </Link>
                          <Link
                            to="/admin/image-to-3d"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{ color: '#a855f7' }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.1)')
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.background = 'transparent')
                            }
                          >
                            <Sparkles className="w-4 h-4" />
                            Gerador 3D AI
                          </Link>
                        </>
                      )}

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                          style={{ color: '#FF4B4B' }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'rgba(255,75,75,0.08)')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background = 'transparent')
                          }
                        >
                          <LogOut className="w-4 h-4" />
                          {t('Sair')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  style={navLinkBase}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.color = '#B0B5C0'
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  {t('Entrar')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #0D75FF 0%, #0050c2 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 0 14px rgba(13,117,255,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-1px)'
                    el.style.boxShadow = '0 0 22px rgba(13,117,255,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = ''
                    el.style.boxShadow = '0 0 14px rgba(13,117,255,0.3)'
                  }}
                >
                  {t('Cadastrar')}
                </Link>
              </div>
            )}
          </nav>

          {/* ── Mobile hamburger ── */}
          <button
            id="header-mobile-menu-btn"
            className="md:hidden p-2 rounded-lg transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: '#B0B5C0', background: 'rgba(255,255,255,0.04)' }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            background: 'rgba(5,5,8,0.97)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="px-4 py-4 space-y-1">




            {(user) ? (
              <>
                <Link
                  to="/parts"
                  className="flex items-center justify-between py-3 px-3 rounded-lg text-sm font-medium"
                  style={{ color: '#B0B5C0' }}
                  onClick={() => setMenuOpen(false)}
                >
                  Catálogo de Peças
                </Link>
                {[
                  { to: '/dashboard', label: t('Dashboard') },
                  { to: '/favorites', label: t('Favoritos') },
                  { to: '/messages', label: t('Mensagens'), badge: unreadCount },
                ].map(({ to, label, badge }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center justify-between py-3 px-3 rounded-lg text-sm font-medium"
                    style={{ color: '#B0B5C0' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{label}</span>
                    {badge && badge > 0 && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#FF4B4B', color: '#FFFFFF' }}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                ))}





                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                  <button
                    onClick={() => { handleSignOut(); setMenuOpen(false) }}
                    className="flex items-center gap-2 py-3 px-3 rounded-lg text-sm w-full text-left"
                    style={{ color: '#FF4B4B' }}
                  >
                    <LogOut className="w-4 h-4" />
                    {t('Sair')}
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/parts"
                  className="block text-center py-3 px-4 rounded-xl text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#B0B5C0',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  Catálogo de Peças
                </Link>
                <Link
                  to="/login"
                  className="block text-center py-3 px-4 rounded-xl text-sm font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#B0B5C0',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('Entrar')}
                </Link>
                <Link
                  to="/register"
                  className="block text-center py-3 px-4 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #0D75FF 0%, #0050c2 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 0 16px rgba(13,117,255,0.3)',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('Cadastrar')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}