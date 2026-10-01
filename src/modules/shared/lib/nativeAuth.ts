import { Capacitor } from '@capacitor/core'

/** Deep-link unificado iOS (Apple + Google fallback). Cadastrar em:
 *  Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
 *  + Google Cloud > Authorized redirect URIs (via Supabase callback).
 */
export const NATIVE_LOGIN_CALLBACK = 'com.daig.marketplace://login-callback'

let listenerInstalled = false
let pendingResolvers: Array<(url: string) => void> = []
let globalSessionCallback: ((data: any) => void) | null = null

function resolvePending(url: string) {
  const rs = pendingResolvers
  pendingResolvers = []
  rs.forEach((r) => {
    try { r(url) } catch {}
  })
}

/** Extrai parâmetros do callback tanto do search (?code=) quanto do hash (#access_token=) */
export function extractAuthTokens(callbackUrl: string) {
  let code: string | null = null
  let accessToken: string | null = null
  let refreshToken: string | null = null
  let errorMsg: string | null = null

  try {
    const parsed = new URL(callbackUrl)
    code = parsed.searchParams.get('code')
    accessToken = parsed.searchParams.get('access_token')
    refreshToken = parsed.searchParams.get('refresh_token')
    errorMsg = parsed.searchParams.get('error_description') || parsed.searchParams.get('error')

    if (parsed.hash) {
      const hashClean = parsed.hash.replace(/^#/, '')
      const hp = new URLSearchParams(hashClean)
      if (!code) code = hp.get('code')
      if (!accessToken) accessToken = hp.get('access_token')
      if (!refreshToken) refreshToken = hp.get('refresh_token')
      if (!errorMsg) errorMsg = hp.get('error_description') || hp.get('error')
    }
  } catch {
    // Fallback via regex para URLs com esquemas customizados
    const codeMatch = callbackUrl.match(/[?&#]code=([^&#]+)/)
    if (codeMatch) code = decodeURIComponent(codeMatch[1])
    const accessMatch = callbackUrl.match(/[?&#]access_token=([^&#]+)/)
    if (accessMatch) accessToken = decodeURIComponent(accessMatch[1])
    const refreshMatch = callbackUrl.match(/[?&#]refresh_token=([^&#]+)/)
    if (refreshMatch) refreshToken = decodeURIComponent(refreshMatch[1])
    const errMatch = callbackUrl.match(/[?&#](?:error_description|error)=([^&#]+)/)
    if (errMatch) errorMsg = decodeURIComponent(errMatch[1])
  }

  return { code, accessToken, refreshToken, errorMsg }
}

/** Fecha o In-App Browser (chamar após sessão restaurada / timeout). */
export async function closeNativeBrowser() {
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.close().catch(() => {})
  } catch {}
}

/** Troca `?code=` ou `#access_token=` do callback pela sessão Supabase (PKCE + Implicit). */
export async function exchangeCallbackForSession(callbackUrl: string, supabase: any) {
  const { code, accessToken, refreshToken, errorMsg } = extractAuthTokens(callbackUrl)

  if (errorMsg) {
    console.error('[nativeAuth] Erro retornado no callback OAuth:', errorMsg)
    throw new Error(errorMsg)
  }

  // 1. Fluxo PKCE (?code=)
  if (code && typeof supabase?.auth?.exchangeCodeForSession === 'function') {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data?.session) {
        return data
      }
      if (error) console.warn('[nativeAuth] exchangeCodeForSession warning:', error.message)
    } catch (err) {
      console.warn('[nativeAuth] exchangeCodeForSession falhou:', err)
    }
  }

  // 2. Fluxo Implícito (#access_token= & refresh_token=)
  if (accessToken && refreshToken && typeof supabase?.auth?.setSession === 'function') {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (!error && data?.session) {
        return data
      }
      if (error) console.warn('[nativeAuth] setSession warning:', error.message)
    } catch (err) {
      console.warn('[nativeAuth] setSession falhou:', err)
    }
  }

  // 3. Fallback: sessão persistida pelo cliente Supabase
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data
}

/** Instala 1x o listener que fecha o In-App Browser ao voltar do OAuth
 *  e entrega a URL de callback p/ quem está aguardando a sessão. */
export async function installNativeAuthListener(supabase?: any, onSessionReady?: (data: any) => void) {
  if (onSessionReady) {
    globalSessionCallback = onSessionReady
  }
  if (!Capacitor.isNativePlatform() || listenerInstalled) return
  listenerInstalled = true

  try {
    const { App } = await import('@capacitor/app')
    await App.addListener('appUrlOpen', async (event) => {
      try {
        if (event.url && (event.url.startsWith('com.daig.marketplace://') || event.url.includes('login-callback'))) {
          console.log('[nativeAuth] appUrlOpen detectado com sucesso:', event.url)
          resolvePending(event.url)
          await closeNativeBrowser()

          if (supabase) {
            try {
              const sessionData = await exchangeCallbackForSession(event.url, supabase)
              if (sessionData?.session && globalSessionCallback) {
                globalSessionCallback(sessionData)
              }
            } catch (err) {
              console.error('[nativeAuth] Falha ao processar callback global:', err)
            }
          }
        }
      } catch (err) {
        console.error('[nativeAuth] Erro ao tratar appUrlOpen:', err)
      }
    })
  } catch (err) {
    console.warn('[nativeAuth] App listener indisponível:', err)
  }
}

/** Aguarda o callback OAuth no deep-link (resolve com a URL completa). */
export function waitForNativeOAuthCallback(timeoutMs = 90000): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingResolvers = pendingResolvers.filter((r) => r !== done)
      reject(new Error('Tempo esgotado aguardando retorno do login (deep-link).'))
    }, timeoutMs)
    const done = (url: string) => {
      clearTimeout(timer)
      resolve(url)
    }
    pendingResolvers.push(done)
  })
}
