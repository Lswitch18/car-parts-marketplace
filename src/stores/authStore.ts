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
    console.debug('[authStore] initPromise set, listening to auth changes');
    if (get().initialized) {
      if (!get().user) {
        console.debug('[authStore] already initialized but no user, ensuring session');
        await get().ensureSession();
      }
      console.debug('[authStore] initialize early exit, already initialized');
      return;
    }
    
    if (initPromise) return initPromise;

    if (authListener) authListener.data.subscription.unsubscribe();

    // Set up Supabase auth listener
    authListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('[authStore] Auth event:', event)

      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            // If we already have the user in state, just ensure loading/initialized are cleared
            if (!get().user) {
              const mapped = await fetchAndMapProfile(session.user.id, session.user);
              if (mapped) {
                get().setUser(mapped);
              }
            }
          }
          // ALWAYS mark loading done and initialized – this was the source of the infinite spinner
          set({ loading: false, initialized: true });
          console.debug('[authStore] auth event handled', { event, user: get().user?.email });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isAdmin: false, loading: false, initialized: true });
          console.debug('[authStore] signed out, state cleared');
        } else {
          // Unknown event – still unblock loading
          set({ loading: false, initialized: true });
        }
      } catch (err) {
        console.error('[authStore] onAuthStateChange error:', err);
        // On error, always unblock so UI doesn't freeze
        set({ loading: false, initialized: true });
      }
    })

    initPromise = (async () => {
      try {
        // Fetch current session and any errors
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[authStore] Session error:', sessionError)
          set({ user: null, isAdmin: false, loading: false, initialized: true })
          return
        }

        if (session?.user && !get().user) {
          const mapped = await fetchAndMapProfile(session.user.id, session.user);
          if (mapped) {
            get().setUser(mapped);
          }
          // Ensure loading and initialized are set after session init
          set({ loading: false, initialized: true });
          console.debug('[authStore] init completed', { user: get().user, initialized: true });
        } else {
          set({ loading: false, initialized: true });
          console.debug('[authStore] init completed', { user: get().user, initialized: true });
        }
      } catch (error) {
        console.error('[authStore] Init error:', error)
        set({ user: null, isAdmin: false, loading: false, initialized: true })
      }
    })()

    return initPromise
  },

  signIn: async (email: string, password: string): Promise<User | null> => {
    // Begin sign-in process
    console.debug('[authStore] signIn start', { email });
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Auth state change listener will handle user setting and loading reset
      console.debug('[authStore] signIn request sent successfully');
      return null;
    } catch (error) {
      console.error('[authStore] Sign in error:', error);
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, any>): Promise<User | null> => {
    // Begin sign-up process
    console.debug('[authStore] signUp start', { email });
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      })
      if (error) throw error;
      console.debug('[authStore] signUp request sent');
      // Auth state change listener will handle user setting and loading reset
      return null;
    } catch (error) {
      console.error('[authStore] Sign up error:', error);
      set({ loading: false });
      throw error;
    }
  },

  signInGoogle: async (): Promise<void> => {
    console.debug('[authStore] signInGoogle start');
    set({ loading: true });
    try {
      await signInWithGoogle();
      console.debug('[authStore] signInGoogle request sent');
    } catch (error) {
      console.error('[authStore] Google sign in error:', error);
      set({ loading: false });
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    console.debug('[authStore] signOut start');
    try {
      await supabaseSignOut();
      initPromise = null;
      set({ user: null, isAdmin: false, loading: false, initialized: false });
      console.debug('[authStore] signOut completed');
    } catch (error) {
      console.error('[authStore] Sign out error:', error);
      set({ loading: false });
      throw error;
    }
  },

  refreshSession: async (): Promise<boolean> => {
    console.debug('[authStore] refreshSession start');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mapped = await fetchAndMapProfile(session.user.id, session.user);
        if (mapped) {
          get().setUser(mapped);
          set({ loading: false, initialized: true });
          console.debug('[authStore] refreshSession success', { user: get().user?.email });
          return true;
        }
      }
      set({ user: null, isAdmin: false, loading: false, initialized: true });
      return false;
    } catch (error) {
      console.error('[authStore] refreshSession error:', error);
      set({ loading: false, initialized: true });
      return false;
    }
  },

  ensureSession: async (): Promise<boolean> => {
    console.debug('[authStore] ensureSession start', { user: get().user });
    if (get().user) return true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mapped = await fetchAndMapProfile(session.user.id, session.user);
        if (mapped) {
          get().setUser(mapped);
          console.debug('[authStore] ensureSession success', { user: mapped });
          return true;
        }
      }
      console.debug('[authStore] ensureSession no session');
      return false;
    } catch (e) {
      console.error('[authStore] ensureSession error:', e);
      return false;
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
      console.error('[authStore] Update profile error:', error)
      throw error
    }
  },
}))