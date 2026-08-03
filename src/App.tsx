import { Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from '@/modules/shared/lib/i18n'
import Layout from '@/modules/shared/components/layout/Layout'
import ProtectedRoute from '@/modules/identity/components/ProtectedRoute'
import OnboardingGuard from '@/modules/identity/components/OnboardingGuard'
import ScrollToTop from '@/modules/shared/components/ScrollToTop'
import PWARegister from '@/modules/shared/components/PWARegister'
import GlobalLoader from '@/modules/shared/components/GlobalLoader'
import { useEffect, Suspense } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { lazyWithRetry } from '@/modules/shared/lib/lazyWithRetry'
import { isSaaSUser } from '@/modules/identity/utils/tenantPermissions'

// Lazy Loading das páginas com auto-retry para evitar erros pós-deploy Vercel
const Home = lazyWithRetry(() => import('@/modules/storefront/pages/Home'))
const Catalog = lazyWithRetry(() => import('@/modules/parts-catalog/pages/Catalog'))
const ProductDetail = lazyWithRetry(() => import('@/modules/parts-catalog/pages/ProductDetail'))
const CarList = lazyWithRetry(() => import('@/modules/vehicles/pages/CarList'))
const Login = lazyWithRetry(() => import('@/modules/identity/pages/Login'))
const Register = lazyWithRetry(() => import('@/modules/identity/pages/Register'))
const Dashboard = lazyWithRetry(() => import('@/modules/backoffice/pages/Dashboard'))
const TenantDashboard = lazyWithRetry(() => import('@/modules/backoffice/pages/TenantDashboard'))
const CreateListing = lazyWithRetry(() => import('@/modules/parts-catalog/pages/CreateListing'))
const Onboarding = lazyWithRetry(() => import('@/modules/identity/pages/Onboarding'))
const Profile = lazyWithRetry(() => import('@/modules/identity/pages/Profile'))
const Favorites = lazyWithRetry(() => import('@/modules/parts-catalog/pages/Favorites'))
const Messages = lazyWithRetry(() => import('@/modules/chat/pages/Messages'))
const PaymentCheckout = lazyWithRetry(() => import('@/modules/transactions/pages/PaymentCheckout'))
const UserManagement = lazyWithRetry(() => import('@/modules/backoffice/pages/UserManagement'))
const ImageTo3D = lazyWithRetry(() => import('@/modules/visualization3d/pages/ImageTo3D'))
const ReviewManagement = lazyWithRetry(() => import('@/modules/reputation/pages/ReviewManagement'))
const AdminDashboard = lazyWithRetry(() => import('@/modules/backoffice/pages/AdminDashboard'))
const LogistixDashboard = lazyWithRetry(() => import('@/modules/logistics/pages/LogistixDashboard'))
const TransactionManagement = lazyWithRetry(() => import('@/modules/backoffice/pages/TransactionManagement'))
const DeliveriesManagement = lazyWithRetry(() => import('@/modules/backoffice/pages/DeliveriesManagement'))
const AdminLayout = lazyWithRetry(() => import('@/modules/backoffice/components/AdminLayout'))
const ContactsManagement = lazyWithRetry(() => import('@/modules/crm/pages/ContactsManagement'))
const AccountsPayable = lazyWithRetry(() => import('@/modules/finance/pages/AccountsPayable'))
const SaasControlCenter = lazyWithRetry(() => import('@/modules/finance/pages/SaasControlCenter'))
const PartnerPortalPage = lazyWithRetry(() => import('@/modules/storefront/pages/PartnerPortalPage'))
const TrackingPublico = lazyWithRetry(() => import('@/modules/logistics/pages/TrackingPublico'))
const MobileApp = lazyWithRetry(() => import('@/modules/transportation/pages/MobileApp'))
const WorkerApp = lazyWithRetry(() => import('@/modules/transportation/pages/WorkerApp'))
const QRInstallPage = lazyWithRetry(() => import('@/modules/transportation/pages/QRInstallPage'))
const AgenciaPage = lazyWithRetry(() => import('@/modules/transportation/pages/AgenciaPage'))
const MotionFramePage = lazyWithRetry(() => import('@/modules/visualization3d/pages/MotionFramePage'))
const Subscription = lazyWithRetry(() => import('@/modules/identity/pages/Subscription'))
const ImmersiveExperience = lazyWithRetry(() => import('@/modules/visualization3d/pages/ImmersiveExperience'))
const Auctions = lazyWithRetry(() => import('@/modules/auctions/pages/Auctions'))
const PartsLookup = lazyWithRetry(() => import('@/modules/parts-catalog/pages/PartsLookup'))
const DriverApprovalsPage = lazyWithRetry(() => import('@/modules/transportation/pages/admin/DriverApprovalsPage'))
const AiOpsPage = lazyWithRetry(() => import('@/modules/backoffice/pages/AiOpsPage'))
const LegalNotice = lazyWithRetry(() => import('@/modules/storefront/pages/LegalNotice'))
const TermsOfService = lazyWithRetry(() => import('@/modules/storefront/pages/TermsOfService'))
const PrivacyPolicy = lazyWithRetry(() => import('@/modules/storefront/pages/PrivacyPolicy'))
const JapanBankAccount = lazyWithRetry(() => import('@/modules/backoffice/pages/JapanBankAccount'))
const SaasGatewayPage = lazyWithRetry(() => import('@/modules/identity/pages/SaasGatewayPage'))

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
    } else if (isSaaSUser(user)) {
      const preferred = typeof window !== 'undefined' ? localStorage.getItem(`daig_preferred_gateway_${user.id}`) : null
      if (preferred) {
        navigate(preferred, { replace: true })
      } else {
        navigate('/saas-gateway', { replace: true })
      }
    } else {
      navigate('/catalog', { replace: true })
    }
  }, [user, initialized, loading, location.pathname, navigate])

  const isPartnerDomain = typeof window !== 'undefined' && (
    window.location.hostname.startsWith('partner.') ||
    window.location.hostname.startsWith('b2b.') ||
    window.location.hostname.includes('partner-')
  )

  return (
    <I18nProvider>
      <ScrollToTop />
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={isPartnerDomain ? <PartnerPortalPage /> : <Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Páginas Públicas (sem login) */}
            <Route path="catalog" element={<Catalog />} />
            <Route path="parts" element={<PartsLookup />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cars" element={<CarList />} />
            <Route path="auctions" element={<Auctions />} />
            <Route path="partner" element={<PartnerPortalPage />} />
            <Route path="partner/plans" element={<PartnerPortalPage />} />
            <Route path="legal" element={<LegalNotice />} />
            <Route path="tokushouhou" element={<LegalNotice />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />

            {/* Rotas Protegidas (Exigem Login) */}
            <Route element={<ProtectedRoute />}>
              <Route path="onboarding" element={<Onboarding />} />
              <Route element={<OnboardingGuard />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="bank-account" element={<JapanBankAccount />} />
                <Route path="japan-bank-account" element={<JapanBankAccount />} />
                <Route path="create-listing" element={<CreateListing />} />
                <Route path="profile" element={<Profile />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="messages" element={<Messages />} />
                <Route path="checkout/:id" element={<PaymentCheckout />} />
                <Route path="motion-frame" element={<MotionFramePage />} />
                <Route path="subscription" element={<Subscription />} />

                {/* Rotas Exclusivas do SaaS Multi-Tenant */}
                <Route element={<ProtectedRoute requireSaaS />}>
                  <Route path="saas-gateway" element={<SaasGatewayPage />} />
                  <Route path="portal-selector" element={<SaasGatewayPage />} />
                  <Route path="tenant/dashboard" element={<TenantDashboard />} />
                  <Route path="tenant-dashboard" element={<TenantDashboard />} />
                </Route>
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
              <Route path="deliveries" element={<DeliveriesManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
              <Route path="image-to-3d" element={<ImageTo3D />} />
              <Route path="crm/contacts" element={<ContactsManagement />} />
              <Route path="finance/payable" element={<AccountsPayable />} />
              <Route path="saas" element={<SaasControlCenter />} />
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