import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute() {
  const { user, loading, initialized } = useAuthStore()

  // Se ainda estiver inicializando ou carregando, podemos mostrar um loading
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não houver usuário, redireciona para o login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se estiver logado, renderiza as rotas filhas
  return <Outlet />
}
