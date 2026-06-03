import { create } from 'zustand'
import { User } from '../types'
import { supabase } from '../lib/supabase'
import { signInWithGoogle, signOut as supabaseSignOut } from '../lib/supabase'
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
    role: meta?.role || 'buyer',
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

    if (profileError) {
      console.warn('[authStore] Profile fetch query returned error or no profile:', profileError.message)
    }

    if (profileError || !profile) {
      const meta = sessionUser.user_metadata || {}
      const roleFromMeta = meta?.role || 'buyer'
      console.log('[authStore] Profile not found. Creating new profile with role:', roleFromMeta)
      
      const { data: newProfile, error: createError } = await supabase
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
          role: roleFromMeta,
        })
        .select()
        .single()

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
    // If already initialized and we have a user, nothing to do
    if (get().initialized) {
      console.debug('[authStore] Already initialized. User:', get().user?.email, 'Loading:', get().loading)
      if (get().loading) set({ loading: false })
      return
    }

    if (initPromise) {
      console.debug('[authStore] initialize called but initPromise already exists, returning it')
      return initPromise
    }

    console.log('[authStore] Initializing auth state...')

    initPromise = (async () => {
      try {
        if (authListener) {
          console.debug('[authStore] Cleaning up existing auth listener')
          authListener.data.subscription.unsubscribe()
          authListener = null
        }

        console.debug('[authStore] Registering onAuthStateChange listener')
        authListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          console.log('[authStore] onAuthStateChange event triggered:', event, '| Session User:', session?.user?.email)

          try {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              if (session?.user) {
                console.debug('[authStore] event:', event, '-> session user exists. Current store user:', get().user?.email)
                if (!get().user) {
                  console.log('[authStore] Profile not in store. Fetching profile for:', session.user.email)
                  const mapped = await fetchAndMapProfile(session.user.id, session.user)
                  console.log('[authStore] Profile fetch finished. Mapped user:', mapped?.email)
                  if (mapped) get().setUser(mapped)
                }
              }
              console.debug('[authStore] event:', event, '-> setting loading: false, initialized: true')
              set({ loading: false, initialized: true })

            } else if (event === 'SIGNED_OUT') {
              console.log('[authStore] event: SIGNED_OUT -> clearing store user')
              set({ user: null, isAdmin: false, loading: false, initialized: true })

            } else if (event === 'INITIAL_SESSION') {
              console.log('[authStore] event: INITIAL_SESSION | Session User:', session?.user?.email)
              if (session?.user) {
                if (!get().user) {
                  console.log('[authStore] INITIAL_SESSION -> fetching profile for:', session.user.email)
                  const mapped = await fetchAndMapProfile(session.user.id, session.user)
                  console.log('[authStore] INITIAL_SESSION -> profile fetched:', mapped?.email)
                  if (mapped) get().setUser(mapped)
                }
              }
              console.debug('[authStore] INITIAL_SESSION -> setting loading: false, initialized: true')
              set({ loading: false, initialized: true })

            } else {
              console.debug('[authStore] Other auth event:', event, '-> setting loading: false, initialized: true')
              set({ loading: false, initialized: true })
            }
          } catch (err) {
            console.error('[authStore] Error in onAuthStateChange callback:', err)
            set({ loading: false, initialized: true })
          }
        })

        console.debug('[authStore] Fetching current session via getSession() directly')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[authStore] getSession() error:', error)
          set({ loading: false, initialized: true })
          return
        }

        if (get().initialized) {
          console.log('[authStore] getSession() returned, but listener already initialized store. Skipping.')
          return
        }

        if (session?.user) {
          console.log('[authStore] getSession() found active session for:', session.user.email)
          const mapped = await fetchAndMapProfile(session.user.id, session.user)
          console.log('[authStore] getSession() profile fetched for:', mapped?.email)
          if (mapped) get().setUser(mapped)
        } else {
          console.log('[authStore] getSession() returned no session')
        }

        console.debug('[authStore] getSession flow -> setting loading: false, initialized: true')
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
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      const updated = { ...data, name: data.full_name } as User
      set({ user: updated, isAdmin: updated.role === 'admin' })
    } catch (error) {
      console.error('[authStore] updateProfile error:', error)
      throw error
    }
  },
}))