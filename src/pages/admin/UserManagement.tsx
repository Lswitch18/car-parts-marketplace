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
  Sliders,
  Mail,
  UserPlus,
  Zap,
  Send
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

  // Sidebar Forms State
  const [newUserForm, setNewUserForm] = useState({
    nome: '',
    email: '',
    role: 'user',
    cargo_id: '',
    setor_id: ''
  });

  const [quickPermForm, setQuickPermForm] = useState({
    userId: '',
    cargoId: ''
  });

  const [emailConfirmUserId, setEmailConfirmUserId] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // User Parts Modal States
  const [selectedUserParts, setSelectedUserParts] = useState<any[] | null>(null);
  const [selectedUserPartsOwner, setSelectedUserPartsOwner] = useState<string>('');

  // Selection / Modal States
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userArmazens, setUserArmazens] = useState<any[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

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

      // Fetch users, sectors, cargos, armazens, and parts in parallel using adminApi and supabase
      const [usersData, setoresData, cargosData, armazensData, partsResult] = await Promise.all([
        adminApi.usuarios.list(),
        adminApi.setores.list().catch(() => []),
        adminApi.cargos.list().catch(() => []),
        adminApi.armazens.list().catch(() => []),
        supabase.from('parts').select('id, seller_id, title, price, images, status').then(
          res => res,
          () => ({ data: [], error: null })
        )
      ]);

      const partsData = partsResult && 'data' in partsResult ? partsResult.data || [] : [];

      const rawUsers = Array.isArray(usersData) ? usersData : (usersData && Array.isArray((usersData as any).rows) ? (usersData as any).rows : []);
      const finalUsers = rawUsers.map((u: any) => {
        const userParts = partsData.filter((p: any) => p.seller_id === u.id);
        return {
          ...u,
          parts: userParts,
          partsCount: userParts.length
        };
      });

      const finalSetores = Array.isArray(setoresData) ? setoresData : (setoresData && Array.isArray((setoresData as any).rows) ? (setoresData as any).rows : []);
      const finalCargos = Array.isArray(cargosData) ? cargosData : (cargosData && Array.isArray((cargosData as any).rows) ? (cargosData as any).rows : []);
      const finalArmazens = Array.isArray(armazensData) ? armazensData : (armazensData && Array.isArray((armazensData as any).rows) ? (armazensData as any).rows : []);

      setUsers(finalUsers);
      setFilteredUsers(finalUsers);
      setSetores(finalSetores);
      setCargos(finalCargos);
      setArmazens(finalArmazens);
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
  // SIDEBAR: QUICK ACTIONS
  // ----------------------------------------------------
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.nome.trim() || !newUserForm.email.trim()) {
      setError('Nome e Email são obrigatórios para registrar.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Centralized sector alignment: if cargo is chosen, align with cargo's sector
      let finalSectorId = newUserForm.setor_id;
      if (newUserForm.cargo_id) {
        const selectedCargo = cargos.find(c => c.id === newUserForm.cargo_id);
        if (selectedCargo && selectedCargo.setor_id) {
          finalSectorId = selectedCargo.setor_id;
        }
      }

      // Call the Edge Function via adminApi.usuarios.create
      await adminApi.usuarios.create({
        criar_usuario: true,
        nome: newUserForm.nome,
        email: newUserForm.email,
        role: newUserForm.role,
        cargo_id: newUserForm.cargo_id || null,
        setor_id: finalSectorId || null
      });

      showFlashSuccess(`Colaborador ${newUserForm.nome} adicionado e registrado com sucesso.`);
      setNewUserForm({
        nome: '',
        email: '',
        role: 'user',
        cargo_id: '',
        setor_id: ''
      });
      await loadAllData();
    } catch (err: any) {
      setError('Falha ao adicionar usuário: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPermSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPermForm.userId || !quickPermForm.cargoId) {
      setError('Selecione o usuário e o cargo.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const targetCargo = cargos.find(c => c.id === quickPermForm.cargoId);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cargo_id: quickPermForm.cargoId,
          setor_id: targetCargo?.setor_id || null
        })
        .eq('id', quickPermForm.userId);

      if (updateError) throw updateError;

      showFlashSuccess('Cargo e permissões atribuídos com sucesso.');
      setQuickPermForm({ userId: '', cargoId: '' });
      await loadAllData();
    } catch (err: any) {
      setError('Erro ao atribuir permissão rápida: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendConfirmationEmail = async () => {
    if (!emailConfirmUserId) {
      setError('Selecione um usuário para enviar o e-mail.');
      return;
    }

    const selected = users.find(u => u.id === emailConfirmUserId);
    if (!selected) return;

    try {
      setSendingEmail(true);
      setError(null);

      // Trigger the real confirmation/invite email dispatch
      await adminApi.usuarios.enviarConvite(selected.email);

      showFlashSuccess(`E-mail de confirmação operacional enviado com sucesso para ${selected.email}!`);
      setEmailConfirmUserId('');
    } catch (err: any) {
      setError('Erro ao enviar e-mail: ' + err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  // ----------------------------------------------------
  // USER ACTIONS (MODAL)
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

      // Centralized sector alignment: if cargo is chosen, align with cargo's sector
      let finalSectorId = selectedUser.setor_id;
      if (selectedUser.cargo_id) {
        const selectedCargo = cargos.find(c => c.id === selectedUser.cargo_id);
        if (selectedCargo && selectedCargo.setor_id) {
          finalSectorId = selectedCargo.setor_id;
        }
      }

      // Update basic fields
      await adminApi.usuarios.update(selectedUser.id, {
        nome: selectedUser.full_name,
        email: selectedUser.email,
        cargo_id: selectedUser.cargo_id || null,
        setor_id: finalSectorId || null,
        telefone: selectedUser.phone || '',
        status: selectedUser.status || 'ativo',
        armazens: userArmazens.map(ua => ({ id: ua.armazem_id, acesso_admin: true }))
      });

      // Update role & verification and rich profile fields via supabase directly
      await supabase
        .from('profiles')
        .update({
          full_name: selectedUser.full_name,
          role: selectedUser.role,
          is_verified: selectedUser.is_verified,
          phone: selectedUser.phone || '',
          address: selectedUser.address || '',
          cep: selectedUser.cep || '',
          birthdate: selectedUser.birthdate || null,
          card_brand: selectedUser.card_brand || null,
          payment_method: selectedUser.payment_method || null,
          email_verified: selectedUser.email_verified || false,
          setor_id: finalSectorId || null
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

  const handleDeleteUser = async (userId: string) => {
    try {
      setSubmitting(true);
      setError(null);

      const { error: err } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (err) throw err;

      showFlashSuccess('Usuário excluído com sucesso.');
      setDeletingUser(null);
      setDeleteConfirmationText('');
      await loadAllData();
    } catch (err: any) {
      setError('Falha ao excluir usuário: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlockUser = async (userId: string, currentStatus: string) => {
    const isBlocked = currentStatus === 'blocked';
    const newStatus = isBlocked ? 'ativo' : 'blocked';

    if (!window.confirm(`Deseja realmente ${isBlocked ? 'desbloquear' : 'bloquear'} este usuário?`)) return;

    try {
      setSubmitting(true);
      setError(null);

      const { error: err } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (err) throw err;

      showFlashSuccess(`Usuário ${isBlocked ? 'desbloqueado' : 'bloqueado'} com sucesso.`);
      await loadAllData();
    } catch (err: any) {
      setError('Falha ao alterar status do usuário: ' + err.message);
    } finally {
      setSubmitting(false);
    }
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
    
    let parsedPerms: any = [];
    try {
      if (typeof cargoItem.permissoes === 'string') {
        parsedPerms = JSON.parse(cargoItem.permissoes);
      } else {
        parsedPerms = cargoItem.permissoes;
      }
    } catch (e) {
      console.warn("Failed to parse permissions", e);
    }
    if (!Array.isArray(parsedPerms)) {
      parsedPerms = [];
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
    let list: any = [];
    try {
      if (typeof permissionsObj === 'string') {
        list = JSON.parse(permissionsObj);
      } else {
        list = permissionsObj;
      }
    } catch (e) {}

    if (!Array.isArray(list)) {
      list = [];
    }

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
          {activeTab === 'users' && (
            <button 
              onClick={() => setShowCreateUserModal(true)}
              className="bg-black hover:bg-neutral-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all border-2 border-black flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} strokeWidth={3} /> {t('Novo Usuário')}
            </button>
          )}
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
        <div className="max-w-7xl mx-auto bg-red-50 border-2 border-black text-black p-4 mb-6 rounded-lg flex items-start gap-3 animate-in fade-in duration-200">
          <ShieldAlert className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block mb-0.5">Erro detectado</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="max-w-7xl mx-auto bg-slate-50 border-2 border-black text-black p-4 mb-6 rounded-lg flex items-start gap-3 animate-in fade-in duration-200">
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
      {/* TAB: USERS WITH ACTION SIDEBAR */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main User List Section */}
          <div className="lg:col-span-9 space-y-6">
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
                      <th className="px-6 py-4 text-left text-xs font-black text-black uppercase tracking-wider">{t('Anúncios')}</th>
                      <th className="px-6 py-4 text-right text-xs font-black text-black uppercase tracking-wider">{t('Ações')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm font-semibold uppercase tracking-wider">
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
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-880 border border-black/10">
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            {u.partsCount > 0 ? (
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-black">{u.partsCount} {u.partsCount === 1 ? t('anúncio') : t('anúncios')}</span>
                                <button 
                                  onClick={() => {
                                    setSelectedUserParts(u.parts || []);
                                    setSelectedUserPartsOwner(u.full_name || u.email);
                                  }} 
                                  className="text-daig-blue hover:underline text-[10px] text-left font-black uppercase tracking-wider mt-0.5 flex items-center gap-1"
                                >
                                  <Eye size={10} /> {t('Ver todos')}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">{t('Nenhum')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button
                              onClick={() => handleOpenUserDetails(u)}
                              className="bg-white hover:bg-black hover:text-white text-black font-bold p-1.5 rounded border border-black transition-all inline-flex items-center"
                              title={t('Editar Usuário')}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleBlockUser(u.id, u.status || 'ativo')}
                              className={`p-1.5 rounded border transition-all inline-flex items-center ${
                                u.status === 'blocked'
                                  ? 'bg-red-50 text-red-600 border-red-600 hover:bg-red-100'
                                  : 'bg-white hover:bg-neutral-800 hover:text-white text-black border-black/20 hover:border-black'
                              }`}
                              title={u.status === 'blocked' ? t('Desbloquear Usuário') : t('Bloquear Usuário')}
                            >
                              <Lock size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingUser(u);
                                setDeleteConfirmationText('');
                              }}
                              className="bg-white hover:bg-red-600 hover:text-white text-red-600 hover:border-red-600 font-bold p-1.5 rounded border border-red-600 transition-all inline-flex items-center"
                              title={t('Excluir Usuário')}
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

          {/* Quick Actions Sidebar Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Card 2: Quick Assign Permissions */}
            <div className="bg-slate-50 border-2 border-black rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-black/10 pb-3">
                <Zap size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider text-black">{t('Atribuição Rápida')}</h3>
              </div>

              <form onSubmit={handleQuickPermSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Selecionar Colaborador')}</label>
                  <select
                    value={quickPermForm.userId}
                    onChange={(e) => setQuickPermForm({ ...quickPermForm, userId: e.target.value })}
                    className="w-full bg-white border border-black/20 focus:border-black rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none"
                  >
                    <option value="">{t('Selecione...')}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Novo Cargo')}</label>
                  <select
                    value={quickPermForm.cargoId}
                    onChange={(e) => setQuickPermForm({ ...quickPermForm, cargoId: e.target.value })}
                    className="w-full bg-white border border-black/20 focus:border-black rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none"
                  >
                    <option value="">{t('Selecione...')}</option>
                    {cargos.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} (Setor: {c.setor?.nome || 'Sem'})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white hover:bg-slate-100 text-black font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition-all border-2 border-black flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Zap size={12} /> {t('Aplicar Cargo')}
                </button>
              </form>
            </div>

            {/* Card 3: Send Confirmation Email */}
            <div className="bg-slate-50 border-2 border-black rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-black/10 pb-3">
                <Mail size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider text-black">{t('E-mail de Confirmação')}</h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Selecionar Destinatário')}</label>
                  <select
                    value={emailConfirmUserId}
                    onChange={(e) => setEmailConfirmUserId(e.target.value)}
                    className="w-full bg-white border border-black/20 focus:border-black rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none"
                  >
                    <option value="">{t('Selecione...')}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={sendingEmail || !emailConfirmUserId}
                  onClick={handleSendConfirmationEmail}
                  className="w-full bg-white hover:bg-slate-100 text-black font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition-all border-2 border-black flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <div className="animate-spin w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <Send size={12} />
                  )}
                  {sendingEmail ? t('Enviando...') : t('Disparar E-mail')}
                </button>
              </div>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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

              {/* Rich User Profile Metadata */}
              <div className="border border-black/10 p-4 rounded-xl space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block border-b border-black/5 pb-1">{t('Dados Pessoais e Operacionais')}</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Nome Completo')}</label>
                    <input
                      type="text"
                      value={selectedUser.full_name || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                      className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Telefone')}</label>
                    <input
                      type="text"
                      value={selectedUser.phone || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                      className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Data de Nascimento')}</label>
                    <input
                      type="date"
                      value={selectedUser.birthdate || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, birthdate: e.target.value })}
                      className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('CEP')}</label>
                    <input
                      type="text"
                      value={selectedUser.cep || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, cep: e.target.value })}
                      className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Endereço para Entrega')}</label>
                  <input
                    type="text"
                    value={selectedUser.address || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Bandeira do Cartão')}</label>
                    <select
                      value={selectedUser.card_brand || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, card_brand: e.target.value })}
                      className="w-full bg-white border border-black/20 focus:border-black rounded-lg px-2.5 py-2 text-xs text-black font-bold focus:outline-none"
                    >
                      <option value="">{t('Selecione...')}</option>
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="jcb">JCB</option>
                      <option value="amex">American Express</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Método de Pagamento Preferido')}</label>
                    <select
                      value={selectedUser.payment_method || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, payment_method: e.target.value })}
                      className="w-full bg-white border border-black/20 focus:border-black rounded-lg px-2.5 py-2 text-xs text-black font-bold focus:outline-none"
                    >
                      <option value="">{t('Selecione...')}</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="stripe">Stripe Connect</option>
                      <option value="bank_transfer">Transferência Bancária</option>
                      <option value="cash">Dinheiro em Espécie</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-black/10 rounded-xl bg-slate-50">
                  <div>
                    <span className="text-xs font-black uppercase tracking-tight text-black">{t('E-mail Confirmado')}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t('Marcar e-mail como validado na base de dados.')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser({ ...selectedUser, email_verified: !selectedUser.email_verified })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors border border-black/20 ${selectedUser.email_verified ? 'bg-black' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${selectedUser.email_verified ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
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
                      
                      let perms: any = [];
                      try {
                        if (typeof selectedCargo.permissoes === 'string') {
                          perms = JSON.parse(selectedCargo.permissoes);
                        } else {
                          perms = selectedCargo.permissoes;
                        }
                      } catch (e) {}

                      if (!Array.isArray(perms)) {
                        perms = [];
                      }

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
                                  <span className="text-[10px] text-slate-500 block font-medium leading-tight mt-0.5">{desc?.desc}</span>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
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

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE USER */}
      {/* ---------------------------------------------------- */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-2 border-black rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-black/15 flex justify-between items-center bg-slate-50">
              <h2 className="text-md font-black text-black uppercase tracking-wider">{t('Cadastrar Novo Usuário')}</h2>
              <button 
                onClick={() => setShowCreateUserModal(false)} 
                className="text-slate-500 hover:text-black text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleAddUserSubmit(e);
              setShowCreateUserModal(false);
            }} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Nome Completo')}</label>
                <input
                  type="text"
                  required
                  value={newUserForm.nome}
                  onChange={(e) => setNewUserForm({ ...newUserForm, nome: e.target.value })}
                  placeholder="Ex: Roberto Carlos"
                  className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-lg text-sm text-black focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('E-mail')}</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="Ex: roberto@empresa.com"
                  className="w-full px-3 py-2.5 bg-white border-2 border-black rounded-lg text-sm text-black focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Role')}</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2.5 text-sm text-black font-bold focus:outline-none"
                  >
                    <option value="user">Comprador</option>
                    <option value="seller">Vendedor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Setor')}</label>
                  <select
                    value={newUserForm.setor_id}
                    onChange={(e) => setNewUserForm({ ...newUserForm, setor_id: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-lg px-3 py-2.5 text-sm text-black font-bold focus:outline-none"
                  >
                    <option value="">{t('Nenhum')}</option>
                    {setores.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Cargo')}</label>
                <select
                  value={newUserForm.cargo_id}
                  onChange={(e) => setNewUserForm({ ...newUserForm, cargo_id: e.target.value })}
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-2.5 text-sm text-black font-bold focus:outline-none"
                >
                  <option value="">{t('Nenhum')}</option>
                  {cargos
                    .filter(c => !newUserForm.setor_id || c.setor_id === newUserForm.setor_id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 -mx-6 -mb-6 border-t-2 border-black/15 flex justify-end gap-3 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="bg-white hover:bg-slate-100 text-black font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-black/20"
                >
                  {t('Cancelar')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-black disabled:opacity-50"
                >
                  {submitting ? t('Processando...') : t('Adicionar Usuário')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: DELETE USER CONFIRMATION (SUPABASE STYLE) */}
      {/* ---------------------------------------------------- */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-2 border-red-600 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b-2 border-red-600/15 flex justify-between items-center bg-red-50">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert size={20} />
                <h2 className="text-md font-black uppercase tracking-wider">{t('Excluir Conta Permanentemente')}</h2>
              </div>
              <button 
                onClick={() => {
                  setDeletingUser(null);
                  setDeleteConfirmationText('');
                }} 
                className="text-red-600 hover:text-black text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                Esta ação é <span className="font-bold text-red-600 uppercase">definitiva</span> e não pode ser desfeita.
                O usuário <strong className="font-bold text-black">{deletingUser.full_name || 'Sem Nome'}</strong> (<span className="font-mono text-xs">{deletingUser.email}</span>) será excluído permanentemente da plataforma, perdendo todos os acessos imediatos.
              </p>

              <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">{t('Atenção')}</span>
                <p className="text-xs text-red-600 leading-normal font-bold">
                  Todos os dados de perfil, preferências e vinculações associados a este usuário serão removidos.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Para confirmar, digite <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-black font-bold">{deletingUser.email}</span> no campo abaixo:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={deletingUser.email}
                  className="w-full px-3 py-2.5 bg-white border-2 border-red-200 focus:border-red-600 rounded-lg text-sm text-black focus:outline-none font-bold placeholder-slate-300"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-black/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeletingUser(null);
                  setDeleteConfirmationText('');
                }}
                className="bg-white hover:bg-slate-100 text-black font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-black/20"
              >
                {t('Cancelar')}
              </button>
              <button
                type="button"
                disabled={submitting || deleteConfirmationText !== deletingUser.email}
                onClick={() => handleDeleteUser(deletingUser.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-red-600 disabled:opacity-30 flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={12} /> {submitting ? t('Excluindo...') : t('Excluir Usuário')}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUserParts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-black rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-black/10 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-black font-black text-lg">
                  {t('Anúncios de')} {selectedUserPartsOwner}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  {selectedUserParts.length} {selectedUserParts.length === 1 ? t('anúncio encontrado') : t('anúncios encontrados')}
                </p>
              </div>
              <button 
                onClick={() => { setSelectedUserParts(null); setSelectedUserPartsOwner(''); }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto divide-y divide-black/10 flex-1">
              {selectedUserParts.length === 0 ? (
                <p className="text-center text-slate-400 py-8 italic">{t('Nenhum anúncio cadastrado por este usuário.')}</p>
              ) : (
                selectedUserParts.map((part: any) => (
                  <div key={part.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-black/10">
                        {part.images?.[0] ? (
                          <img src={part.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold bg-slate-50">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-black font-black text-sm truncate">{part.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                            part.status === 'active' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : part.status === 'sold'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {part.status}
                          </span>
                          <span className="text-daig-blue font-bold text-xs">
                            ¥ {part.price?.toLocaleString('ja-JP')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <a 
                      href={`/product/${part.id}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-white hover:bg-slate-50 text-black border border-black/20 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <Eye size={12} /> {t('Ver anúncio')}
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-black/10 flex justify-end">
              <button
                type="button"
                onClick={() => { setSelectedUserParts(null); setSelectedUserPartsOwner(''); }}
                className="bg-black text-white hover:bg-slate-800 font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest transition-colors"
              >
                {t('Fechar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}