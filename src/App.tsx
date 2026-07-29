import { Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from '@/modules/shared/lib/i18n'
import Layout from '@/modules/shared/components/layout/Layout'
import ProtectedRoute from '@/modules/identity/components/ProtectedRoute'
import OnboardingGuard from '@/modules/identity/components/OnboardingGuard'
import ScrollToTop from '@/modules/shared/components/ScrollToTop'
import PWARegister from '@/modules/shared/components/PWARegister'
import GlobalLoader from '@/modules/shared/components/GlobalLoader'
import { useEffect, Suspense, lazy } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'

// Lazy Loading das páginas para habilitar Code Splitting
const Home = lazy(() => import('@/modules/storefront/pages/Home'))
const Catalog = lazy(() => import('@/modules/parts-catalog/pages/Catalog'))
const ProductDetail = lazy(() => import('@/modules/parts-catalog/pages/ProductDetail'))
const CarList = lazy(() => import('@/modules/vehicles/pages/CarList'))
const Login = lazy(() => import('@/modules/identity/pages/Login'))
const Register = lazy(() => import('@/modules/identity/pages/Register'))
const Dashboard = lazy(() => import('@/modules/backoffice/pages/Dashboard'))
const TenantDashboard = lazy(() => import('@/modules/backoffice/pages/TenantDashboard'))
const CreateListing = lazy(() => import('@/modules/parts-catalog/pages/CreateListing'))
const Onboarding = lazy(() => import('@/modules/identity/pages/Onboarding'))
const Profile = lazy(() => import('@/modules/identity/pages/Profile'))
const Favorites = lazy(() => import('@/modules/parts-catalog/pages/Favorites'))
const Messages = lazy(() => import('@/modules/chat/pages/Messages'))
const PaymentCheckout = lazy(() => import('@/modules/transactions/pages/PaymentCheckout'))
const UserManagement = lazy(() => import('@/modules/backoffice/pages/UserManagement'))
const ImageTo3D = lazy(() => import('@/modules/visualization3d/pages/ImageTo3D'))
const ReviewManagement = lazy(() => import('@/modules/reputation/pages/ReviewManagement'))
const AdminDashboard = lazy(() => import('@/modules/backoffice/pages/AdminDashboard'))
const LogistixDashboard = lazy(() => import('@/modules/logistics/pages/LogistixDashboard'))
const TransactionManagement = lazy(() => import('@/modules/backoffice/pages/TransactionManagement'))
const AdminLayout = lazy(() => import('@/modules/backoffice/components/AdminLayout'))
const ContactsManagement = lazy(() => import('@/modules/crm/pages/ContactsManagement'))
const AccountsPayable = lazy(() => import('@/modules/finance/pages/AccountsPayable'))
const TrackingPublico = lazy(() => import('@/modules/logistics/pages/TrackingPublico'))
const MobileApp = lazy(() => import('@/modules/transportation/pages/MobileApp'))
const WorkerApp = lazy(() => import('@/modules/transportation/pages/WorkerApp'))
const QRInstallPage = lazy(() => import('@/modules/transportation/pages/QRInstallPage'))
const AgenciaPage = lazy(() => import('@/modules/transportation/pages/AgenciaPage'))
const MotionFramePage = lazy(() => import('@/modules/visualization3d/pages/MotionFramePage'))
const Subscription = lazy(() => import('@/modules/identity/pages/Subscription'))
const ImmersiveExperience = lazy(() => import('@/modules/visualization3d/pages/ImmersiveExperience'))
const Auctions = lazy(() => import('@/modules/auctions/pages/Auctions'))
const PartsLookup = lazy(() => import('@/modules/parts-catalog/pages/PartsLookup'))
const DriverApprovalsPage = lazy(() => import('@/modules/transportation/pages/admin/DriverApprovalsPage'))
const AiOpsPage = lazy(() => import('@/modules/backoffice/pages/AiOpsPage'))
const LegalNotice = lazy(() => import('@/modules/storefront/pages/LegalNotice'))
const TermsOfService = lazy(() => import('@/modules/storefront/pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('@/modules/storefront/pages/PrivacyPolicy'))
const JapanBankAccount = lazy(() => import('@/modules/backoffice/pages/JapanBankAccount'))

function App() {
  const { user, initialized, loading, initialize } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { initialize() }, [initialize])

  // Redirecionar baseado na role após login
  useEffect(() => {
    if (!initialized || loading || !user) return
    // Only redirect when user lands on login or register pages (public entry points) or root
    const redirectRoutes = ['/login', '/register', '/']
    if (!redirectRoutes.includes(location.pathname)) return

    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
    } else if (!user.onboarding_completed) {
      navigate('/onboarding', { replace: true })
    } else if (user.role === 'seller') {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/catalog', { replace: true })
    }
  }, [user, initialized, loading, location.pathname, navigate])

  return (
    <I18nProvider>
      <ScrollToTop />
      <Suspense fallback={<GlobalLoader />}>
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
            <Route path="legal" element={<LegalNotice />} />
            <Route path="tokushouhou" element={<LegalNotice />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            
            {/* Rotas Protegidas (Exigem Login) */}
            <Route element={<ProtectedRoute />}>
              <Route path="onboarding" element={<Onboarding />} />
              <Route element={<OnboardingGuard />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tenant/dashboard" element={<TenantDashboard />} />
                <Route path="tenant-dashboard" element={<TenantDashboard />} />
                <Route path="bank-account" element={<JapanBankAccount />} />
                <Route path="japan-bank-account" element={<JapanBankAccount />} />
                <Route path="create-listing" element={<CreateListing />} />
                <Route path="profile" element={<Profile />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="messages" element={<Messages />} />
                <Route path="checkout/:id" element={<PaymentCheckout />} />
                <Route path="motion-frame" element={<MotionFramePage />} />
                <Route path="subscription" element={<Subscription />} />
              </Route>
            </Route>
          </Route>

          <Route path="/admin" element={<ProtectedRoute requireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              {/* <Route path="logistix" element={<LogistixDashboard />} /> */}
              <Route path="users" element={<UserManagement />} />
              <Route path="transactions" element={<TransactionManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
              <Route path="image-to-3d" element={<ImageTo3D />} />
              <Route path="crm/contacts" element={<ContactsManagement />} />
              <Route path="finance/payable" element={<AccountsPayable />} />
              <Route path="transportation/drivers" element={<DriverApprovalsPage />} />
              <Route path="ai-ops" element={<AiOpsPage />} />
            </Route>
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
      </Suspense>
      <PWARegister />
    </I18nProvider>
  )
}

export default App