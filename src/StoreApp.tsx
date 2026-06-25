import { Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from '@/modules/shared/lib/i18n'
import MobileLayout from '@/modules/shared/components/layout/MobileLayout'
import ProtectedRoute from '@/modules/identity/components/ProtectedRoute'
import ScrollToTop from '@/modules/shared/components/ScrollToTop'
import PWARegister from '@/modules/shared/components/PWARegister'
import GlobalLoader from '@/modules/shared/components/GlobalLoader'
import { useEffect, Suspense, lazy } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'

// Lazy Loading
const MobileStoreHome = lazy(() => import('@/modules/storefront/pages/MobileStoreHome'))
const Catalog = lazy(() => import('@/modules/parts-catalog/pages/Catalog'))
const ProductDetail = lazy(() => import('@/modules/parts-catalog/pages/ProductDetail'))
const CarList = lazy(() => import('@/modules/vehicles/pages/CarList'))
const Login = lazy(() => import('@/modules/identity/pages/Login'))
const Register = lazy(() => import('@/modules/identity/pages/Register'))
const Dashboard = lazy(() => import('@/modules/backoffice/pages/Dashboard'))
const CreateListing = lazy(() => import('@/modules/parts-catalog/pages/CreateListing'))
const Profile = lazy(() => import('@/modules/identity/pages/Profile'))
const Favorites = lazy(() => import('@/modules/parts-catalog/pages/Favorites'))
const Messages = lazy(() => import('@/modules/chat/pages/Messages'))
const PaymentCheckout = lazy(() => import('@/modules/transactions/pages/PaymentCheckout'))
const Auctions = lazy(() => import('@/modules/auctions/pages/Auctions'))
const PartsLookup = lazy(() => import('@/modules/parts-catalog/pages/PartsLookup'))

function StoreApp() {
  const { user, initialized, loading, initialize } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { initialize() }, [initialize])

  // Redirecionamento após login (apenas nas telas de login/register)
  useEffect(() => {
    if (!initialized || loading || !user) return
    const redirectRoutes = ['/login', '/register']
    if (!redirectRoutes.includes(location.pathname)) return

    // Redireciona para a home mobile do app da loja
    navigate('/', { replace: true })
  }, [user, initialized, loading, location.pathname, navigate])

  return (
    <I18nProvider>
      <ScrollToTop />
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          <Route path="/" element={<MobileLayout />}>
            {/* Rota inicial protegida: se não logado vai pro /login, se logado abre a MobileStoreHome */}
            <Route element={<ProtectedRoute />}>
              <Route index element={<MobileStoreHome />} />
            </Route>
            
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Páginas do Catálogo */}
            <Route path="catalog" element={<Catalog />} />
            <Route path="parts" element={<PartsLookup />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cars" element={<CarList />} />
            <Route path="auctions" element={<Auctions />} />
            
            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="create-listing" element={<CreateListing />} />
              <Route path="profile" element={<Profile />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="messages" element={<Messages />} />
              <Route path="checkout/:id" element={<PaymentCheckout />} />
            </Route>
          </Route>

          {/* Redirecionamento para rotas inexistentes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <PWARegister />
    </I18nProvider>
  )
}

export default StoreApp
