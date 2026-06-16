import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { adminApi } from '../../lib/adminApi';
import { useI18n } from '../../lib/i18n';
import { useAuthStore } from '../../stores/authStore';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FolderTree, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ShieldAlert,
  Info,
  CheckSquare,
  Lock,
  KeyRound,
  Eye,
  Sliders
} from 'lucide-react';

const PREDEFINED_PERMISSIONS = [
  { id: 'users:read', label: 'Visualizar Usuários', desc: 'Permite listar e ver detalhes de perfis' },
  { id: 'users:write', label: 'Gerenciar Usuários', desc: 'Permite editar cargos, setores e status' },
  { id: 'transactions:read', label: 'Visualizar Transações', desc: 'Permite ver compras, vendas e faturamento' },
  { id: 'transactions:write', label: 'Moderar Transações', desc: 'Permite alterar status de pagamento/envio' },
  { id: 'logistics:read', label: 'Visualizar Logística', desc: 'Acesso ao painel e mapas de logística WMS' },
  { id: 'logistics:write', label: 'Operar Logística', desc: 'Gerenciar estoque, rotas, coletas e transportes' },
  { id: 'reviews:read', label: 'Visualizar Avaliações', desc: 'Permite ler avaliações de vendedores' },
  { id: 'reviews:write', label: 'Moderar Avaliações', desc: 'Permite remover ou sinalizar avaliações' },
  { id: 'settings:write', label: 'Ajustar Configurações', desc: 'Permite alterar parâmetros globais do sistema' }
];

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const { t } = useI18n();

  // Navigation
  const [activeTab, setActiveTab] = useState<'users' | 'cargos' | 'setores'>('users');

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterSetor, setFilterSetor] = useState('');

  const [setores, setSetores] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [armazens, setArmazens] = useState<any[]>([]);

  // Selection / Modal States
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userArmazens, setUserArmazens] = useState<any[]>([]);

  const [showCargoModal, setShowCargoModal] = useState(false);
  const [editingCargo, setEditingCargo] = useState<any | null>(null);
  const [cargoForm, setCargoForm] = useState({
    nome: '',
    nivel: 1,
    setor_id: '',
    permissoes: [] as string[]
  });

  const [showSetorModal, setShowSetorModal] = useState(false);
  const [editingSetor, setEditingSetor] = useState<any | null>(null);
  const [setorForm, setSetorForm] = useState({
    nome: ''
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users, sectors, and cargos in parallel using adminApi
      const [usersData, setoresData, cargosData, armazensData] = await Promise.all([
        adminApi.usuarios.list(),
        adminApi.setores.list().catch(() => []),
        adminApi.cargos.list().catch(() => []),
        adminApi.armazens.list().catch(() => [])
      ]);

      setUsers(usersData || []);
      setFilteredUsers(usersData || []);
      setSetores(setoresData || []);
      setCargos(cargosData || []);
      setArmazens(armazensData || []);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || 'Falha ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  // Search and filters for users
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.full_name || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term)
      );
    }

    if (filterRole) {
      result = result.filter(u => u.role === filterRole);
    }

    if (filterSetor) {
      result = result.filter(u => u.setor_id === filterSetor);
    }

    setFilteredUsers(result);
  }, [searchTerm, filterRole, filterSetor, users]);

  // Flash messages
  const showFlashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // ----------------------------------------------------
  // USER ACTIONS
  // ----------------------------------------------------
  const handleOpenUserDetails = async (userItem: any) => {
    try {
      setSubmitting(true);
      // Fetch full details including warehouse mappings
      const details = await adminApi.usuarios.get(userItem.id);
      setSelectedUser(details);
      setUserArmazens(details.armazens?.map((a: any) => ({ armazem_id: a.armazem_id || a.armazem?.id })) || []);
    } catch (err: any) {
      setError('Erro ao carregar detalhes do usuário: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveUserDetails = async () => {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      setError(null);

      // Update basic fields
      await adminApi.usuarios.update(selectedUser.id, {
        nome: selectedUser.full_name,
        email: selectedUser.email,
        cargo_id: selectedUser.cargo_id || null,
        setor_id: selectedUser.setor_id || null,
        telefone: selectedUser.phone || '',
        status: selectedUser.status || 'ativo',
        armazens: userArmazens.map(ua => ({ id: ua.armazem_id, acesso_admin: true }))
      });

      // Update role & is_verified via supabase directly
      await supabase
        .from('profiles')
        .update({
          role: selectedUser.role,
          is_verified: selectedUser.is_verified
        })
        .eq('id', selectedUser.id);

      showFlashSuccess('Usuário atualizado com sucesso.');
      setSelectedUser(null);
      await loadAllData();
    } catch (err: any) {
      setError('Falha ao salvar usuário: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserVerificationDirect = async (userId: string, currentStatus: boolean) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);

      if (err) throw err;
      showFlashSuccess('Status de verificação atualizado.');
      await loadAllData();
    } catch (err: any) {
      setError('Erro ao atualizar verificação: ' + err.message);
    }
  };

  const handleWarehouseToggle = (armazemId: string) => {
    setUserArmazens(prev => {
      const exists = prev.some(a => a.armazem_id === armazemId);
      if (exists) {
        return prev.filter(a => a.armazem_id !== armazemId);
      } else {
        return [...prev, { armazem_id: armazemId }];
      }
    });
  };

  // ----------------------------------------------------
  // CARGO (ROLE) ACTIONS
  // ----------------------------------------------------
  const handleOpenCreateCargo = () => {
    setEditingCargo(null);
    setCargoForm({
      nome: '',
      nivel: 1,
      setor_id: setores[0]?.id || '',
      permissoes: []
    });
    setShowCargoModal(true);
  };

  const handleOpenEditCargo = (cargoItem: any) => {
    setEditingCargo(cargoItem);
    
    let parsedPerms: string[] = [];
    try {
      if (typeof cargoItem.permissoes === 'string') {
        parsedPerms = JSON.parse(cargoItem.permissoes);
      } else if (Array.isArray(cargoItem.permissoes)) {
        parsedPerms = cargoItem.permissoes;
      }
    } catch (e) {
      console.warn("Failed to parse permissions", e);
    }

    setCargoForm({
      nome: cargoItem.nome,
      nivel: cargoItem.nivel || 1,
      setor_id: cargoItem.setor_id || '',
      permissoes: parsedPerms
    });
    setShowCargoModal(true);
  };

  const handleSaveCargo = async () => {
    if (!cargoForm.nome.trim()) {
      setError('O nome do cargo é obrigatório.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      if (editingCargo) {
        await adminApi.cargos.update(editingCargo.id, cargoForm);
        showFlashSuccess('Cargo atualizado com sucesso.');
      } else {
        await adminApi.cargos.create(cargoForm);
        showFlashSuccess('Cargo criado com sucesso.');
      }

      setShowCargoModal(false);
      await loadAllData();
    } catch (err: any) {
      setError('Erro ao salvar cargo: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCargo = async (id: string) => {
    if (!confirm('Deseja realmente remover este cargo?')) return;
    try {
      setSubmitting(true);
      setError(null);
      await adminApi.cargos.delete(id);
      showFlashSuccess('Cargo removido com sucesso.');
      await loadAllData();
    } catch (err: any) {
      setError('Falha ao remover cargo: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCargoPermissionToggle = (permId: string) => {
    setCargoForm(prev => {
      const perms = prev.permissoes.includes(permId)
        ? prev.permissoes.filter(p => p !== permId)
        : [...prev.permissoes, permId];
      return { ...prev, permissoes: perms };
    });
  };

  // ----------------------------------------------------
  // SETOR (DEPARTMENT) ACTIONS
  // ----------------------------------------------------
  const handleOpenCreateSetor = () => {
    setEditingSetor(null);
    setSetorForm({ nome: '' });
    setShowSetorModal(true);
  };

  const handleOpenEditSetor = (setorItem: any) => {
    setEditingSetor(setorItem);
    setSetorForm({ nome: setorItem.nome });
    setShowSetorModal(true);
  };

  const handleSaveSetor = async () => {
    if (!setorForm.nome.trim()) {
      setError('O nome do setor é obrigatório.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      if (editingSetor) {
        await adminApi.setores.update(editingSetor.id, setorForm);
        showFlashSuccess('Setor atualizado com sucesso.');
      } else {
        await adminApi.setores.create(setorForm);
        showFlashSuccess('Setor criado com sucesso.');
      }

      setShowSetorModal(false);
      await loadAllData();
    } catch (err: any) {
      setError('Erro ao salvar setor: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSetor = async (id: string) => {
    if (!confirm('Deseja realmente remover este setor? Isso pode afetar cargos associados.')) return;
    try {
      setSubmitting(true);
      setError(null);
      await adminApi.setores.delete(id);
      showFlashSuccess('Setor removido com sucesso.');
      await loadAllData();
    } catch (err: any) {
      setError('Falha ao remover setor: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mb-3" />
        <span className="text-xs uppercase tracking-widest font-black text-black">Carregando painel...</span>
      </div>
    );
  }

  // Helper for displaying permissions lists cleanly
  const renderPermissionsList = (permissionsObj: any) => {
    let list: string[] = [];
    try {
      if (typeof permissionsObj === 'string') {
        list = JSON.parse(permissionsObj);
      } else if (Array.isArray(permissionsObj)) {
        list = permissionsObj;
      }
    } catch (e) {}

    if (list.length === 0) return <span className="text-slate-400 font-normal">Nenhuma</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {list.map(p => (
          <span key={p} className="text-[10px] font-mono bg-slate-100 border border-black/10 px-1.5 py-0.5 rounded text-black font-bold">
            {p}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-10 font-sans antialiased">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-black/15 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Sistema Operacional</span>
          <h1 className="text-4xl font-black uppercase tracking-tight text-black mt-1">
            {t('Controle de Permissões')}
          </h1>
          <p className="text-slate-600 text-sm mt-1">{t('Gestão interna de setores, atribuições de cargos e níveis de acesso ao banco.')}</p>
        </div>

        {/* Action Button depending on current tab */}
        <div>
          {activeTab === 'cargos' && (
            <button 
              onClick={handleOpenCreateCargo}
              className="bg-black hover:bg-neutral-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all border-2 border-black flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} strokeWidth={3} /> {t('Novo Cargo')}
            </button>
          )}
          {activeTab === 'setores' && (
            <button 
              onClick={handleOpenCreateSetor}
              className="bg-black hover:bg-neutral-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all border-2 border-black flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} strokeWidth={3} /> {t('Novo Setor')}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto bg-red-50 border-2 border-black text-black p-4 mb-6 rounded-lg flex items-start gap-3">
          <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block mb-0.5">Erro detectado</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="max-w-7xl mx-auto bg-slate-50 border-2 border-black text-black p-4 mb-6 rounded-lg flex items-start gap-3">
          <Check className="text-black shrink-0 mt-0.5" size={18} strokeWidth={3} />
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block mb-0.5">Operação Concluída</span>
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto mb-8 flex border-b-2 border-black">
        <button
          onClick={() => { setActiveTab('users'); setError(null); }}
          className={`px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all border-t-2 border-x-2 -mb-[2px] rounded-t-lg ${
            activeTab === 'users' 
              ? 'bg-white border-black text-black border-b-white' 
              : 'bg-slate-50 border-transparent text-slate-500 hover:text-black border-b-black'
          }`}
        >
          <Users size={14} />
          {t('Usuários')}
        </button>
        <button
          onClick={() => { setActiveTab('cargos'); setError(null); }}
          className={`px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all border-t-2 border-x-2 -mb-[2px] rounded-t-lg ${
            activeTab === 'cargos' 
              ? 'bg-white border-black text-black border-b-white' 
              : 'bg-slate-50 border-transparent text-slate-500 hover:text-black border-b-black'
          }`}
        >
          <Briefcase size={14} />
          {t('Cargos & Roles')}
        </button>
        <button
          onClick={() => { setActiveTab('setores'); setError(null); }}
          className={`px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all border-t-2 border-x-2 -mb-[2px] rounded-t-lg ${
            activeTab === 'setores' 
              ? 'bg-white border-black text-black border-b-white' 
              : 'bg-slate-50 border-transparent text-slate-500 hover:text-black border-b-black'
          }`}
        >
          <FolderTree size={14} />
          {t('Setores')}
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB: USERS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-50 border-2 border-black rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t('Pesquisar usuários por nome ou email...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-black/15 focus:border-black rounded-lg text-sm text-black placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex w-full md:w-auto items-center gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full md:w-44 bg-white border-2 border-black/15 focus:border-black rounded-lg px-3 py-2.5 text-xs font-bold text-black focus:outline-none"
              >
                <option value="">{t('Todas as Roles')}</option>
                <option value="user">{t('Usuário')}</option>
                <option value="seller">{t('Vendedor')}</option>
                <option value="admin">{t('Administrador')}</option>
              </select>

              <select
                value={filterSetor}
                onChange={(e) => setFilterSetor(e.target.value)}
                className="w-full md:w-48 bg-white border-2 border-black/15 focus:border-black rounded-lg px-3 py-2.5 text-xs font-bold text-black focus:outline-none"
              >
                <option value="">{t('Todos os Setores')}</option>
                {setores.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/15">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Colaborador')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Email')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Role')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Setor / Cargo')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Verificado')}</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-wider">{t('Ações')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm font-semibold uppercase tracking-wider">
                        {t('Nenhum usuário localizado')}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black flex items-center space-x-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-black/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-800 border border-black/10">
                              {(u.full_name || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-black">{u.full_name || 'Sem nome'}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{u.status || 'ativo'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                            u.role === 'admin' 
                              ? 'bg-black text-white border-black' 
                              : u.role === 'seller'
                              ? 'bg-slate-100 text-black border-black/20'
                              : 'bg-white text-slate-600 border-black/10'
                          }`}>
                            {u.role === 'admin' ? t('Admin') : u.role === 'seller' ? t('Vendedor') : t('Comprador')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-bold">
                          {u.setor?.nome || u.cargo?.nome ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-black font-black">{u.cargo?.nome || '—'}</span>
                              <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">{u.setor?.nome || '—'}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal italic">{t('Sem atribuição')}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleUserVerificationDirect(u.id, u.is_verified || false)}
                            className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded border transition-colors ${
                              u.is_verified 
                                ? 'bg-black text-white border-black' 
                                : 'bg-white text-slate-400 border-slate-200 hover:border-black hover:text-black'
                            }`}
                          >
                            {u.is_verified ? t('Sim') : t('Não')}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleOpenUserDetails(u)}
                            className="bg-white hover:bg-black hover:text-white text-black font-bold px-3 py-1.5 rounded border-2 border-black text-xs uppercase tracking-widest transition-all"
                          >
                            {t('Editar')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: CARGOS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'cargos' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/15">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Cargo')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Setor')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Nível')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Permissões Atribuídas')}</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-wider">{t('Ações')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {cargos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-semibold uppercase tracking-wider">
                        {t('Nenhum cargo cadastrado')}
                      </td>
                    </tr>
                  ) : (
                    cargos.map((cargoItem) => (
                      <tr key={cargoItem.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-black">
                          {cargoItem.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-bold">
                          {cargoItem.setor?.nome || <span className="text-slate-400 font-normal italic">Sem setor</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 border border-black/15 rounded font-black">
                            Lvl {cargoItem.nivel || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {renderPermissionsList(cargoItem.permissoes)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button
                            onClick={() => handleOpenEditCargo(cargoItem)}
                            className="bg-white hover:bg-black hover:text-white text-black font-bold p-1.5 rounded border border-black transition-all inline-flex items-center"
                            title="Editar Cargo"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCargo(cargoItem.id)}
                            className="bg-white hover:bg-red-600 hover:text-white text-black font-bold p-1.5 rounded border border-black hover:border-red-600 transition-all inline-flex items-center"
                            title="Excluir Cargo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: SETORES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'setores' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/15">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Setor / Departamento')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Código ID')}</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-wider">{t('Ações')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {setores.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm font-semibold uppercase tracking-wider">
                        {t('Nenhum setor cadastrado')}
                      </td>
                    </tr>
                  ) : (
                    setores.map((setorItem) => (
                      <tr key={setorItem.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-black">
                          {setorItem.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                          {setorItem.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button
                            onClick={() => handleOpenEditSetor(setorItem)}
                            className="bg-white hover:bg-black hover:text-white text-black font-bold p-1.5 rounded border border-black transition-all inline-flex items-center"
                            title="Editar Setor"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSetor(setorItem.id)}
                            className="bg-white hover:bg-red-600 hover:text-white text-black font-bold p-1.5 rounded border border-black hover:border-red-600 transition-all inline-flex items-center"
                            title="Excluir Setor"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: USER DETAILS & PERMISSIONS */}
      {/* ---------------------------------------------------- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b-2 border-black/15 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Sliders size={18} />
                <h2 className="text-md font-black text-black uppercase tracking-wider">{t('Modificar Perfil e Nível de Acesso')}</h2>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-slate-500 hover:text-black text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Header profile info */}
              <div className="flex items-center space-x-4 border-b border-black/10 pb-4">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-black" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-black text-slate-800 border-2 border-black">
                    {(selectedUser.full_name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black text-black">{selectedUser.full_name || 'Sem nome'}</h3>
                  <p className="text-xs text-slate-500 font-bold">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System Role */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Role da Plataforma')}</label>
                  <select
                    value={selectedUser.role || 'user'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2.5 text-sm text-black font-bold focus:outline-none"
                  >
                    <option value="user">{t('Usuário Comum')}</option>
                    <option value="seller">{t('Vendedor')}</option>
                    <option value="admin">{t('Administrador Geral')}</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Status da Conta')}</label>
                  <select
                    value={selectedUser.status || 'ativo'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2.5 text-sm text-black font-bold focus:outline-none"
                  >
                    <option value="ativo">{t('Ativo')}</option>
                    <option value="inativo">{t('Inativo')}</option>
                    <option value="suspenso">{t('Suspenso')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department (Setor) */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Setor Organizacional')}</label>
                  <select
                    value={selectedUser.setor_id || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, setor_id: e.target.value || null })}
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2.5 text-sm text-black font-bold focus:outline-none"
                  >
                    <option value="">{t('Nenhum Setor')}</option>
                    {setores.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Cargo */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Cargo Atribuído')}</label>
                  <select
                    value={selectedUser.cargo_id || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, cargo_id: e.target.value || null })}
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2.5 text-sm text-black font-bold focus:outline-none"
                  >
                    <option value="">{t('Nenhum Cargo')}</option>
                    {cargos
                      .filter(c => !selectedUser.setor_id || c.setor_id === selectedUser.setor_id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.nome} (Lvl {c.nivel})</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Verified toggler */}
              <div className="flex items-center justify-between p-4 border-2 border-black rounded-xl bg-slate-50">
                <div>
                  <span className="text-sm font-black uppercase tracking-tight text-black">{t('Selo de Verificação Oficial')}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('Destacar este usuário como verificado e confiável.')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser({ ...selectedUser, is_verified: !selectedUser.is_verified })}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors border border-black/20 ${selectedUser.is_verified ? 'bg-black' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${selectedUser.is_verified ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Effective permissions view */}
              {selectedUser.cargo_id && (
                <div className="border border-black/10 p-4 rounded-xl space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">{t('Permissões Efetivas do Cargo')}</span>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    {(() => {
                      const selectedCargo = cargos.find(c => c.id === selectedUser.cargo_id);
                      if (!selectedCargo) return <span className="text-xs text-slate-400">{t('Nenhuma permissão associada')}</span>;
                      
                      let perms: string[] = [];
                      try {
                        if (typeof selectedCargo.permissoes === 'string') {
                          perms = JSON.parse(selectedCargo.permissoes);
                        } else if (Array.isArray(selectedCargo.permissoes)) {
                          perms = selectedCargo.permissoes;
                        }
                      } catch (e) {}

                      if (perms.length === 0) return <span className="text-xs text-slate-400">{t('Nenhuma permissão associada')}</span>;

                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map(p => {
                            const desc = PREDEFINED_PERMISSIONS.find(pm => pm.id === p);
                            return (
                              <div key={p} className="flex items-start gap-2">
                                <CheckSquare size={14} className="text-black shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-black block">{desc?.label || p}</span>
                                  <span className="text-[10px] text-slate-500 block font-medium leading-tight">{desc?.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Warehouse permissions (Logistix integration) */}
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">{t('Vincular Acesso a Armazéns (Logistix WMS)')}</span>
                <div className="grid grid-cols-2 gap-2 border-2 border-black rounded-xl p-4 bg-slate-50 max-h-40 overflow-y-auto">
                  {armazens.map(a => {
                    const isChecked = userArmazens.some(ua => ua.armazem_id === a.id);
                    return (
                      <label key={a.id} className="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-100 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleWarehouseToggle(a.id)}
                          className="h-4 w-4 rounded border-black border-2 text-black focus:ring-black"
                        />
                        <span className="text-xs font-bold text-black">{a.nome}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t-2 border-black/15 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-white hover:bg-slate-100 text-black font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-black/20"
              >
                {t('Cancelar')}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveUserDetails}
                className="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-black disabled:opacity-50"
              >
                {submitting ? t('Salvando...') : t('Gravar Alterações')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CARGO CREATE/EDIT */}
      {/* ---------------------------------------------------- */}
      {showCargoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b-2 border-black/15 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-black text-black uppercase tracking-wider">{editingCargo ? t('Editar Cargo') : t('Cadastrar Novo Cargo')}</h2>
              <button 
                onClick={() => setShowCargoModal(false)} 
                className="text-slate-500 hover:text-black text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Nome do Cargo')}</label>
                <input
                  type="text"
                  value={cargoForm.nome}
                  onChange={(e) => setCargoForm({ ...cargoForm, nome: e.target.value })}
                  placeholder="Ex: Supervisor de Logística"
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-sm text-black focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Nível Hierárquico')}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={cargoForm.nivel}
                    onChange={(e) => setCargoForm({ ...cargoForm, nivel: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-sm text-black focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Setor Vinculado')}</label>
                  <select
                    value={cargoForm.setor_id}
                    onChange={(e) => setCargoForm({ ...cargoForm, setor_id: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-sm text-black font-bold focus:outline-none"
                  >
                    <option value="">Selecione um Setor...</option>
                    {setores.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions selector list */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">{t('Atribuição de Permissões')}</label>
                <div className="border-2 border-black rounded-xl p-3 bg-slate-50 divide-y divide-black/10 max-h-60 overflow-y-auto">
                  {PREDEFINED_PERMISSIONS.map(p => {
                    const isChecked = cargoForm.permissoes.includes(p.id);
                    return (
                      <div key={p.id} className="py-2.5 flex items-start gap-3 first:pt-0 last:pb-0">
                        <input 
                          type="checkbox" 
                          id={`perm-chk-${p.id}`}
                          checked={isChecked}
                          onChange={() => handleCargoPermissionToggle(p.id)}
                          className="h-4 w-4 rounded border-black border-2 text-black focus:ring-black mt-0.5"
                        />
                        <label htmlFor={`perm-chk-${p.id}`} className="cursor-pointer">
                          <span className="text-xs font-black block text-black">{p.label}</span>
                          <span className="text-[10px] text-slate-500 block font-medium leading-tight mt-0.5">{p.desc}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t-2 border-black/15 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCargoModal(false)}
                className="bg-white hover:bg-slate-100 text-black font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-black/20"
              >
                {t('Cancelar')}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveCargo}
                className="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-black disabled:opacity-50"
              >
                {submitting ? t('Processando...') : t('Salvar Cargo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: SETOR CREATE/EDIT */}
      {/* ---------------------------------------------------- */}
      {showSetorModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b-2 border-black/15 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-black text-black uppercase tracking-wider">{editingSetor ? t('Editar Setor') : t('Cadastrar Setor')}</h2>
              <button 
                onClick={() => setShowSetorModal(false)} 
                className="text-slate-500 hover:text-black text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Nome do Setor / Departamento')}</label>
                <input
                  type="text"
                  value={setorForm.nome}
                  onChange={(e) => setSetorForm({ nome: e.target.value })}
                  placeholder="Ex: Recursos Humanos"
                  className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-lg text-sm text-black focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t-2 border-black/15 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSetorModal(false)}
                className="bg-white hover:bg-slate-100 text-black font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-black/20"
              >
                {t('Cancelar')}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveSetor}
                className="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-black disabled:opacity-50"
              >
                {submitting ? t('Processando...') : t('Salvar Setor')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}