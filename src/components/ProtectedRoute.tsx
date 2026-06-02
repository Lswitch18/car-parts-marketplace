import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  requireAdmin?: boolean
}

export default function ProtectedRoute({ requireAdmin }: ProtectedRouteProps) {
  const { user, loading, initialized, isAdmin, refreshSession } = useAuthStore()
  const [recovering, setRecovering] = useState(false)
  const recovered = useRef(false)

  useEffect(() => {
    if (!user && initialized && !loading && !recovered.current) {
      recovered.current = true
      setRecovering(true)
      refreshSession().finally(() => setRecovering(false))
    }
  }, [user, initialized, loading, refreshSession])

  if (!initialized || loading || recovering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="bg-gray-800 border-l-4 border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="font-bold text-xl text-white mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-400 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Voltar para Home
          </a>
        </div>
      </div>
    )
  }

  return <Outlet />
}
