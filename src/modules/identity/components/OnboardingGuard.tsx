import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'

/**
 * OnboardingGuard — redireciona para /onboarding se o usuário
 * ainda não completou o wizard de onboarding.
 * Deve ser usado dentro do ProtectedRoute (usuário já está autenticado).
 */
export default function OnboardingGuard() {
  const { user, loading } = useAuthStore()

  if (loading || !user) return null

  // Admin pula onboarding
  if (user.role === 'admin') return <Outlet />

  // Se onboarding não foi concluído, redireciona
  if (!user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
