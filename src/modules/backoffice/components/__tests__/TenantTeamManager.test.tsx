import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TenantTeamManager from '@/modules/backoffice/components/TenantTeamManager'
import { I18nProvider } from '@/modules/shared/lib/i18n'
import { TenantRole, TenantPermission } from '@/modules/shared/types'

const renderWithProviders = (ui: React.ReactElement) => render(<I18nProvider>{ui}</I18nProvider>)

describe('TenantTeamManager Component', () => {
  test('renders header and initial members', () => {
    renderWithProviders(<TenantTeamManager />)
    expect(screen.getByText(/Gestão de Equipe & Controle de Permissões/i)).toBeInTheDocument()
    // Check initial members
    expect(screen.getByText('Patrick Suzuki')).toBeInTheDocument()
    expect(screen.getByText('Wellynton Santos Jeronimo')).toBeInTheDocument()
  })

  test('opens invite modal and adds a new member', async () => {
    renderWithProviders(<TenantTeamManager />)
    const inviteButton = screen.getByRole('button', { name: /Convidar Novo Membro/i })
    fireEvent.click(inviteButton)

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/Nome Completo \*/i), { target: { value: 'Kenji Sato' } })
    fireEvent.change(screen.getByLabelText(/E-mail Corporativo \*/i), { target: { value: 'kenji.sato@daig.jp' } })
    fireEvent.change(screen.getByLabelText(/Cargo \//i), { target: { value: 'tenant_operator' } })

    // Select a permission checkbox (e.g., Gestão de Estoque)
    const inventoryCheckbox = screen.getByLabelText(/Gestão de Estoque WMS/i).querySelector('input')
    if (inventoryCheckbox) fireEvent.click(inventoryCheckbox)

    const submitBtn = screen.getByRole('button', { name: /Enviar Convite por E-mail/i })
    fireEvent.click(submitBtn)

    // Wait for the new member row to appear
    await waitFor(() => {
      expect(screen.getByText('kenji.sato@daig.jp')).toBeInTheDocument()
    })
  })
})
