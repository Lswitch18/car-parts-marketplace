import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ requireAdmin }: { requireAdmin?: boolean }) {
  const { user, loading, initialized, isAdmin, ensureSession } = useAuthStore()
  const [checking, setChecking] = useState(false)

  // When store is initialized but user is missing, attempt to restore session
  useEffect(() => {
    if (initialized && !user && !loading && !checking) {
      setChecking(true)
      ensureSession().finally(() => setChecking(false))
    }
  }, [initialized, user, loading, checking, ensureSession])

  if (!initialized || loading || checking) {
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
      return <Navigate to="/" replace />;
    }

  return <Outlet />
}
