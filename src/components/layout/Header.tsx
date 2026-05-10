import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useState } from 'react'
import { Menu, X, Search, Heart, User, LogOut, Plus, MessageCircle } from 'lucide-react'
import LanguageDetector from '../LanguageDetector'
import { useI18n } from '../../lib/i18n'

export default function Header() {
  const { user, signOut } = useAuthStore()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="font-display font-bold text-xl text-text">
              JAPANCAR<span className="text-primary">PARTS</span>
            </span>
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

            {user ? (
              <>
                <Link
                  to="/favorites"
                  className="text-gray-700 hover:text-[#ffd700] transition-colors p-2"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link
                  to="/messages"
                  className="text-gray-700 hover:text-[#ffd700] transition-colors p-2"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <Link
                  to="/create-listing"
                  className="flex items-center space-x-1 bg-primary hover:bg-primary-dark text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('Vender')}</span>
                </Link>
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
                  className="block py-2 text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('Mensagens')}
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