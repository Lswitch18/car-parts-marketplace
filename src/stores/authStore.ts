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
  try {
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      const meta = sessionUser.user_metadata || {}
      const roleFromMeta = meta?.role || 'buyer'
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
          const { data: retry } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          if (retry) return { ...retry, name: retry.full_name } as User
        }
        console.error('[authStore] fetchAndMapProfile create error:', createError)
        return createMinimalUser(sessionUser)
      }
      if (!newProfile) return createMinimalUser(sessionUser)
      profile = newProfile
    }

    return { ...profile, name: profile.full_name } as User
  } catch (err) {
    console.error('[authStore] fetchAndMapProfile error:', err)
    return createMinimalUser(sessionUser)
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  isAdmin: false,

  setUser: (user) => {
    set({ user, isAdmin: user?.role === 'admin' })
  },
  setLoading: (loading) => set({ loading }),

  initialize: async (): Promise<void> => {
    // If already initialized and we have a user, nothing to do
    if (get().initialized) {
      console.debug('[authStore] already initialized, user:', get().user?.email)
      // Make sure loading is false (safety)
      if (get().loading) set({ loading: false })
      return
    }

    // Only run once at a time
    if (initPromise) return initPromise

    console.debug('[authStore] starting initialization...')

    initPromise = (async () => {
      try {
        // Step 1: Register auth state change listener FIRST
        if (authListener) {
          authListener.data.subscription.unsubscribe()
          authListener = null
        }

        authListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          console.log('[authStore] Auth event:', event, '| session user:', session?.user?.email)

          try {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              if (session?.user && !get().user) {
                console.debug('[authStore] fetching profile for:', session.user.email)
                const mapped = await fetchAndMapProfile(session.user.id, session.user)
                if (mapped) get().setUser(mapped)
              }
              // Always unlock loading on these events
              set({ loading: false, initialized: true })

            } else if (event === 'SIGNED_OUT') {
              set({ user: null, isAdmin: false, loading: false, initialized: true })

            } else if (event === 'INITIAL_SESSION') {
              // INITIAL_SESSION fires immediately after listener registration
              if (session?.user && !get().user) {
                console.debug('[authStore] INITIAL_SESSION with user:', session.user.email)
                const mapped = await fetchAndMapProfile(session.user.id, session.user)
                if (mapped) get().setUser(mapped)
              }
              // Always unlock — even if session is null
              set({ loading: false, initialized: true })

            } else {
              // Any other event — still unblock
              set({ loading: false, initialized: true })
            }
          } catch (err) {
            console.error('[authStore] onAuthStateChange handler error:', err)
            set({ loading: false, initialized: true })
          }
        })

        // Step 2: Also fetch session directly (belt-and-suspenders)
        // This covers cases where the listener might not fire (network issues, etc.)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[authStore] getSession error:', error)
          set({ loading: false, initialized: true })
          return
        }

        // If listener already resolved the state, don't duplicate work
        if (get().initialized) {
          console.debug('[authStore] listener already resolved, skipping getSession handler')
          return
        }

        if (session?.user) {
          console.debug('[authStore] getSession found user:', session.user.email)
          const mapped = await fetchAndMapProfile(session.user.id, session.user)
          if (mapped) get().setUser(mapped)
        } else {
          console.debug('[authStore] getSession: no session')
        }

        set({ loading: false, initialized: true })

      } catch (err) {
        console.error('[authStore] initialize error:', err)
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