import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useState, useEffect } from 'react'
import { Menu, X, Search, Heart, User, LogOut, Plus, MessageCircle, ArrowRight, Package, Sparkles } from 'lucide-react'
import LanguageDetector from '../LanguageDetector'
import { useI18n } from '../../lib/i18n'
import { supabase } from '../../lib/supabase'
import GaidLogo from '../GaidLogo'

export default function Header() {
  const { user, signOut } = useAuthStore()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setIsAdmin(data?.role === 'admin')
    }
    checkAdmin()
  }, [user])

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
      
      // Inscrever em mudanças nas mensagens (Realtime)
      const channel = supabase
        .channel(`unread_messages_${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, () => {
          fetchUnreadCount()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`)
      setMenuOpen(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link 
            to="/" 
            className="flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            <GaidLogo size={60} className="-ml-4 md:-ml-8" />
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('Buscar peças, marcas, modelos...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center space-x-2">
            <LanguageDetector />
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/catalog"
              className="text-text hover:text-primary transition-colors px-3 py-2 font-medium"
            >
              {t('Catálogo')}
            </Link>

            <Link
              to="/cars"
              className="text-text hover:text-primary transition-colors px-3 py-2 font-medium"
            >
              {t('Compatibilidade')}
            </Link>

            <Link
              to="/home"
              className="text-text hover:text-primary transition-colors px-3 py-2 font-medium flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]"></span>
              </span>
              <span>{t('Showroom 3D')}</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/favorites"
                  className="text-gray-700 hover:text-[#ffd700] transition-colors p-2"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                {/* Notification Dropdown para Mensagens */}
                <div className="relative">
                  <button
                    onClick={() => setMessagesOpen(!messagesOpen)}
                    onBlur={() => setTimeout(() => setMessagesOpen(false), 200)}
                    className="text-gray-700 hover:text-primary transition-colors p-2 relative"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-surface">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {messagesOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h4 className="font-bold text-gray-900">{t('Mensagens')}</h4>
                        <p className="text-xs text-gray-500">
                          {unreadCount > 0 
                            ? `Você tem ${unreadCount} mensagens pendentes` 
                            : 'Nenhuma mensagem nova'}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/messages"
                          className="flex items-center justify-between w-full p-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors group"
                        >
                          <span>{t('Ir para Mensagens')}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/create-listing"
                  className="flex items-center space-x-1 bg-primary hover:bg-primary-dark text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('Vender')}</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/image-to-3d"
                    title="Gerador 3D AI"
                    className="p-2 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-all flex items-center justify-center shadow-sm"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-[#ffd700] p-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-gray-900 font-medium">{user.name || user.email}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/dashboard"
                        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        {t('Dashboard')}
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        {t('Perfil')}
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            className="block px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-2 font-medium"
                          >
                            <Package className="w-4 h-4" />
                            <span>Logistix WMS</span>
                          </Link>
                          <Link
                            to="/admin/image-to-3d"
                            className="block px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg flex items-center space-x-2 font-medium"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Gerador 3D AI</span>
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('Sair')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-text hover:text-primary transition-colors px-3 py-2 font-medium"
                >
                  {t('Entrar')}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('Cadastrar')}
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden text-gray-700 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('Buscar peças, marcas, modelos...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </form>
          <nav className="space-y-2">
            <Link 
              to="/catalog" 
              className="block py-2 text-gray-700 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {t('Catálogo')}
            </Link>

            <Link 
              to="/cars" 
              className="block py-2 text-gray-700 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {t('Compatibilidade')}
            </Link>

            <Link 
              to="/home" 
              className="py-2 text-[#00E5FF] font-medium flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span>{t('Showroom 3D')}</span>
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('Dashboard')}
                </Link>
                <Link 
                  to="/favorites" 
                  className="block py-2 text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('Favoritos')}
                </Link>
                <Link 
                  to="/messages" 
                  className="py-2 text-gray-700 flex items-center justify-between"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{t('Mensagens')}</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/create-listing" 
                  className="block py-2 text-[#ffd700] font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('Vender')}
                </Link>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }} 
                  className="block py-2 text-red-600"
                >
                  {t('Sair')}
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('Entrar')}
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 text-[#ffd700] font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('Cadastrar')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}