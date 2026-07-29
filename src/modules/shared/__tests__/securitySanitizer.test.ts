import { describe, it, expect } from 'vitest'
import { 
  sanitizeInput, 
  stripTags, 
  maskCreditCard, 
  maskEmail, 
  maskPhone, 
  isTrustedOrigin 
} from '../lib/securitySanitizer'

describe('Security Sanitizer & PII Masking Module', () => {
  
  describe('XSS Input Sanitization', () => {
    it('deve escapar caracteres especiais de HTML para prevenir XSS', () => {
      const malicious = '<script>alert("XSS")</script>'
      expect(sanitizeInput(malicious)).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
    })

    it('deve remover tags HTML de textos', () => {
      const htmlText = '<p>Texto <b>Negrito</b></p>'
      expect(stripTags(htmlText)).toBe('Texto Negrito')
    })

    it('deve tratar entradas nulas ou indefinidas com segurança', () => {
      expect(sanitizeInput(null)).toBe('')
      expect(sanitizeInput(undefined)).toBe('')
      expect(stripTags(null)).toBe('')
    })
  })

  describe('PII Masking (Proteção de Dados Pessoais)', () => {
    it('deve mascarar números de cartão de crédito exibindo apenas os últimos 4 dígitos', () => {
      expect(maskCreditCard('4532 1234 5678 9012')).toBe('****-****-****-9012')
      expect(maskCreditCard('1234567890123456')).toBe('****-****-****-3456')
    })

    it('deve mascarar e-mails protegendo o nome de usuário', () => {
      expect(maskEmail('development@daig.jp')).toBe('de***t@daig.jp')
      expect(maskEmail('kenji@loja.jp')).toBe('ke***i@loja.jp')
    })

    it('deve mascarar telefones do Japão', () => {
      expect(maskPhone('09012345678')).toBe('090-****-5678')
    })
  })

  describe('Origens Confiáveis', () => {
    it('deve validar origens permitidas', () => {
      expect(isTrustedOrigin('https://daig.jp/catalog')).toBe(true)
      expect(isTrustedOrigin('https://partner.daig.jp/plans')).toBe(true)
      expect(isTrustedOrigin('http://localhost:5173')).toBe(true)
    })

    it('deve rejeitar domínios não autorizados ou maliciosos', () => {
      expect(isTrustedOrigin('https://malicious-phishing.com')).toBe(false)
      expect(isTrustedOrigin('invalid-url')).toBe(false)
    })
  })

})
