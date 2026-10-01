/**
 * webAuth — callback canônico do OAuth web (Chrome/desktop).
 *
 * REGRA DURA (crew security): o endereço-base de runtime
 * (`window.location.origin` — localhost, preview Vercel, domínio cru)
 * NUNCA pode aparecer num `redirectTo` de fallback em produção.
 * Todo OAuth web usa `${VITE_SITE_URL}/auth/callback`.
 * Sem VITE_SITE_URL (dev local), cai para `${origin}/auth/callback`.
 */

const POST_LOGIN_KEY = 'daig-post-login-redirect'
const CALLBACK_PATH = '/auth/callback'

/** Base canônica pública (ex: https://app.daig.jp). '' quando não configurada. */
export function getCanonicalSiteUrl(): string {
  const raw = (import.meta as any)?.env?.VITE_SITE_URL as string | undefined
  return (raw || '').trim().replace(/\/+$/, '')
}

/** URL de callback OAuth — nunca expõe o endereço-base de runtime em produção. */
export function getWebAuthCallbackUrl(): string {
  const canonical = getCanonicalSiteUrl()
  if (canonical) return `${canonical}${CALLBACK_PATH}`
  if (typeof window !== 'undefined') return `${window.location.origin}${CALLBACK_PATH}`
  return CALLBACK_PATH
}

/** Guarda para onde voltar após o OAuth (só rotas internas, nunca auth). */
export function rememberPostLoginPath(): void {
  try {
    const path = window.location.pathname + window.location.search
    if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/auth/')) return
    if (!path.startsWith('/')) return
    sessionStorage.setItem(POST_LOGIN_KEY, path)
  } catch {}
}

/** Consome o destino pós-login (default '/'). */
export function consumePostLoginPath(): string {
  try {
    const v = sessionStorage.getItem(POST_LOGIN_KEY)
    sessionStorage.removeItem(POST_LOGIN_KEY)
    if (v && v.startsWith('/') && !v.startsWith('/login') && !v.startsWith('/register') && !v.startsWith('/auth/')) {
      return v
    }
  } catch {}
  return '/'
}
