import { create } from 'zustand'
import { User } from '../types'
import { supabase } from '../lib/supabase'
import { signInWithGoogle, signOut as supabaseSignOut } from '../lib/supabase'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null
let initPromise: Promise<void> | null = null

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
  updateProfile: (updates: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  isAdmin: false,

  setUser: (user) => set({ user, isAdmin: user?.role === 'admin' }),
  setLoading: (loading) => set({ loading }),

  initialize: () => {
    if (get().initialized) return Promise.resolve()
    if (initPromise) return initPromise

    if (authListener) authListener.data.subscription.unsubscribe()

    authListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('[authStore] Auth event:', event)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          set({ loading: true })
          const mapped = await fetchAndMapProfile(session.user.id)
          if (mapped) {
            set({ user: mapped, isAdmin: mapped.role === 'admin', loading: false, initialized: true })
          } else {
            console.warn('[authStore] fetchAndMapProfile returned null, keeping current user')
            set({ loading: false, initialized: true })
          }
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, isAdmin: false, loading: false, initialized: true })
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user && !get().user) {
          set({ loading: true })
          const mapped = await fetchAndMapProfile(session.user.id)
          if (mapped) {
            set({ user: mapped, isAdmin: mapped.role === 'admin', loading: false, initialized: true })
          } else {
            console.warn('[authStore] fetchAndMapProfile returned null on INITIAL_SESSION')
            set({ loading: false, initialized: true })
          }
        }
      }
    })

    initPromise = (async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[authStore] Session error:', sessionError)
          set({ user: null, isAdmin: false, loading: false, initialized: true })
          return
        }

        if (session?.user && !get().user) {
          const mapped = await fetchAndMapProfile(session.user.id)
          if (mapped) {
            set({ user: mapped, isAdmin: mapped.role === 'admin', loading: false, initialized: true })
          } else {
            console.warn('[authStore] fetchAndMapProfile returned null on getSession')
            set({ loading: false, initialized: true })
          }
        } else if (!session) {
          set({ user: null, isAdmin: false, loading: false, initialized: true })
        }
      } catch (error) {
        console.error('[authStore] Init error:', error)
        set({ user: null, isAdmin: false, loading: false, initialized: true })
      }
    })()

    return initPromise
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (!data.user) return null

      const mapped = await fetchAndMapProfile(data.user.id)
      if (mapped) {
        set({ user: mapped, isAdmin: mapped.role === 'admin', loading: false })
      } else {
        set({ loading: false })
      }
      return mapped
    } catch (error) {
      console.error('[authStore] Sign in error:', error)
      set({ loading: false })
      throw error
    }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })
      if (error) throw error
      if (!data.user) return null

      const mapped = await fetchAndMapProfile(data.user.id)
      if (mapped) {
        set({ user: mapped, isAdmin: mapped.role === 'admin', loading: false })
      } else {
        set({ loading: false })
      }
      return mapped
    } catch (error) {
      console.error('[authStore] Sign up error:', error)
      set({ loading: false })
      throw error
    }
  },

  signInGoogle: async () => {
    set({ loading: true })
    try {
      await signInWithGoogle()
      // Sessão será capturada pelo onAuthStateChange após redirect
    } catch (error) {
      console.error('[authStore] Google sign in error:', error)
      set({ loading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabaseSignOut()
      // onAuthStateChange irá limpar o estado automaticamente
      initPromise = null
      set({ user: null, isAdmin: false, loading: false, initialized: false })
    } catch (error) {
      console.error('[authStore] Sign out error:', error)
      set({ loading: false })
      throw error
    }
  },

  updateProfile: async (updates) => {
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
      console.error('[authStore] Update profile error:', error)
      throw error
    }
  },
}))