import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nProvider, useI18n } from '@/modules/shared/lib/i18n'

function Probe() {
  const { language, setLanguage, t } = useI18n()
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="entrar">{t('Entrar')}</span>
      <span data-testid="apple">{t('Continuar com Apple')}</span>
      <button onClick={() => setLanguage('pt')}>to-pt</button>
      <button onClick={() => setLanguage('ja')}>to-ja</button>
    </div>
  )
}

describe('i18n JP-first (CrewAI i18n/iOS)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('usa japonês como padrão quando não há preferência salva', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    )
    // Default JP — alvo iOS marketplace
    expect(screen.getByTestId('lang').textContent).toBe('ja')
    expect(screen.getByTestId('entrar').textContent).toBe('ログイン')
  })

  it('expõe chave Apple em JP e alterna para PT-BR persistindo', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>
    )
    expect(screen.getByTestId('apple').textContent).toBe('Appleで続行')

    fireEvent.click(screen.getByText('to-pt'))
    expect(screen.getByTestId('lang').textContent).toBe('pt')
    expect(screen.getByTestId('entrar').textContent).toBe('Entrar')
    expect(screen.getByTestId('apple').textContent).toBe('Continuar com Apple')
    expect(localStorage.getItem('daig-language')).toBe('pt')

    fireEvent.click(screen.getByText('to-ja'))
    expect(screen.getByTestId('lang').textContent).toBe('ja')
    expect(localStorage.getItem('daig-language')).toBe('ja')
  })

  it('expõe chaves do layout iOS (Home/Shop/Pagamentos)', () => {
    function IosProbe() {
      const { t } = useI18n()
      return (
        <div>
          <span data-testid="home">{t('Home')}</span>
          <span data-testid="shop">{t('Shop')}</span>
          <span data-testid="pay">{t('Pagamentos')}</span>
        </div>
      )
    }
    render(
      <I18nProvider>
        <IosProbe />
      </I18nProvider>
    )
    expect(screen.getByTestId('home').textContent).toBe('ホーム')
    expect(screen.getByTestId('shop').textContent).toBe('ショップ')
    expect(screen.getByTestId('pay').textContent).toBe('お支払い')
  })
})
