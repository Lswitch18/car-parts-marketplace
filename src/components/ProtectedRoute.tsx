import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ requireAdmin }: { requireAdmin?: boolean }) {
  const { user, loading, initialized, isAdmin, ensureSession } = useAuthStore()
  const attempted = useRef(false)

  // Attempt to restore session once; useRef prevents infinite loop
  useEffect(() => {
    if (initialized && !user && !loading && !attempted.current) {
      attempted.current = true
      ensureSession()
    }
  }, [initialized, user, loading, ensureSession])

  if (!initialized || loading) {
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
