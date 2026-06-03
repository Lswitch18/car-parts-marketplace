import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ requireAdmin }: { requireAdmin?: boolean }) {
  const { user, loading, initialized, isAdmin, ensureSession, initialize } = useAuthStore()
  const attempted = useRef(false)
  const [timedOut, setTimedOut] = useState(false)

  // Safety: if still loading after 3s, force-unblock
  useEffect(() => {
    if (!initialized || loading) {
      const timer = setTimeout(() => {
        console.warn('[ProtectedRoute] Timeout! Still loading after 3s — forcing ensureSession. State:', { initialized, loading, user: !!user })
        setTimedOut(true)
        ensureSession()
        initialize()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [initialized, loading])

  // Attempt to restore session once; useRef prevents infinite loop
  useEffect(() => {
    if (initialized && !user && !loading && !attempted.current) {
      attempted.current = true
      ensureSession()
    }
  }, [initialized, user, loading, ensureSession])

  console.debug('[ProtectedRoute] render', { initialized, loading, user: user?.email, isAdmin, timedOut, requireAdmin })

  if (!timedOut && (!initialized || loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4 text-sm text-gray-400">Verificando sessão...</p>
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

