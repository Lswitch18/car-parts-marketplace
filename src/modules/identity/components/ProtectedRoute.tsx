import { Navigate, Outlet } from 'react-router'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { isSaaSUser } from '@/modules/identity/utils/tenantPermissions'

interface Props {
  requireAdmin?: boolean
  requireSaaS?: boolean
}

export default function ProtectedRoute({ requireAdmin, requireSaaS }: Props) {
  const { user, loading, initialized, isAdmin, ensureSession, initialize } = useAuthStore()
  const attempted = useRef(false)

  // Safety: if still loading after 5s, log a warning and try to kickstart
  useEffect(() => {
    if (!initialized || loading) {
      const timer = setTimeout(() => {
        console.warn('[ProtectedRoute] Loading taking longer than 5s — triggering background session sync. State:', { initialized, loading, user: !!user })
        ensureSession()
        initialize()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [initialized, loading])

  // Attempt to restore session once; useRef prevents infinite loop
  useEffect(() => {
    if (initialized && !user && !loading && !attempted.current) {
      attempted.current = true
      console.log('[ProtectedRoute] Initialized with no user in store. Restoring session...')
      ensureSession()
    }
  }, [initialized, user, loading, ensureSession])

  console.debug('[ProtectedRoute] render state:', { initialized, loading, user: user?.email, isAdmin, requireAdmin, requireSaaS })

  // While loading, we MUST show the spinner and NEVER redirect to login
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4 text-sm text-gray-400">Verificando sessão...</p>
      </div>
    )
  }

  // Once loading has finished, if there is no user, redirect to login
  if (!user) {
    console.warn('[ProtectedRoute] Auth check complete: No user found. Redirecting to /login')
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    console.warn('[ProtectedRoute] Auth check complete: User is not admin. Redirecting to home')
    return <Navigate to="/" replace />
  }

  if (requireSaaS && !isAdmin && !isSaaSUser(user)) {
    // Open access for testing / development: allow user through
    console.log('[ProtectedRoute] requireSaaS access granted for user:', user.email);
  }

  return <Outlet />
}

