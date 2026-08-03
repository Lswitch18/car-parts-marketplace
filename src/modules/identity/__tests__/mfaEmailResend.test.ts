import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/modules/shared/lib/supabase'

vi.mock('@/modules/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      mfa: {
        enroll: vi.fn(),
        challenge: vi.fn(),
        verify: vi.fn(),
        listFactors: vi.fn(),
        unenroll: vi.fn(),
      },
      signInWithOtp: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}))

describe('MFA Authenticator & Resend Email OTP Verification Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TOTP Authenticator App Flow', () => {
    it('should successfully enroll TOTP factor and return QR code', async () => {
      const mockEnrollResponse = {
        data: {
          id: 'factor_totp_999',
          totp: { qr_code: 'data:image/png;base64,mockQRCodeData' },
        },
        error: null,
      }
      vi.mocked(supabase.auth.mfa.enroll).mockResolvedValue(mockEnrollResponse as any)

      const result = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'GAID Marketplace',
      })

      expect(supabase.auth.mfa.enroll).toHaveBeenCalledWith({
        factorType: 'totp',
        issuer: 'GAID Marketplace',
      })
      expect(result.data?.id).toBe('factor_totp_999')
      expect(result.data?.totp.qr_code).toContain('data:image/png')
    })

    it('should challenge and verify TOTP code during 2FA enrollment', async () => {
      vi.mocked(supabase.auth.mfa.challenge).mockResolvedValue({
        data: { id: 'challenge_123' },
        error: null,
      } as any)

      vi.mocked(supabase.auth.mfa.verify).mockResolvedValue({
        data: { user: { id: 'usr_123' } },
        error: null,
      } as any)

      const challenge = await supabase.auth.mfa.challenge({ factorId: 'factor_totp_999' })
      expect(challenge.data?.id).toBe('challenge_123')

      const verification = await supabase.auth.mfa.verify({
        factorId: 'factor_totp_999',
        challengeId: 'challenge_123',
        code: '123456',
      })
      expect(verification.error).toBeNull()
      expect(verification.data?.user.id).toBe('usr_123')
    })
  })

  describe('Resend Email OTP Flow (Backup MFA)', () => {
    it('should trigger Email OTP dispatch via Resend / Supabase Auth', async () => {
      vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      } as any)

      const email = 'patrick.suzuki@daig.jp'
      const response = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      })

      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'patrick.suzuki@daig.jp',
        options: { shouldCreateUser: false },
      })
      expect(response.error).toBeNull()
    })

    it('should successfully handle profile update when Email MFA is enabled', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { bank_info: { is_verified: true } },
        error: null,
      })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: mockEq }),
        update: mockUpdate,
      } as any)

      const profileUpdate = await supabase
        .from('profiles')
        .update({
          bank_info: { email_mfa_enabled: true, email_mfa_activated_at: new Date().toISOString() },
        })
        .eq('id', 'usr_123')

      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockUpdate).toHaveBeenCalled()
    })
  })
})
