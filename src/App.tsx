import { Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from './lib/i18n'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import CarList from './pages/CarList'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateListing from './pages/CreateListing'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Messages from './pages/Messages'
import PaymentCheckout from './pages/PaymentCheckout'
import UserManagement from './pages/admin/UserManagement'
import ImageTo3D from './pages/admin/ImageTo3D'
import ReviewManagement from './pages/admin/ReviewManagement'
import PWARegister from './components/PWARegister'
import TransactionManagement from './pages/admin/TransactionManagement'
import LogistixDashboard from './pages/admin/LogistixDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import TrackingPublico from './pages/TrackingPublico'
import MobileApp from './pages/mobile/MobileApp'
import WorkerApp from './pages/mobile/WorkerApp'
import QRInstallPage from './pages/mobile/QRInstallPage'
import AgenciaPage from './pages/mobile/AgenciaPage'
import MotionFramePage from './pages/MotionFramePage'
import ImmersiveExperience from './pages/ImmersiveExperience'
import Auctions from './pages/Auctions'
import PartsLookup from './pages/PartsLookup'
import ChatPopup from './components/ChatPopup'
import ScrollToTop from './components/ScrollToTop'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

function App() {
  const { user, initialized, loading, initialize } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showChat, setShowChat] = useState(true)

  const isCheckout = location.pathname.startsWith('/checkout')

  useEffect(() => { initialize() }, [initialize])

  // Redirecionar baseado na role após login
  useEffect(() => {
    if (!initialized || loading || !user) return
    // Only redirect when user lands on login or register pages (public entry points)
    const redirectRoutes = ['/login', '/register']
    if (!redirectRoutes.includes(location.pathname)) return

    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else if (user.role === 'seller') {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/catalog', { replace: true })
    }
  }, [user, initialized, loading, location.pathname, navigate])

  return (
    <I18nProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Páginas Públicas (sem login) */}
          <Route path="catalog" element={<Catalog />} />
          <Route path="parts" element={<PartsLookup />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cars" element={<CarList />} />
          <Route path="auctions" element={<Auctions />} />
          
          {/* Rotas Protegidas (Exigem Login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-listing" element={<CreateListing />} />
            <Route path="profile" element={<Profile />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="messages" element={<Messages />} />
            <Route path="checkout/:id" element={<PaymentCheckout />} />
            <Route path="motion-frame" element={<MotionFramePage />} />
          </Route>
        </Route>

        <Route path="/admin" element={<ProtectedRoute requireAdmin />}>
          <Route index element={<LogistixDashboard />} />
          <Route path="dashboard" element={<LogistixDashboard />} />
          <Route path="logistix" element={<LogistixDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="image-to-3d" element={<ImageTo3D />} />
        </Route>

        {/* App Mobile Logistix */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<MobileApp />} />
          <Route path="worker" element={<WorkerApp />} />
          <Route path="worker/install" element={<QRInstallPage />} />
          <Route path="agencia" element={<AgenciaPage />} />
        </Route>

        {/* Rastreamento público (sem login) */}
        <Route path="rastreio" element={<TrackingPublico />} />

        {/* Experiência Imersiva (Active Theory) */}
        <Route path="immersive" element={<ImmersiveExperience />} />

        {/* Redirecionamento para rotas inexistentes (404) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && showChat && !isCheckout && <ChatPopup onClose={() => setShowChat(false)} />}
      {user && !showChat && !isCheckout && (
        <button onClick={() => setShowChat(true)} className="fixed bottom-4 right-4 bg-daig-blue text-white p-4 rounded-full shadow-lg z-50 hover:bg-daig-blue/80">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
      <PWARegister />
    </I18nProvider>
  )
}

export default App