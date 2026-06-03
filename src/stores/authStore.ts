import { create } from 'zustand'
import { User } from '../types'
import { supabase } from '../lib/supabase'
import { signInWithGoogle, signOut as supabaseSignOut } from '../lib/supabase'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

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
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    const meta = sessionUser.user_metadata || {}

    const roleFromMeta = meta?.role || 'buyer';
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
    if (!newProfile) {
      return createMinimalUser(sessionUser)
    }
    profile = newProfile
  }

  return { ...profile, name: profile.full_name } as User
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  isAdmin: false,

  setUser: (user) => {
    set({ user, isAdmin: user?.role === 'admin' });
  },
  setLoading: (loading) => set({ loading }),

  initialize: async (): Promise<void> => {
    if (get().initialized) {
      if (!get().user) {
        await get().ensureSession();
      }
      return;
    }
    if (initPromise) return initPromise;


    if (authListener) authListener.data.subscription.unsubscribe()

    authListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('[authStore] Auth event:', event)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        if (session?.user && !get().user) {
          set({ loading: true })
          const mapped = await fetchAndMapProfile(session.user.id, session.user)
          if (mapped) {
            get().setUser(mapped)
          }
          set({ loading: false, initialized: true })
        }
      } else if (event === 'SIGNED_OUT') {
        const key = 'sb-clqubcryhbrjlupkgeva-auth-token'
        if (!localStorage.getItem(key)) {
          set({ user: null, isAdmin: false, loading: false, initialized: true })
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
          const mapped = await fetchAndMapProfile(session.user.id, session.user)
          if (mapped) {
            get().setUser(mapped)
          }
        }
        set({ loading: false, initialized: true })
      } catch (error) {
        console.error('[authStore] Init error:', error)
        set({ user: null, isAdmin: false, loading: false, initialized: true })
      }
    })()

    return initPromise
  },

  signIn: async (email: string, password: string): Promise<User | null> => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return null
    } catch (error) {
      console.error('[authStore] Sign in error:', error)
      set({ loading: false })
      throw error
    }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, any>): Promise<User | null> => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })
      if (error) throw error
      return null
    } catch (error) {
      console.error('[authStore] Sign up error:', error)
      set({ loading: false })
      throw error
    }
  },

  signInGoogle: async (): Promise<void> => {
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

  signOut: async (): Promise<void> => {
    set({ loading: true })
    try {
      await supabaseSignOut()
      initPromise = null
      set({ user: null, isAdmin: false, loading: false, initialized: false })
    } catch (error) {
      console.error('[authStore] Sign out error:', error)
      set({ loading: false })
      throw error
    }
  },

  refreshSession: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const mapped = await fetchAndMapProfile(session.user.id, session.user)
        if (mapped) {
          get().setUser(mapped);
          set({ loading: false, initialized: true });
          return true
        }
      }
      // No session found – mark initialized to avoid infinite loops
      set({ user: null, isAdmin: false, loading: false, initialized: true })
      return false
    } catch (error) {
      console.error('[authStore] refreshSession error:', error)
      set({ loading: false, initialized: true })
      return false
    }
  },

  // Ensure the store has a valid session. If user is missing, attempt to refresh.
  ensureSession: async (): Promise<boolean> => {
    const { user, refreshSession } = get()
    if (user) return true
    // Try to fetch session from Supabase
    const success = await refreshSession()
    return success
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
      console.error('[authStore] Update profile error:', error)
      throw error
    }
  },
}))