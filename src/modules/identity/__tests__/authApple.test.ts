import { describe, it, expect, vi, beforeEach } from 'vitest'

// Garante que o módulo supabase carrega em jsdom (env presente no .env de dev)
import * as supabaseLib from '@/modules/shared/lib/supabase'
import { useAuthStore } from '@/modules/identity/store/authStore'

describe('Auth dual Google + Apple (CrewAI Auth)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('expõe signInWithGoogle e signInWithApple no lib supabase', () => {
    expect(typeof supabaseLib.signInWithGoogle).toBe('function')
    expect(typeof supabaseLib.signInWithApple).toBe('function')
  })

  it('authStore expõe signInGoogle e signInApple', () => {
    const state = useAuthStore.getState()
    expect(typeof state.signInGoogle).toBe('function')
    expect(typeof state.signInApple).toBe('function')
    expect(typeof state.signIn).toBe('function')
    expect(typeof state.signOut).toBe('function')
  })

  it('signInApple delega para supabase lib e controla loading', async () => {
    const spy = vi
      .spyOn(supabaseLib, 'signInWithApple')
      .mockResolvedValue({ url: null } as any)

    const before = useAuthStore.getState()
    expect(before.loading).toBe(true) // initial store loading=true antes de initialize

    await useAuthStore.getState().signInApple()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('signInApple propaga erro e reseta loading', async () => {
    vi.spyOn(supabaseLib, 'signInWithApple').mockRejectedValue(new Error('apple disabled'))
    await expect(useAuthStore.getState().signInApple()).rejects.toThrow('apple disabled')
    expect(useAuthStore.getState().loading).toBe(false)
  })
})
