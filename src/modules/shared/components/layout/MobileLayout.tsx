import { Outlet, Link, useLocation } from 'react-router'
import { PackageSearch, MessageSquare, Gavel, LogOut } from 'lucide-react'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useNavigate } from 'react-router'

export default function MobileLayout() {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Ocultar a barra inferior na tela de login/registro
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen flex flex-col bg-[#060B14]">
      {/* O Outlet renderiza as páginas (MobileStoreHome, Catalog, etc) */}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Floating Bottom Navigation - visível em todas as telas do app, exceto login */}
      {!isAuthPage && (
        <div className="fixed bottom-6 left-6 right-6 z-50">
          <div className="flex items-center justify-around bg-[#0B1220]/90 backdrop-blur-xl border border-white/10 rounded-3xl py-3 px-6 shadow-2xl shadow-black/50">
            <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname === '/' ? 'text-daig-blue' : 'text-gray-500 hover:text-white'}`}>
              <PackageSearch className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Home</span>
            </Link>
            <Link to="/messages" className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname.startsWith('/messages') ? 'text-daig-blue' : 'text-gray-500 hover:text-white'}`}>
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Chat</span>
            </Link>
            <Link to="/auctions" className={`flex flex-col items-center gap-1 p-2 transition-colors ${location.pathname.startsWith('/auctions') ? 'text-daig-blue' : 'text-gray-500 hover:text-white'}`}>
              <Gavel className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Leilões</span>
            </Link>
            <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
