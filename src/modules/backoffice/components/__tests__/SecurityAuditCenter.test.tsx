import { render, screen } from '@testing-library/react'
import SecurityAuditCenter from '@/modules/backoffice/components/SecurityAuditCenter'

describe('SecurityAuditCenter Component', () => {
  test('renders header and health status', () => {
    render(<SecurityAuditCenter />)
    expect(screen.getByText(/Central de Segurança & Auditoria Shift-Left/i)).toBeInTheDocument()
    expect(screen.getByText(/Proteção de Banco RLS/i)).toBeInTheDocument()
    expect(screen.getByText(/Criptografia Financeira/i)).toBeInTheDocument()
    expect(screen.getByText(/Tentativas Bloqueadas/i)).toBeInTheDocument()
  })
})
