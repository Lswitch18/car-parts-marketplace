import { Routes, Route, Navigate } from 'react-router'
import { I18nProvider } from '@/modules/shared/lib/i18n'
import IosMarketplaceLayout from '@/modules/shared/components/layout/IosMarketplaceLayout'
import ProtectedRoute from '@/modules/identity/components/ProtectedRoute'
import ScrollToTop from '@/modules/shared/components/ScrollToTop'
import PWARegister from '@/modules/shared/components/PWARegister'
import GlobalLoader from '@/modules/shared/components/GlobalLoader'
import { useEffect, Suspense } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { lazyWithRetry } from '@/modules/shared/lib/lazyWithRetry'

// Marketplace puro — sem Logistix/WMS/SaaS/Driver
const MobileStoreHome = lazyWithRetry(() => import('@/modules/storefront/pages/MobileStoreHome'))
const Catalog = lazyWithRetry(() => import('@/modules/parts-catalog/pages/Catalog'))
const ProductDetail = lazyWithRetry(() => import('@/modules/parts-catalog/pages/ProductDetail'))
const Login = lazyWithRetry(() => import('@/modules/identity/pages/Login'))
const Register = lazyWithRetry(() => import('@/modules/identity/pages/Register'))
const ProfileMarketplace = lazyWithRetry(() => import('@/modules/identity/pages/ProfileMarketplace'))
const Messages = lazyWithRetry(() => import('@/modules/chat/pages/Messages'))
const PaymentCheckout = lazyWithRetry(() => import('@/modules/transactions/pages/PaymentCheckout'))
const PrivacyPolicy = lazyWithRetry(() => import('@/modules/storefront/pages/PrivacyPolicy'))
const TermsOfService = lazyWithRetry(() => import('@/modules/storefront/pages/TermsOfService'))
const LegalNotice = lazyWithRetry(() => import('@/modules/storefront/pages/LegalNotice'))

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
          <Route path="/" element={<IosMarketplaceLayout />}>
            <Route index element={<MobileStoreHome />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="terms" element={<TermsOfService />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="legal" element={<LegalNotice />} />
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfileMarketplace />} />
              <Route path="messages" element={<Messages />} />
              <Route path="checkout/:id" element={<PaymentCheckout />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <PWARegister />
    </I18nProvider>
  )
}

export default StoreApp
