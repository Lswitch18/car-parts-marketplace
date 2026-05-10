import { create } from 'zustand'
import { User } from '../types'
import { supabase, signInWithGoogle, signOut as supabaseSignOut } from '../lib/supabase'

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    if (get().initialized) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          // Criar perfil automaticamente se não existir
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
              phone: user.user_metadata?.phone || null,
              rating: 0,
              total_sales: 0,
              is_verified: false
            })
            .select()
            .single()
          
          if (createError) {
            set({ user: null, loading: false, initialized: true })
            return
          }
          
          profile = newProfile
        }
        
        if (profile) {
          // Mapear full_name para name
          set({ user: { ...profile, name: profile.full_name } as User, loading: false, initialized: true })
        } else {
          set({ user: null, loading: false, initialized: true })
        }
      } else {
        set({ user: null, loading: false, initialized: true })
      }
    } catch (error) {
      set({ user: null, loading: false, initialized: true })
    }
  },

  signInGoogle: async () => {
    set({ loading: true })
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign in error:', error)
      set({ loading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabaseSignOut()
      set({ user: null, loading: false, initialized: false })
    } catch (error) {
      console.error('Sign out error:', error)
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
      console.error('Update profile error:', error)
      throw error
    }
  }
}))