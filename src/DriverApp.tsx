import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router'
import { I18nProvider } from '@/modules/shared/lib/i18n'
import ProtectedRoute from '@/modules/identity/components/ProtectedRoute'
import ScrollToTop from '@/modules/shared/components/ScrollToTop'
import PWARegister from '@/modules/shared/components/PWARegister'
import GlobalLoader from '@/modules/shared/components/GlobalLoader'
import { useEffect, Suspense, lazy } from 'react'
import { useAuthStore } from '@/modules/identity/store/authStore'

// Lazy Loading das páginas permitidas no DriverApp
const Login = lazy(() => import('@/modules/identity/pages/Login'))
const MobileApp = lazy(() => import('@/modules/transportation/pages/MobileApp'))
const WorkerApp = lazy(() => import('@/modules/transportation/pages/WorkerApp'))
const QRInstallPage = lazy(() => import('@/modules/transportation/pages/QRInstallPage'))
const AgenciaPage = lazy(() => import('@/modules/transportation/pages/AgenciaPage'))

export default function DriverApp() {
  const { user, initialized, loading, initialize } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { initialize() }, [initialize])

  // Redirecionamento forçado para garantir que fiquem no ambiente do app logístico
  useEffect(() => {
    if (!initialized || loading) return

    // Se não estiver logado e não estiver na tela de login, forçar login
    if (!user && location.pathname !== '/login') {
      navigate('/login', { replace: true })
      return
    }

    // Se estiver logado e estiver no login, manda para o app
    if (user && location.pathname === '/login') {
      navigate('/app', { replace: true })
    }
  }, [user, initialized, loading, location.pathname, navigate])

  return (
    <I18nProvider>
      <ScrollToTop />
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* App Mobile Logistix */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={<MobileApp />} />
            <Route path="worker" element={<WorkerApp />} />
            <Route path="worker/install" element={<QRInstallPage />} />
            <Route path="agencia" element={<AgenciaPage />} />
          </Route>

          {/* Redirecionamento para rotas inexistentes (força sempre pro /app) */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
      <PWARegister />
    </I18nProvider>
  )
}
