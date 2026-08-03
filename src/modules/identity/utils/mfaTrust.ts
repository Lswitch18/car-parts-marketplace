const TRUST_PREFIX = 'daig_mfa_trust_v1_'

export function isDeviceTrusted(userId?: string): boolean {
  if (!userId) return false
  try {
    const raw = localStorage.getItem(`${TRUST_PREFIX}${userId}`)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    // Trust device for 30 days unless browser cache/storage is cleared
    if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
      return true
    }
    localStorage.removeItem(`${TRUST_PREFIX}${userId}`)
    return false
  } catch (err) {
    return false
  }
}

export function setDeviceTrusted(userId: string, days = 30): void {
  try {
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000
    localStorage.setItem(`${TRUST_PREFIX}${userId}`, JSON.stringify({ userId, expiresAt }))
  } catch (err) {
    console.warn('Erro ao salvar confiança do dispositivo:', err)
  }
}

export function clearDeviceTrust(userId: string): void {
  try {
    localStorage.removeItem(`${TRUST_PREFIX}${userId}`)
  } catch (err) {
    console.warn('Erro ao remover confiança do dispositivo:', err)
  }
}
