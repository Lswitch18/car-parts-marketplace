import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { GoogleAuth } from '@southdevs/capacitor-google-auth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

const STORAGE_KEY = 'daig-auth-token'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: STORAGE_KEY,
    storage: {
      getItem: (key: string) => {
        try { return localStorage.getItem(key) || null } catch { return null }
      },
      setItem: (key: string, value: string) => {
        try { localStorage.setItem(key, value) } catch {}
      },
      removeItem: (key: string) => {
        try { localStorage.removeItem(key) } catch {}
      }
    }
  }
})

// Inicializa o GoogleAuth para a web nativa se aplicável
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '606997989793-k2cuig6n7v5iiddc2sqfp6acm7st62t9.apps.googleusercontent.com'
const GOOGLE_IOS_CLIENT_ID = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID || '606997989793-6dqib92de1r1v3jsdr0cvs2p9c1md0gm.apps.googleusercontent.com'

if (Capacitor.isNativePlatform()) {
  try {
    GoogleAuth.initialize({
      clientId: GOOGLE_IOS_CLIENT_ID,
      serverClientId: GOOGLE_CLIENT_ID,
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    } as any);
  } catch (err) {
    console.warn('[GoogleAuth] Native initialize warning:', err)
  }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile, error } = await supabase
    .from('my_profile')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) return null
  return profile
}

const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      return resolve()
    }
    const existing = document.getElementById('gsi-client-script')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', (err) => reject(err))
      return
    }
    const script = document.createElement('script')
    script.id = 'gsi-client-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}

export const signInWithGoogle = async () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '606997989793-k2cuig6n7v5iiddc2sqfp6acm7st62t9.apps.googleusercontent.com'
  const googleIosClientId = import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID || '606997989793-6dqib92de1r1v3jsdr0cvs2p9c1md0gm.apps.googleusercontent.com'

  if (Capacitor.isNativePlatform()) {
    try {
      // Re-garante a inicialização com iOS clientId e Web serverClientId para o SDK Swift
      try {
        await GoogleAuth.initialize({
          clientId: googleIosClientId,
          serverClientId: googleClientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        } as any)
      } catch (initErr) {
        console.warn('[GoogleAuth] Re-init warn:', initErr)
      }

      // CRÍTICO PARA IOS: serverClientId é obrigatório no parâmetro de chamada do plugin Swift
      const googleUser = await GoogleAuth.signIn({
        scopes: ['profile', 'email'],
        serverClientId: googleClientId,
      } as any)

      const idToken = googleUser?.authentication?.idToken
      if (!idToken) {
        throw new Error('Nenhum token ID retornado pelo Google Sign-In nativo.')
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error during native Google sign in, attempting fallback:', error)
      // Fallback para ambientes emulados/simuladores sem Google Play Services ou contas configuradas
      // CrewAI ios-dev+banco: deep-link unificado (== Apple) + listener fecha o Browser ao voltar.
      try {
        const { Browser } = await import('@capacitor/browser')
        const { NATIVE_LOGIN_CALLBACK, installNativeAuthListener, waitForNativeOAuthCallback, exchangeCallbackForSession, closeNativeBrowser } = await import('./nativeAuth')
        await installNativeAuthListener()
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: NATIVE_LOGIN_CALLBACK,
            skipBrowserRedirect: true,
          },
        })
        if (oauthError) throw oauthError

        if (data?.url) {
          console.log('[GoogleAuth] Abrindo fallback OAuth no In-App Browser...')
          await Browser.open({ url: data.url, presentationStyle: 'popover' })
          // Aguarda o deep-link voltar ao app e troca ?code= pela sessão (não retorna antes).
          const callbackUrl = await waitForNativeOAuthCallback(90000)
          await closeNativeBrowser()
          return await exchangeCallbackForSession(callbackUrl, supabase)
        }
        return data
      } catch (fallbackErr) {
        throw error
      }
    }
  } else {
    // WEB (Chrome/desktop): One Tap quando exibível, senão redirect OAuth
    // de primeira classe para o callback canônico — nunca o endereço-base.
    // (O clique sintético no botão oculto gerava evento não-confiável e o
    //  Chrome bloqueava o popup; removido.)
    const { getWebAuthCallbackUrl, rememberPostLoginPath } = await import('./webAuth')
    const redirectTo = getWebAuthCallbackUrl()
    const startOAuthRedirect = async () => {
      rememberPostLoginPath()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) throw error
      return data
    }
    try {
      await loadGsiScript()
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '606997989793-k2cuig6n7v5iiddc2sqfp6acm7st62t9.apps.googleusercontent.com'

      // Reseta o cookie de bloqueio temporário do Google One-Tap/GSI
      try {
        document.cookie = 'g_state=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      } catch {}

      if (!window.google?.accounts?.id) {
        return await startOAuthRedirect()
      }

      return await new Promise((resolve, reject) => {
        let settled = false
        const finishRedirect = async () => {
          if (settled) return
          settled = true
          try {
            resolve(await startOAuthRedirect())
          } catch (oauthErr) {
            reject(oauthErr)
          }
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (settled) return
            settled = true
            try {
              if (!response.credential) {
                throw new Error('Nenhum token retornado pelo Google.')
              }
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
              })
              if (error) throw error
              resolve(data)
            } catch (err) {
              reject(err)
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        // One Tap não exige gesto confiável (ao contrário do popup).
        window.google.accounts.id.prompt(async (notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.warn('[GoogleAuth] One Tap não exibido, indo ao OAuth canônico:', redirectTo)
            await finishRedirect()
          }
          // Se exibido, aguarda a escolha da conta (callback acima resolve).
        })

        // Rede de segurança: se o One Tap não responder em 5s, redireciona.
        setTimeout(() => {
          if (!settled) {
            console.warn('[GoogleAuth] One Tap sem resposta, indo ao OAuth canônico.')
            void finishRedirect()
          }
        }, 5000)
      })
    } catch (gsiErr) {
      console.warn('[GoogleAuth] GSI falhou ou bloqueado, utilizando OAuth canônico:', gsiErr)
      return await startOAuthRedirect()
    }
  }
}

