import { describe, it, expect } from 'vitest'
import { hasTenantPermission, isSaaSUser, getTenantRolePermissions } from '@/modules/identity/utils/tenantPermissions'
import { TENANT_ROLE_PERMISSIONS } from '@/modules/shared/types'

describe('tenantPermissions Utility', () => {
  it('should grant all permissions to admin users', () => {
    expect(hasTenantPermission('tenant_operator', 'manage_tenant', 'admin')).toBe(true)
    expect(hasTenantPermission('tenant_operator', 'view_financials', 'admin')).toBe(true)
  })

  it('should correctly validate tenant_admin permissions', () => {
    expect(hasTenantPermission('tenant_admin', 'manage_tenant')).toBe(true)
    expect(hasTenantPermission('tenant_admin', 'view_financials')).toBe(true)
    expect(hasTenantPermission('tenant_admin', 'publish_marketplace')).toBe(true)
  })

  it('should restrict tenant_operator permissions', () => {
    expect(hasTenantPermission('tenant_operator', 'manage_work_orders')).toBe(true)
    expect(hasTenantPermission('tenant_operator', 'view_financials')).toBe(false)
    expect(hasTenantPermission('tenant_operator', 'manage_tenant')).toBe(false)
  })

  it('should restrict tenant_mechanic permissions', () => {
    expect(hasTenantPermission('tenant_mechanic', 'manage_work_orders')).toBe(true)
    expect(hasTenantPermission('tenant_mechanic', 'print_qr_labels')).toBe(true)
    expect(hasTenantPermission('tenant_mechanic', 'view_financials')).toBe(false)
  })

  it('should identify SaaS users correctly', () => {
    expect(isSaaSUser({ tenant_id: 't-123' } as any)).toBe(true)
    expect(isSaaSUser({ tenant_role: 'tenant_admin' } as any)).toBe(true)
    expect(isSaaSUser({ email: 'teste.partner@daig.jp', role: 'partner' } as any)).toBe(true)
    expect(isSaaSUser({ account_type: 'pessoa_fisica', role: 'buyer' } as any)).toBe(false)
  })

  it('should return correct permissions array for role', () => {
    expect(getTenantRolePermissions('tenant_manager')).toEqual(TENANT_ROLE_PERMISSIONS.tenant_manager)
    expect(getTenantRolePermissions(undefined)).toEqual([])
  })
})
