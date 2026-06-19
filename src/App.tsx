import { Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from '@/modules/shared/lib/i18n'
import Layout from '@/modules/shared/components/layout/Layout'
import Home from '@/modules/storefront/pages/Home'
import Catalog from '@/modules/parts-catalog/pages/Catalog'
import ProductDetail from '@/modules/parts-catalog/pages/ProductDetail'
import CarList from '@/modules/parts-catalog/pages/CarList'
import Login from '@/modules/identity/pages/Login'
import Register from '@/modules/identity/pages/Register'
import Dashboard from '@/modules/backoffice/pages/Dashboard'
import CreateListing from '@/modules/parts-catalog/pages/CreateListing'
import Profile from '@/modules/identity/pages/Profile'
import Favorites from '@/modules/parts-catalog/pages/Favorites'
import Messages from '@/modules/chat/pages/Messages'
import PaymentCheckout from '@/modules/transactions/pages/PaymentCheckout'
import UserManagement from '@/modules/identity/pages/UserManagement'
import ImageTo3D from '@/modules/visualization3d/pages/ImageTo3D'
import ReviewManagement from '@/modules/reputation/pages/ReviewManagement'
import AdminDashboard from '@/modules/backoffice/pages/AdminDashboard'
import ContactsManagement from '@/modules/crm/pages/ContactsManagement'
import AccountsPayable from '@/modules/finance/pages/AccountsPayable'
import PWARegister from '@/modules/shared/components/PWARegister'
import TransactionManagement from '@/modules/transactions/pages/TransactionManagement'
import LogistixDashboard from '@/modules/logistics/pages/LogistixDashboard'
import ProtectedRoute from '@/modules/identity/components/ProtectedRoute'
import TrackingPublico from '@/modules/logistics/pages/TrackingPublico'
import MobileApp from '@/modules/transportation/pages/MobileApp'
import WorkerApp from '@/modules/transportation/pages/WorkerApp'
import QRInstallPage from '@/modules/transportation/pages/QRInstallPage'
import AgenciaPage from '@/modules/transportation/pages/AgenciaPage'
import MotionFramePage from '@/modules/visualization3d/pages/MotionFramePage'
import ImmersiveExperience from '@/modules/visualization3d/pages/ImmersiveExperience'
import Auctions from '@/modules/auctions/pages/Auctions'
import PartsLookup from '@/modules/parts-catalog/pages/PartsLookup'
import ScrollToTop from '@/modules/shared/components/ScrollToTop'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'

function App() {
  const { user, initialized, loading, initialize } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

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
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="logistix" element={<LogistixDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="image-to-3d" element={<ImageTo3D />} />
          <Route path="crm/contacts" element={<ContactsManagement />} />
          <Route path="finance/payable" element={<AccountsPayable />} />
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
      <PWARegister />
    </I18nProvider>
  )
}

export default App