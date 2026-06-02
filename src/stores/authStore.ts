import { create } from 'zustand'
import { User } from '../types'
import { supabase } from '../lib/supabase'
import { signInWithGoogle, signOut as supabaseSignOut } from '../lib/supabase'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  signInGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

/**
 * Busca e mapeia o perfil do usuário no banco
 */
async function fetchAndMapProfile(userId: string): Promise<User | null> {
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    // Perfil não existe — cria automaticamente
    const { data: authUser } = await supabase.auth.getUser()
    const meta = authUser?.user?.user_metadata

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: authUser?.user?.email ?? '',
        full_name: meta?.full_name || meta?.name || authUser?.user?.email?.split('@')[0] || 'Usuário',
        phone: meta?.phone || null,
        avatar_url: meta?.avatar_url || meta?.picture || null,
        rating: 0,
        total_sales: 0,
        is_verified: false,
        role: 'buyer',
      })
      .select()
      .single()

    if (createError || !newProfile) return null
    profile = newProfile
  }

  return { ...profile, name: profile.full_name } as User
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    if (get().initialized) return

    // Remove listener anterior se houver (evita duplicatas no StrictMode)
    if (authListener) authListener.data.subscription.unsubscribe()

    // Inscrever no onAuthStateChange ANTES de getSession()
    // para não perder eventos de OAuth redirect
    authListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('[authStore] Auth event:', event)

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          set({ loading: true })
          const mapped = await fetchAndMapProfile(session.user.id)
          set({ user: mapped, loading: false, initialized: true })
        }
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, loading: false, initialized: true })
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user && !get().user) {
          set({ loading: true })
          const mapped = await fetchAndMapProfile(session.user.id)
          set({ user: mapped, loading: false, initialized: true })
        }
      }
    })

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('[authStore] Session error:', sessionError)
        set({ user: null, loading: false, initialized: true })
        return
      }

      if (session?.user && !get().user) {
        const mapped = await fetchAndMapProfile(session.user.id)
        set({ user: mapped, loading: false, initialized: true })
      } else if (!session) {
        set({ user: null, loading: false, initialized: true })
      }
    } catch (error) {
      console.error('[authStore] Init error:', error)
      set({ user: null, loading: false, initialized: true })
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
      set({ user: null, loading: false, initialized: false })
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
      set({ user: { ...data, name: data.full_name } as User })
    } catch (error) {
      console.error('[authStore] Update profile error:', error)
      throw error
    }
  },
}))