import { create } from 'zustand'
import { User } from '@/modules/shared/types'
import { supabase } from '@/modules/shared/lib/supabase'
import { signInWithGoogle, signOut as supabaseSignOut } from '@/modules/shared/lib/supabase'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

// Module-level vars — survive React re-renders
let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null
let initPromise: Promise<void> | null = null

function createMinimalUser(sessionUser: Session['user']): User {
  const meta = sessionUser.user_metadata || {}
  const name = meta?.full_name || meta?.name || sessionUser.email?.split('@')[0] || 'Usuário'
  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    full_name: name,
    name,
    avatar_url: meta?.avatar_url || meta?.picture || null,
    role: 'buyer',
    created_at: sessionUser.created_at || new Date().toISOString(),
  }
}

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  isAdmin: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<User | null>
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<User | null>
  signInGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<boolean>
  updateProfile: (updates: Partial<User>) => Promise<void>
  ensureSession: () => Promise<boolean>
}

async function fetchAndMapProfile(userId: string, sessionUser: Session['user']): Promise<User | null> {
  console.log('[authStore] fetchAndMapProfile started for userId:', userId, 'email:', sessionUser.email)
  try {
    console.debug('[authStore] Querying profiles table for userId:', userId)
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError && (profileError.code === 'PGRST303' || profileError.message?.includes('JWT expired'))) {
      console.warn('[authStore] JWT expired during profile fetch. Refreshing session...')
      const { data: refreshed } = await supabase.auth.refreshSession()
      if (refreshed?.session) {
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        profile = retryProfile
        profileError = retryError
      }
    }

    if (profileError) {
      console.warn('[authStore] Profile fetch query returned error or no profile:', profileError.message)
    }

    if (profileError || !profile) {
      const meta = sessionUser.user_metadata || {}
      console.log('[authStore] Profile not found. Creating new profile with default role: buyer')

      let { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: sessionUser.email ?? '',
          full_name: meta?.full_name || meta?.name || sessionUser.email?.split('@')[0] || 'Usuário',
          phone: meta?.phone || null,
          avatar_url: meta?.avatar_url || meta?.picture || null,
          rating: 0,
          total_sales: 0,
          is_verified: false,
          role: 'buyer',
        })
        .select()
        .single()

      if (createError && (createError.code === 'PGRST303' || createError.message?.includes('JWT expired'))) {
        console.warn('[authStore] JWT expired during profile creation. Refreshing session...')
        const { data: refreshed } = await supabase.auth.refreshSession()
        if (refreshed?.session) {
          const { data: retryNewProfile, error: retryCreateErr } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: sessionUser.email ?? '',
              full_name: meta?.full_name || meta?.name || sessionUser.email?.split('@')[0] || 'Usuário',
              phone: meta?.phone || null,
              avatar_url: meta?.avatar_url || meta?.picture || null,
              rating: 0,
              total_sales: 0,
              is_verified: false,
              role: 'buyer',
            })
            .select()
            .single()
          newProfile = retryNewProfile
          createError = retryCreateErr
        }
      }

      if (createError) {
        if (createError.code === '23505') {
          console.log('[authStore] Conflict (23505) during profile creation. Retrying query.')
          const { data: retry } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          if (retry) {
            console.log('[authStore] Retry query successful. Found profile.')
            return { ...retry, name: retry.full_name } as User
          }
        }
        console.error('[authStore] fetchAndMapProfile create error:', createError)
        return createMinimalUser(sessionUser)
      }
      if (!newProfile) {
        console.warn('[authStore] New profile insert returned null data.')
        return createMinimalUser(sessionUser)
      }
      console.log('[authStore] New profile created successfully.')
      profile = newProfile
    }

    console.log('[authStore] Profile mapped successfully. User role:', profile.role)
    return { ...profile, name: profile.full_name } as User
  } catch (err) {
    console.error('[authStore] fetchAndMapProfile error in catch block:', err)
    return createMinimalUser(sessionUser)
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  isAdmin: false,

  setUser: (user) => {
    console.debug('[authStore] setUser called with:', user?.email, 'role:', user?.role)
    set({ user, isAdmin: user?.role === 'admin' })
  },
  setLoading: (loading) => {
    console.debug('[authStore] setLoading called with:', loading)
    set({ loading })
  },

  initialize: async (): Promise<void> => {
    if (get().initialized) {
      console.log('[authStore] Already initialized. User:', get().user?.email)
      if (get().loading) set({ loading: false })
      return
    }

    if (initPromise) {
      console.log('[authStore] initialize called but initPromise already exists, returning it')
      return initPromise
    }

    console.log('[authStore] Starting sequential auth initialization...')

    initPromise = (async () => {
      try {
        // Step 1: Fetch session first
        console.log('[authStore] Step 1: Fetching current session directly via getSession()')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[authStore] getSession() error:', error)
        } else if (session?.user) {
          console.log('[authStore] getSession() found active session for:', session.user.email)
          const mapped = await fetchAndMapProfile(session.user.id, session.user)
          console.log('[authStore] getSession() profile fetch completed. User:', mapped?.email)
          if (mapped) get().setUser(mapped)
        } else {
          console.log('[authStore] getSession() returned no session')
        }

        // Step 2: Register the listener for FUTURE auth changes
        if (authListener) {
          console.debug('[authStore] Cleaning up old auth listener')
          authListener.data.subscription.unsubscribe()
          authListener = null
        }

        console.log('[authStore] Step 2: Registering onAuthStateChange listener for future changes')
        authListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          console.log('[authStore] onAuthStateChange event triggered:', event, '| Session User:', session?.user?.email)

          try {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              if (session?.user) {
                // If user is already set and is the same, avoid redundant queries
                if (get().user?.id === session.user.id) {
                  console.debug('[authStore] Listener event matches current user, skipping profile fetch')
                  set({ loading: false, initialized: true })
                  return
                }
                
                console.log('[authStore] Listener event: fetching profile for:', session.user.email)
                const mapped = await fetchAndMapProfile(session.user.id, session.user)
                if (mapped) get().setUser(mapped)
              }
              set({ loading: false, initialized: true })

            } else if (event === 'SIGNED_OUT') {
              console.log('[authStore] Listener event: SIGNED_OUT -> clearing user')
              set({ user: null, isAdmin: false, loading: false, initialized: true })

            } else if (event === 'INITIAL_SESSION') {
              // We already handled the initial session via getSession(), so we can ignore this or use it as fallback
              if (session?.user && !get().user) {
                console.log('[authStore] Listener event: INITIAL_SESSION fallback fetching profile for:', session.user.email)
                const mapped = await fetchAndMapProfile(session.user.id, session.user)
                if (mapped) get().setUser(mapped)
              }
              set({ loading: false, initialized: true })
            } else {
              set({ loading: false, initialized: true })
            }
          } catch (err) {
            console.error('[authStore] Error in onAuthStateChange callback:', err)
            set({ loading: false, initialized: true })
          }
        })

        // Step 3: Mark initialization as complete
        console.log('[authStore] Step 3: Marking initialization complete')
        set({ loading: false, initialized: true })

      } catch (err) {
        console.error('[authStore] Error during initialize():', err)
        set({ loading: false, initialized: true })
      }
    })()

    return initPromise
  },

  signIn: async (email: string, password: string): Promise<User | null> => {
    console.debug('[authStore] signIn:', email)
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // Auth listener (SIGNED_IN) will set loading: false
      return null
    } catch (error) {
      console.error('[authStore] signIn error:', error)
      set({ loading: false })
      throw error
    }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, any>): Promise<User | null> => {
    console.debug('[authStore] signUp:', email)
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } })
      if (error) throw error
      return null
    } catch (error) {
      console.error('[authStore] signUp error:', error)
      set({ loading: false })
      throw error
    }
  },

  signInGoogle: async (): Promise<void> => {
    console.debug('[authStore] signInGoogle')
    set({ loading: true })
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('[authStore] signInGoogle error:', error)
      set({ loading: false })
      throw error
    }
  },

  signOut: async (): Promise<void> => {
    console.debug('[authStore] signOut')
    try {
      await supabaseSignOut()
    } catch (error) {
      console.error('[authStore] signOut error:', error)
    } finally {
      // Reset everything so next initialize() runs fresh
      initPromise = null
      if (authListener) {
        authListener.data.subscription.unsubscribe()
        authListener = null
      }
      set({ user: null, isAdmin: false, loading: false, initialized: false })
    }
  },

  refreshSession: async (): Promise<boolean> => {
    console.debug('[authStore] refreshSession')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const mapped = await fetchAndMapProfile(session.user.id, session.user)
        if (mapped) {
          get().setUser(mapped)
          set({ loading: false, initialized: true })
          return true
        }
      }
      set({ loading: false, initialized: true })
      return false
    } catch (error) {
      console.error('[authStore] refreshSession error:', error)
      set({ loading: false, initialized: true })
      return false
    }
  },

  ensureSession: async (): Promise<boolean> => {
    console.debug('[authStore] ensureSession, current user:', get().user?.email)
    if (get().user) return true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const mapped = await fetchAndMapProfile(session.user.id, session.user)
        if (mapped) {
          get().setUser(mapped)
          set({ loading: false, initialized: true })
          console.debug('[authStore] ensureSession: restored user:', mapped.email)
          return true
        }
      }
      set({ loading: false, initialized: true })
      console.debug('[authStore] ensureSession: no session found')
      return false
    } catch (e) {
      console.error('[authStore] ensureSession error:', e)
      set({ loading: false, initialized: true })
      return false
    }
  },

  updateProfile: async (updates: Partial<User>): Promise<void> => {
    const { user } = get()
    if (!user) return
    try {
      const { role: _ignoredRole, is_verified: _ignoredVerified, ...safeUpdates } = updates
      let { data, error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', user.id)
        .select()
        .single()

      if (error && (error.code === 'PGRST303' || error.message?.includes('JWT expired'))) {
        console.warn('[authStore] JWT expired during updateProfile. Refreshing session...')
        const { data: refreshed } = await supabase.auth.refreshSession()
        if (refreshed?.session) {
          const { data: retryData, error: retryErr } = await supabase
            .from('profiles')
            .update(safeUpdates)
            .eq('id', user.id)
            .select()
            .single()
          data = retryData
          error = retryErr
        }
      }

      if (error) throw error
      const updated = { ...data, name: data.full_name } as User
      set({ user: updated, isAdmin: updated.role === 'admin' })
    } catch (error) {
      console.error('[authStore] updateProfile error:', error)
      throw error
    }
  },
}))