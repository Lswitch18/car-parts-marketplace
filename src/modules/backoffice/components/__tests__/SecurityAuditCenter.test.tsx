import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@/modules/shared/lib/i18n'
import SecurityAuditCenter from '@/modules/backoffice/components/SecurityAuditCenter'

const renderWithProviders = (ui: React.ReactElement) => render(<I18nProvider>{ui}</I18nProvider>)

describe('SecurityAuditCenter Component', () => {
  test('renders header and health status', () => {
    renderWithProviders(<SecurityAuditCenter />)
    expect(screen.getByText(/Central de Segurança & Auditoria Shift-Left/i)).toBeInTheDocument()
    expect(screen.getByText(/Proteção de Banco RLS/i)).toBeInTheDocument()
    expect(screen.getByText(/Criptografia Financeira/i)).toBeInTheDocument()
    expect(screen.getByText(/Tentativas Bloqueadas/i)).toBeInTheDocument()
  })
})
