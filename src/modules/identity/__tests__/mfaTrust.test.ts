import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isDeviceTrusted, setDeviceTrusted, clearDeviceTrust } from '@/modules/identity/utils/mfaTrust'

// In-Memory localStorage mock for node environment
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) }
}

vi.stubGlobal('localStorage', localStorageMock)

describe('MFA Browser Device Trust & Cache Utility (mfaTrust.ts)', () => {
  const mockUserId = 'usr_test_mfa_12345'

  beforeEach(() => {
    localStorage.clear()
  })

  it('should return false when no device trust token exists in browser cache', () => {
    expect(isDeviceTrusted(mockUserId)).toBe(false)
  })

  it('should return false for undefined or empty userId', () => {
    expect(isDeviceTrusted(undefined)).toBe(false)
    expect(isDeviceTrusted('')).toBe(false)
  })

  it('should store device trust token and return true when valid', () => {
    setDeviceTrusted(mockUserId)
    expect(isDeviceTrusted(mockUserId)).toBe(true)
  })

  it('should return false when browser cache/localStorage is cleared (simulating lost cache/new device)', () => {
    setDeviceTrusted(mockUserId)
    expect(isDeviceTrusted(mockUserId)).toBe(true)

    // Simulate user clearing browser cache / localStorage
    localStorage.clear()
    expect(isDeviceTrusted(mockUserId)).toBe(false)
  })

  it('should explicitly revoke device trust when clearDeviceTrust is called', () => {
    setDeviceTrusted(mockUserId)
    expect(isDeviceTrusted(mockUserId)).toBe(true)

    clearDeviceTrust(mockUserId)
    expect(isDeviceTrusted(mockUserId)).toBe(false)
  })

  it('should handle token expiration correctly', () => {
    const TRUST_PREFIX = 'daig_mfa_trust_v1_'
    const expiredData = JSON.stringify({ userId: mockUserId, expiresAt: Date.now() - 1000 })
    localStorage.setItem(`${TRUST_PREFIX}${mockUserId}`, expiredData)

    expect(isDeviceTrusted(mockUserId)).toBe(false)
  })
})
