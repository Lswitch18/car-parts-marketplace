/**
 * Security Sanitizer & PII Masking Utilities
 * Compliant with SecureCoder Mandatory Web Security Guidelines
 */

/**
 * Sanitizes untrusted user text inputs to prevent Cross-Site Scripting (XSS) and injection attacks.
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Strips dangerous HTML tags completely from string.
 */
export function stripTags(input: string | null | undefined): string {
  if (!input) return ''
  return String(input).replace(/<[^>]*>?/gm, '').trim()
}

/**
 * Masks sensitive Credit Card Numbers for UI display (CWE-359).
 */
export function maskCreditCard(cardNumber: string | null | undefined): string {
  if (!cardNumber) return '****-****-****-****'
  const digits = String(cardNumber).replace(/\D/g, '')
  if (digits.length < 4) return '****-****-****-****'
  const lastFour = digits.slice(-4)
  return `****-****-****-${lastFour}`
}

/**
 * Masks sensitive User Email Addresses for UI display.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '***@***.***'
  const [user, domain] = email.split('@')
  if (user.length <= 2) {
    return `${user[0]}***@${domain}`
  }
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`
}

/**
 * Masks sensitive Japanese Phone Numbers.
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '090-****-****'
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 4) return '090-****-****'
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`
}

/**
 * Validates whether an incoming URL belongs to trusted domain origins.
 */
export function isTrustedOrigin(url: string): boolean {
  try {
    const parsed = new URL(url)
    const allowed = ['daig.jp', 'partner.daig.jp', 'localhost']
    return allowed.some(domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain))
  } catch {
    return false
  }
}
