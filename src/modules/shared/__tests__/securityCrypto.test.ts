import { describe, it, expect } from 'vitest'
import { encryptSensitiveData, decryptSensitiveData, hashSHA256 } from '@/modules/shared/lib/crypto'
import { sanitizeInput, stripTags, maskEmail, maskPhone, maskCreditCard } from '@/modules/shared/lib/securitySanitizer'

describe('Advanced Security & Encryption Verification Suite (AES-256-GCM + Web Crypto API)', () => {

  describe('AES-256-GCM Encryption & Decryption', () => {
    it('should successfully encrypt and decrypt sensitive Japanese bank account numbers', async () => {
      const plainBankAccount = '12345678'
      const encrypted = await encryptSensitiveData(plainBankAccount)

      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
      expect(encrypted).not.toBe(plainBankAccount)

      const decrypted = await decryptSensitiveData(encrypted)
      expect(decrypted).toBe(plainBankAccount)
    })

    it('should produce distinct ciphertexts for identical plaintext due to random IV & Salt', async () => {
      const sensitiveText = 'PATRICK_SUZUKI_CONFIDENTIAL_PAYOUT_DATA'
      const enc1 = await encryptSensitiveData(sensitiveText)
      const enc2 = await encryptSensitiveData(sensitiveText)

      expect(enc1).not.toBe(enc2) // Cryptographic non-repeatability
      expect(await decryptSensitiveData(enc1)).toBe(sensitiveText)
      expect(await decryptSensitiveData(enc2)).toBe(sensitiveText)
    })

    it('should reject tampered payloads and fail securely without leaking plaintext', async () => {
      const plainData = 'CONFIDENTIAL_STRIPE_DATA'
      const encrypted = await encryptSensitiveData(plainData)

      // Tamper ciphertext by modifying last character
      const tampered = encrypted.slice(0, -4) + 'AAAA'

      await expect(decryptSensitiveData(tampered)).rejects.toThrow('Falha na descriptografia')
    })
  })

  describe('SHA-256 Cryptographic Hash', () => {
    it('should generate valid 64-character SHA-256 hex string', async () => {
      const input = 'daig_platform_token_2026'
      const hash = await hashSHA256(input)

      expect(hash).toHaveLength(64)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
      expect(await hashSHA256(input)).toBe(hash)
    })
  })

  describe('XSS Input Sanitization & PII Protection', () => {
    it('should sanitize dangerous HTML/Script tags to prevent Cross-Site Scripting (XSS)', () => {
      const maliciousXss = '<script>alert("XSS Attack!")</script>'
      const sanitized = sanitizeInput(maliciousXss)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS Attack!&quot;)&lt;&#x2F;script&gt;')
    })

    it('should strip all HTML tags cleanly', () => {
      const htmlPayload = '<p>Texto Seguro <b>Negrito</b></p>'
      expect(stripTags(htmlPayload)).toBe('Texto Seguro Negrito')
    })

    it('should mask sensitive Email addresses for PII protection', () => {
      expect(maskEmail('patrick.suzuki@daig.jp')).toBe('pa***i@daig.jp')
      expect(maskEmail('wellynton@gmail.com')).toBe('we***n@gmail.com')
    })

    it('should mask sensitive Phone numbers for PII protection', () => {
      expect(maskPhone('09012345678')).toBe('090-****-5678')
    })

    it('should mask sensitive Credit Card numbers for PCI compliance', () => {
      expect(maskCreditCard('4532123456789012')).toBe('****-****-****-9012')
    })
  })
})
