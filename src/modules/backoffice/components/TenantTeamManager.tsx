import React, { useState } from 'react'
import { 
  Users, UserPlus, ShieldCheck, Key, CheckCircle2, XCircle, 
  Trash2, Mail, Lock, Sliders, AlertCircle, Sparkles, ShieldAlert
} from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'
import { TenantRole, TenantPermission } from '@/modules/shared/types'

interface TeamMember {
  id: string
  name: string
  email: string
  role: TenantRole
  status: 'active' | 'pending' | 'suspended'
  joinedAt: string
  permissions: TenantPermission[]
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Patrick Suzuki',
    email: 'patrick.ceo@daig.jp',
    role: 'tenant_admin',
    status: 'active',
    joinedAt: '2026-01-15',
    permissions: [
      'manage_inventory', 'publish_marketplace', 'print_qr_labels',
      'manage_work_orders', 'view_financials', 'manage_team_roles', 'audit_security_logs'
    ]
  },
  {
    id: 'mem-2',
    name: 'Wellynton Santos Jeronimo',
    email: 'wellynton.lead@daig.jp',
    role: 'tenant_admin',
    status: 'active',
    joinedAt: '2026-01-15',
    permissions: [
      'manage_inventory', 'publish_marketplace', 'print_qr_labels',
      'manage_work_orders', 'view_financials', 'manage_team_roles', 'audit_security_logs'
    ]
  },
  {
    id: 'mem-3',
    name: 'Kenji Sato',
    email: 'kenji.wms@daig.jp',
    role: 'tenant_manager',
    status: 'active',
    joinedAt: '2026-03-10',
    permissions: ['manage_inventory', 'print_qr_labels', 'manage_work_orders']
  },
  {
    id: 'mem-4',
    name: 'Hiroshi Tanaka',
    email: 'hiroshi.mechanic@daig.jp',
    role: 'tenant_mechanic',
    status: 'active',
    joinedAt: '2026-04-02',
    permissions: ['manage_work_orders', 'print_qr_labels']
  }
]

export default function TenantTeamManager() {
  const { t } = useI18n()

  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Form de convite
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<TenantRole>('tenant_operator')
  const [selectedPermissions, setSelectedPermissions] = useState<TenantPermission[]>([
    'manage_inventory', 'print_qr_labels'
  ])

  const ALL_PERMISSIONS: { id: TenantPermission; label: string; desc: string }[] = [
    { id: 'manage_inventory', label: 'Gestão de Estoque WMS', desc: 'Cadastrar, editar e excluir autopeças' },
    { id: 'publish_marketplace', label: 'Publicação no Marketplace', desc: 'Ativar anúncios públicos' },
    { id: 'print_qr_labels', label: 'Impressão de Etiquetas QR', desc: 'Imprimir etiquetas de estantes e caixas' },
    { id: 'manage_work_orders', label: 'Ordens de Serviço (Oficina)', desc: 'Movimentar Kanban da oficina' },
    { id: 'view_financials', label: 'Módulo Financeiro & Repasses', desc: 'Ver faturamento, JCT 10% e repasses' },
    { id: 'manage_team_roles', label: 'Gestão de Equipe & Permissões', desc: 'Convidar e alterar cargos de membros' },
    { id: 'audit_security_logs', label: 'Logs de Auditoria de Segurança', desc: 'Ver logs de acesso e tentativas RLS' }
  ]

  const togglePermission = (permId: TenantPermission) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permId))
    } else {
      setSelectedPermissions([...selectedPermissions, permId])
    }
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteName) return

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
      permissions: selectedPermissions
    }

    setMembers([...members, newMember])
    setShowInviteModal(false)
    setInviteEmail('')
    setInviteName('')
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id))
  }

  const getRoleBadge = (role: TenantRole) => {
    switch (role) {
      case 'tenant_admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">👑 Admin / Dono</span>
      case 'tenant_manager':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-cyan-300 border border-blue-500/30">💼 Gerente WMS</span>
      case 'tenant_operator':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">🔧 Operador IA</span>
      case 'tenant_mechanic':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">🛠️ Mecânico</span>
      case 'security_officer':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-300 border border-red-500/30">🛡️ Segurança</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">Membro</span>
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header do Módulo de Equipe */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            {t('Gestão de Equipe & Controle de Permissões (RBAC)')}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {t('Gerencie os membros da equipe do desmanche/oficina, atribua cargos e defina permissões granulares de acesso.')}
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('Convidar Novo Membro')}</span>
        </button>
      </div>

      {/* TABELA DE MEMBROS */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-mono">
                <th className="py-3 px-3">Membro da Equipe</th>
                <th className="py-3 px-3">Cargo / Papel</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Permissões Ativas</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-zinc-900/60 transition">
                  
                  {/* Nome e E-mail */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white flex items-center justify-center text-xs shrink-0 shadow-md">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{member.name}</p>
                        <p className="text-xs text-zinc-400 font-mono">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Cargo */}
                  <td className="py-3.5 px-3">
                    {getRoleBadge(member.role)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    {member.status === 'active' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center w-max space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ativo</span>
                      </span>
                    )}
                    {member.status === 'pending' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center w-max space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Convite Pendente</span>
                      </span>
                    )}
                  </td>

                  {/* Permissões */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {member.permissions.map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300">
                          {p.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-3 text-right">
                    {member.role !== 'tenant_admin' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Revogar Acesso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CONVIDAR MEMBRO */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                Convidar Membro para a Equipe
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label htmlFor="invite-name" className="block text-zinc-400 font-semibold mb-1">Nome Completo *</label>
                <input
                  id="invite-name"
                  type="text"
                  placeholder="Ex: Kenji Sato"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="invite-email" className="block text-zinc-400 font-semibold mb-1">E-mail Corporativo *</label>
                <input
                  id="invite-email"
                  type="email"
                  placeholder="funcionario@daig.jp"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="invite-role" className="block text-zinc-400 font-semibold mb-1">Cargo / Papel Principal</label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TenantRole)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:border-blue-500"
                >
                  <option value="tenant_operator">🔧 Operador de Estoque (Cadastro IA & WMS)</option>
                  <option value="tenant_mechanic">🛠️ Mecânico da Oficina (Kanban & O.S.)</option>
                  <option value="tenant_manager">💼 Gerente Operacional (Vendas & Estoque)</option>
                  <option value="security_officer">🛡️ Equipe de Segurança & Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-2">Permissões Granulares Liberadas</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm.id} className="flex items-center space-x-3 p-2 bg-zinc-950 border border-zinc-800/80 rounded-lg cursor-pointer hover:border-zinc-700">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded border-zinc-700 text-blue-500 focus:ring-0"
                      />
                      <div>
                        <p className="font-bold text-white">{perm.label}</p>
                        <p className="text-[10px] text-zinc-500">{perm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
              >
                Enviar Convite por E-mail
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
