import { Routes, Route } from 'react-router-dom'
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
import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import TransactionManagement from './pages/admin/TransactionManagement'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <I18nProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-listing" element={<CreateListing />} />
          <Route path="profile" element={<Profile />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="messages" element={<Messages />} />
          <Route path="admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="transactions" element={<TransactionManagement />} />
          </Route>
        </Route>
      </Routes>
    </I18nProvider>
  )
}

export default App