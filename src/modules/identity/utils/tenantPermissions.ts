import { TenantRole, TenantPermission, TENANT_ROLE_PERMISSIONS, User } from '@/modules/shared/types'

/**
 * High-performance, pure function O(1) to check if a tenant role has a given permission.
 * Admins and tenant_admin always have all permissions.
 */
export function hasTenantPermission(
  role: TenantRole | string | undefined,
  permission: TenantPermission,
  userRole?: string
): boolean {
  if (userRole === 'admin') return true
  if (!role) return false

  const permissions = TENANT_ROLE_PERMISSIONS[role as TenantRole]
  if (!permissions) return false

  return permissions.includes(permission)
}

/**
 * Helper to check if a user is an active SaaS user (has explicit tenant_id or tenant_role,
 * or a non-buyer operational role such as partner/seller/admin).
 * Pure marketplace buyers (role=buyer sem tenant) não são SaaS.
 */
export function isSaaSUser(user: User | null | undefined): boolean {
  if (!user) return false
  const anyUser = user as any
  if (anyUser.tenant_id || anyUser.tenant_role) return true
  const role = anyUser.role as string | undefined
  if (!role) return false
  // buyer pessoa_fisica puro -> false; demais papéis operacionais -> true
  if (role === 'buyer') return false
  return ['partner', 'seller', 'tenant_admin', 'tenant_operator', 'tenant_mechanic', 'tenant_manager', 'admin'].includes(role)
}

/**
 * Returns all permissions granted to a specific role.
 */
export function getTenantRolePermissions(role: TenantRole | undefined): TenantPermission[] {
  if (!role) return []
  return TENANT_ROLE_PERMISSIONS[role] || []
}