/** Pré-carrega o script GSI (chamar no mount do Login/Register p/ One Tap imediato). */
export const preloadGsiScript = async (): Promise<void> => {
  try {
    await loadGsiScript()
  } catch (err) {
    console.warn('[GoogleAuth] preload GSI falhou (OAuth direto continua valendo):', err)
  }
}


export const signInWithApple = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import('@capacitor/browser')
      const { NATIVE_LOGIN_CALLBACK, installNativeAuthListener, waitForNativeOAuthCallback, exchangeCallbackForSession, closeNativeBrowser } = await import('./nativeAuth')
      await installNativeAuthListener()
      // Deep-link registrado no Info.plist (CFBundleURLSchemes) + Supabase Redirect URLs.
      // Site URL / Vercel + com.daig.marketplace://login-callback devem estar
      // cadastrados em Supabase Dashboard > Authentication > URL Configuration.
      const redirectTo = 'com.daig.marketplace://login-callback'
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          scopes: 'name email',
        },
      })
      if (error) throw error
      if (data?.url) {
        console.log('[AppleAuth] Abrindo OAuth Apple no In-App Browser...')
        await Browser.open({ url: data.url, presentationStyle: 'popover' })
        const callbackUrl = await waitForNativeOAuthCallback(90000)
        await closeNativeBrowser()
        return await exchangeCallbackForSession(callbackUrl, supabase)
      }
      return data
    } catch (error) {
      console.error('[AppleAuth] Erro no login Apple nativo:', error)
      throw error
    }
  } else {
    const { getWebAuthCallbackUrl, rememberPostLoginPath } = await import('./webAuth')
    rememberPostLoginPath()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: getWebAuthCallbackUrl(),
        scopes: 'name email',
      },
    })
    if (error) throw error
    return data
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getAdminStats = async () => {
  try {
    // Queries diretas (sem RPC) para evitar 404 em produção — RPCs get_total_* não existem no Supabase
    const [usersRes, txRes, partsRes] = await Promise.all([
      (async () => {
        const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
        if (count !== null) return count
        const { count: c2 } = await supabase.from('admin_profiles').select('id', { count: 'exact', head: true })
        return c2 || 0
      })(),
      supabase.from('transactions').select('amount, payment_status, fulfillment_status', { count: 'exact' }),
      supabase.from('parts').select('id', { count: 'exact', head: true }),
    ])
    const totalUsers = usersRes as number
    const txData = (txRes.data as Array<{amount:number;payment_status:string;fulfillment_status:string}> | null) || []
    const totalTransactions = txRes.count || 0
    const totalGMV = txData.reduce((s, t) => {
      if (t.payment_status === 'paid' || ['delivered','completed'].includes(t.fulfillment_status)) return s + Number(t.amount || 0)
      return s
    }, 0)
    const totalRevenue = Math.round(totalGMV * 0.1)
    const completedTransactions = txData.filter(t => t.payment_status === 'paid').length
    void partsRes
    return {
      totalUsers,
      totalGMV,
      totalRevenue,
      totalTransactions,
      completedTransactions
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalUsers: 0,
      totalGMV: 0,
      totalRevenue: 0,
      totalTransactions: 0,
      completedTransactions: 0
    }
  }
}

export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('id, email, full_name, role, rating, is_verified, created_at, ultimo_login')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
}

export const toggleUserVerification = async (userId: string, isVerified: boolean) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !isVerified })
      .eq('id', userId)
      
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error toggling user verification:', error)
    return false
  }
}

export const getTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        payment_status,
        fulfillment_status,
        created_at,
        profiles!transactions_buyer_id_fkey(id, full_name),
        profiles!transactions_seller_id_fkey(id, full_name),
        parts!transactions_part_id_fkey(title)
      `)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

export const updateTransactionStatus = async (
  transactionId: string, 
  status: string, 
  type: 'payment' | 'fulfillment'
) => {
  try {
    const updateData = type === 'payment' 
      ? { payment_status: status } 
      : { fulfillment_status: status }
      
    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating transaction status:', error)
    return false
  }
}