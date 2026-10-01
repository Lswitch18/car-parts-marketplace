import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { I18nProvider } from '@/modules/shared/lib/i18n'

// Mock GSAP/useGSAP para jsdom (Login usa animações)
import Login from '@/modules/identity/pages/Login'

describe('Login dual auth + idioma visível (CrewAI iOS)', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    })
  })
  it('mostra Google + Apple e seletor de idioma JP/BR', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Login />
        </I18nProvider>
      </MemoryRouter>
    )
    // Dois métodos de autenticação (texto traduzido em JP por padrão)
    expect(screen.getByText('Googleで続行')).toBeInTheDocument()
    expect(screen.getByText('Appleで続行')).toBeInTheDocument()
    // Botão Apple segue HIG (preto) e acessível
    const appleBtn = screen.getByRole('button', { name: /Sign in with Apple/i })
    expect(appleBtn).toBeInTheDocument()
    // Seletor de idioma visível (日本語 / Português)
    expect(screen.getByText(/日本語/)).toBeInTheDocument()
  })
})
