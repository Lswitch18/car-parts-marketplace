import { Routes, Route, Navigate } from 'react-router-dom'
import { I18nProvider } from './lib/i18n'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateListing from './pages/CreateListing'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Messages from './pages/Messages'
import PaymentCheckout from './pages/PaymentCheckout'
import UserManagement from './pages/admin/UserManagement'
import PWARegister from './components/PWARegister'
import TransactionManagement from './pages/admin/TransactionManagement'
import LogistixDashboard from './pages/admin/LogistixDashboard'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import MobileApp from './pages/mobile/MobileApp'
import WorkerApp from './pages/mobile/WorkerApp'
import ChatPopup from './components/ChatPopup'
import { useAuthStore } from './stores/authStore'

function App() {
  const { user } = useAuthStore()

  return (
    <I18nProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Páginas Públicas (sem login) */}
          <Route path="catalog" element={<Catalog />} />
          <Route path="product/:id" element={<ProductDetail />} />
          
          {/* Rotas Protegidas (Exigem Login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-listing" element={<CreateListing />} />
            <Route path="profile" element={<Profile />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="messages" element={<Messages />} />
            <Route path="checkout/:id" element={<PaymentCheckout />} />
          </Route>
        </Route>

        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<LogistixDashboard />} />
          <Route path="dashboard" element={<LogistixDashboard />} />
          <Route path="logistix" element={<LogistixDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="transactions" element={<TransactionManagement />} />
        </Route>

        {/* App Mobile Logistix */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<MobileApp />} />
          <Route path="worker" element={<WorkerApp />} />
        </Route>

        {/* Redirecionamento para rotas inexistentes (404) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <ChatPopup />}
      <PWARegister />
    </I18nProvider>
  )
}

export default App