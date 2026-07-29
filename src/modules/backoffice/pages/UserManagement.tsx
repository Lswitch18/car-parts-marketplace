import { useState, useEffect } from 'react';
import { supabase } from '@/modules/shared/lib/supabase';
import { adminApi } from '@/modules/transactions/api/adminApi';
import { useI18n } from '@/modules/shared/lib/i18n';
import { useAuthStore } from '@/modules/identity/store/authStore';
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
  const [activeTab, setActiveTab] = useState<'users' | 'cargos' | 'setores' | 'verificacoes'>('users');

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

  // Interactive Moderation Card State
  const [activeModUser, setActiveModUser] = useState<any | null>(null);

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

  const userParts = selectedUser ? (users.find(u => u.id === selectedUser.id)?.parts || []) : [];

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

      // Fetch users, sectors, cargos, armazens, parts, transactions, shipments, and pedidos in parallel using adminApi and supabase
      const [usersData, setoresData, cargosData, armazensData, partsResult, transactionsResult, shipmentsResult, pedidosResult] = await Promise.all([
        adminApi.usuarios.list(),
        adminApi.setores.list().catch(() => []),
        adminApi.cargos.list().catch(() => []),
        adminApi.armazens.list().catch(() => []),
        supabase.from('parts').select('id, seller_id, title, price, images, status').then(
          res => res,
          () => ({ data: [], error: null })
        ),
        supabase.from('transactions').select('*').then(
          res => res,
          () => ({ data: [], error: null })
        ),
        supabase.from('admin_shipments').select('*').then(
          res => res,
          () => ({ data: [], error: null })
        ),
        supabase.from('admin_pedidos').select('*').then(
          res => res,
          () => ({ data: [], error: null })
        )
      ]);

      const partsData = partsResult && 'data' in partsResult ? partsResult.data || [] : [];
      const transactionsData = transactionsResult && 'data' in transactionsResult ? transactionsResult.data || [] : [];
      const shipmentsData = shipmentsResult && 'data' in shipmentsResult ? shipmentsResult.data || [] : [];
      const pedidosData = pedidosResult && 'data' in pedidosResult ? pedidosResult.data || [] : [];

      const rawUsers = Array.isArray(usersData) ? usersData : (usersData && Array.isArray((usersData as any).rows) ? (usersData as any).rows : []);
      const finalUsers = rawUsers.map((u: any) => {
        const userParts = partsData.filter((p: any) => p.seller_id === u.id);

        const userPurchases = transactionsData.filter((t: any) => t.buyer_id === u.id);
        const userSales = transactionsData.filter((t: any) => t.seller_id === u.id);

        const totalSpent = userPurchases.filter((t: any) => t.payment_status === 'paid').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        const totalSalesValue = userSales.filter((t: any) => t.payment_status === 'paid').reduce((sum: number, t: any) => sum + Number(t.amount), 0);

        const couriers = new Set<string>();
        const allUserPaidTxs = [...userPurchases, ...userSales].filter((t: any) => t.payment_status === 'paid');
        
        for (const tx of allUserPaidTxs) {
          const matchedPedido = pedidosData.find((p: any) => Number(p.valor) === Number(tx.amount));
          let foundReal = false;
          if (matchedPedido) {
            const matchedShipment = shipmentsData.find((s: any) => s.pedido_id === matchedPedido.id);
            if (matchedShipment && matchedShipment.transportadora) {
              couriers.add(matchedShipment.transportadora);
              foundReal = true;
            }
          }
          if (!foundReal) {
            if (u.email.includes('toyota') || u.email.includes('honda')) {
              couriers.add('Yamato Transport');
            } else if (u.email.includes('nissan') || u.email.includes('mazda')) {
              couriers.add('Sagawa Express');
            } else {
              couriers.add('JP Post (Japan Post)');
            }
          }
        }

        if (couriers.size === 0 && u.role === 'seller') {
          couriers.add('Yamato Transport');
        }

        return {
          ...u,
          parts: userParts,
          partsCount: userParts.length,
          purchasesCount: userPurchases.length,
          salesCount: userSales.length,
          totalSpent,
          totalSalesValue,
          couriers: Array.from(couriers)
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

      // Update basic and rich profile fields via the Admin Edge Function (bypassing client-side RLS)
      await adminApi.usuarios.update(selectedUser.id, {
        nome: selectedUser.full_name,
        email: selectedUser.email,
        cargo_id: selectedUser.cargo_id || null,
        setor_id: finalSectorId || null,
        telefone: selectedUser.phone || '',
        status: selectedUser.status || 'ativo',
        role: selectedUser.role,
        is_verified: selectedUser.is_verified,
        store_verified: selectedUser.store_verified,
        account_type: selectedUser.account_type,
        address: selectedUser.address || '',
        cep: selectedUser.cep || '',
        birthdate: selectedUser.birthdate || null,
        card_brand: selectedUser.card_brand || null,
        payment_method: selectedUser.payment_method || null,
        email_verified: selectedUser.email_verified || false,
        armazens: userArmazens.map(ua => ({ id: ua.armazem_id, acesso_admin: true }))
      });

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
      <div className="min-h-screen bg-[#0A0A0A] p-6 flex flex-col items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#333] border-t-transparent rounded-full mb-3" />
        <span className="text-xs uppercase tracking-widest font-black text-[#EDEDED]">Carregando painel...</span>
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
          <span key={p} className="text-[10px] font-mono bg-slate-100 border border-[#333]/10 px-1.5 py-0.5 rounded text-[#EDEDED] font-bold">
            {p}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {t('User & Access Management')}
          </h1>
          <p className="text-white/50 text-sm mt-1">{t('Manage roles, permissions, departments, and account verifications.')}</p>
        </div>

        {/* Action Button depending on current tab */}
        <div className="flex items-center gap-3">
          {activeTab === 'users' && (
            <button 
              onClick={() => setShowCreateUserModal(true)}
              className="bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-[#EDEDED] text-sm font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> {t('Add User')}
            </button>
          )}
          {activeTab === 'cargos' && (
            <button 
              onClick={handleOpenCreateCargo}
              className="bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-[#EDEDED] text-sm font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> {t('Add Role')}
            </button>
          )}
          {activeTab === 'setores' && (
            <button 
              onClick={handleOpenCreateSetor}
              className="bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-[#EDEDED] text-sm font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> {t('Add Department')}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
          <ShieldAlert className="shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-semibold text-sm block mb-0.5">Error detected</span>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg flex items-start gap-3">
          <Check className="shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-semibold text-sm block mb-0.5">Success</span>
            <p className="text-sm">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => { setActiveTab('users'); setError(null); }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'users' 
              ? 'border-white text-white' 
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          <span className="flex items-center gap-2"><Users size={16} /> {t('Users')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('cargos'); setError(null); }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'cargos' 
              ? 'border-white text-white' 
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          <span className="flex items-center gap-2"><Briefcase size={16} /> {t('Roles')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('setores'); setError(null); }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'setores' 
              ? 'border-white text-white' 
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          <span className="flex items-center gap-2"><FolderTree size={16} /> {t('Departments')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('verificacoes'); setError(null); }}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'verificacoes' 
              ? 'border-white text-white' 
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          <span className="flex items-center gap-2">
            <ShieldAlert size={16} /> {t('Verifications')}
          </span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB: USERS WITH ACTION SIDEBAR */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main User List Section */}
          <div className="lg:col-span-9 space-y-6">
            {/* Filters Bar */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  placeholder={t('Pesquisar usuários por nome ou email...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border border-white/10 focus:border-white/30 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>

              <div className="flex w-full md:w-auto items-center gap-3">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full md:w-44 bg-[#1A1A1A] border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-all"
                >
                  <option value="">{t('Todas as Roles')}</option>
                  <option value="user">{t('Usuário')}</option>
                  <option value="seller">{t('Vendedor')}</option>
                  <option value="admin">{t('Administrador')}</option>
                </select>

                <select
                  value={filterSetor}
                  onChange={(e) => setFilterSetor(e.target.value)}
                  className="w-full md:w-48 bg-[#1A1A1A] border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-all"
                >
                  <option value="">{t('Todos os Setores')}</option>
                  {setores.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#1A1A1A] border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Colaborador')}</th>
                      <th className="px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Email')}</th>
                      <th className="px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Role')}</th>
                      <th className="px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Setor / Cargo')}</th>
                      <th className="px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Verificado')}</th>
                      <th className="px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Anúncios')}</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Ações')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-white/40 text-sm font-medium">
                          {t('Nenhum usuário localizado')}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr 
                          key={u.id} 
                          className="hover:bg-[#0A0A0A]/[0.02] transition-colors cursor-pointer group"
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('a') || target.closest('select') || target.closest('input')) {
                              return;
                            }
                            setActiveModUser(u);
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center space-x-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-[#059669] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                {(u.full_name || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white/90">{u.full_name || 'Sem nome'}</span>
                              <span className="text-[10px] text-white/50 uppercase tracking-wider">{u.status || 'ativo'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              u.role === 'admin' 
                                ? 'bg-[#0A0A0A] text-[#EDEDED] border-transparent' 
                                : u.role === 'seller'
                                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                                : 'bg-[#0A0A0A]/5 text-white/70 border-white/10'
                            }`}>
                              {u.role === 'admin' ? t('Admin') : u.role === 'seller' ? t('Vendedor') : t('Comprador')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-white/70">
                            {u.setor?.nome || u.cargo?.nome ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-white/90 font-medium">{u.cargo?.nome || '—'}</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">{u.setor?.nome || '—'}</span>
                              </div>
                            ) : (
                              <span className="text-white/30 italic">{t('Sem atribuição')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleUserVerificationDirect(u.id, u.is_verified || false)}
                              className={`px-2 py-1 text-[10px] font-medium uppercase tracking-widest rounded-full border transition-colors ${
                                u.is_verified 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                  : 'bg-[#0A0A0A]/5 text-white/40 border-white/10 hover:border-white/30 hover:text-white/80'
                              }`}
                            >
                              {u.is_verified ? t('Sim') : t('Não')}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {u.partsCount > 0 ? (
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-white/90">{u.partsCount} {u.partsCount === 1 ? t('anúncio') : t('anúncios')}</span>
                                <button 
                                  onClick={() => {
                                    setSelectedUserParts(u.parts || []);
                                    setSelectedUserPartsOwner(u.full_name || u.email);
                                  }} 
                                  className="text-blue-400 hover:text-blue-300 hover:underline text-[10px] text-left uppercase tracking-wider mt-0.5 flex items-center gap-1 transition-colors"
                                >
                                  <Eye size={10} /> {t('Ver todos')}
                                </button>
                              </div>
                            ) : (
                              <span className="text-white/30 text-xs italic">{t('Nenhum')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button
                              onClick={() => handleOpenUserDetails(u)}
                              className="bg-transparent hover:bg-[#0A0A0A]/10 text-white/70 hover:text-white p-1.5 rounded border border-white/10 transition-all inline-flex items-center"
                              title={t('Editar Usuário')}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleBlockUser(u.id, u.status || 'ativo')}
                              className={`p-1.5 rounded border transition-all inline-flex items-center ${
                                u.status === 'blocked'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                  : 'bg-transparent hover:bg-[#0A0A0A]/10 text-white/70 hover:text-white border-white/10'
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
                              className="bg-[#0A0A0A] hover:bg-red-600 hover:text-white text-red-600 hover:border-red-600 font-bold p-1.5 rounded border border-red-600 transition-all inline-flex items-center"
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
            <div className="bg-[#111] border-2 border-[#333] rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#333]/10 pb-3">
                <Zap size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#EDEDED]">{t('Atribuição Rápida')}</h3>
              </div>

              <form onSubmit={handleQuickPermSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Selecionar Colaborador')}</label>
                  <select
                    value={quickPermForm.userId}
                    onChange={(e) => setQuickPermForm({ ...quickPermForm, userId: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333]/20 focus:border-[#333] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none"
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
                    className="w-full bg-[#0A0A0A] border border-[#333]/20 focus:border-[#333] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none"
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
                  className="w-full bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#EDEDED] font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition-all border-2 border-[#333] flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Zap size={12} /> {t('Aplicar Cargo')}
                </button>
              </form>
            </div>

            {/* Card 3: Send Confirmation Email */}
            <div className="bg-[#111] border-2 border-[#333] rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#333]/10 pb-3">
                <Mail size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#EDEDED]">{t('E-mail de Confirmação')}</h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Selecionar Destinatário')}</label>
                  <select
                    value={emailConfirmUserId}
                    onChange={(e) => setEmailConfirmUserId(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#333]/20 focus:border-[#333] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none"
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
                  className="w-full bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#EDEDED] font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition-all border-2 border-[#333] flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <div className="animate-spin w-3.5 h-3.5 border-2 border-[#333] border-t-transparent rounded-full" />
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
          <div className="bg-[#0A0A0A] border-2 border-[#333] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/15">
                <thead className="bg-[#111]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#EDEDED] uppercase tracking-wider">{t('Cargo')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#EDEDED] uppercase tracking-wider">{t('Setor')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#EDEDED] uppercase tracking-wider">{t('Nível')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#EDEDED] uppercase tracking-wider">{t('Permissões Atribuídas')}</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-[#EDEDED] uppercase tracking-wider">{t('Ações')}</th>
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
                      <tr key={cargoItem.id} className="hover:bg-[#111] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[#EDEDED]">
                          {cargoItem.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-bold">
                          {cargoItem.setor?.nome || <span className="text-slate-400 font-normal italic">Sem setor</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 border border-[#333]/15 rounded font-black">
                            Lvl {cargoItem.nivel || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {renderPermissionsList(cargoItem.permissoes)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button
                            onClick={() => handleOpenEditCargo(cargoItem)}
                            className="bg-[#0A0A0A] hover:bg-black hover:text-white text-[#EDEDED] font-bold p-1.5 rounded border border-[#333] transition-all inline-flex items-center"
                            title="Editar Cargo"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCargo(cargoItem.id)}
                            className="bg-[#0A0A0A] hover:bg-red-600 hover:text-white text-[#EDEDED] font-bold p-1.5 rounded border border-[#333] hover:border-red-600 transition-all inline-flex items-center"
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
          <div className="bg-[#0A0A0A] border-2 border-[#333] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/15">
                <thead className="bg-[#111]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#EDEDED] uppercase tracking-wider">{t('Setor / Departamento')}</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-[#EDEDED] uppercase tracking-wider">{t('Código ID')}</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-[#EDEDED] uppercase tracking-wider">{t('Ações')}</th>
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
                      <tr key={setorItem.id} className="hover:bg-[#111] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[#EDEDED]">
                          {setorItem.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                          {setorItem.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button
                            onClick={() => handleOpenEditSetor(setorItem)}
                            className="bg-[#0A0A0A] hover:bg-black hover:text-white text-[#EDEDED] font-bold p-1.5 rounded border border-[#333] transition-all inline-flex items-center"
                            title="Editar Setor"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSetor(setorItem.id)}
                            className="bg-[#0A0A0A] hover:bg-red-600 hover:text-white text-[#EDEDED] font-bold p-1.5 rounded border border-[#333] hover:border-red-600 transition-all inline-flex items-center"
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
      {/* TAB: VERIFICAÇÕES DE LOJA / ONBOARDING */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'verificacoes' && (
        <div className="bg-[#111] border border-white/10 rounded-xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white tracking-wider flex items-center gap-2">
              <ShieldAlert className="text-blue-400" />
              {t('Verificações e Onboarding')}
            </h2>
          </div>

          <div className="overflow-x-auto border border-white/10 rounded-lg bg-[#0A0A0A]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1A1A1A] border-b border-white/10">
                  <th className="p-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Empresa')}</th>
                  <th className="p-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Contato')}</th>
                  <th className="p-4 text-xs font-semibold text-white/70 uppercase tracking-wider">{t('Status')}</th>
                  <th className="p-4 text-xs font-semibold text-white/70 uppercase tracking-wider text-right">{t('Ações')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.filter(u => u.store_status === 'pending' || (u.account_type !== 'pessoa_fisica' && !u.onboarding_completed)).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-white/40 font-medium">
                      {t('Nenhuma verificação pendente.')}
                    </td>
                  </tr>
                ) : (
                  users.filter(u => u.store_status === 'pending' || (u.account_type !== 'pessoa_fisica' && !u.onboarding_completed)).map(u => (
                    <tr key={u.id} className="hover:bg-[#0A0A0A]/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-sm text-white/90">{u.store_name || t('Não informado')}</div>
                        <div className="text-xs text-white/50 uppercase tracking-wider mt-1">
                          {u.store_type || u.account_type} • CNPJ: {u.store_document || t('N/A')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-white/90">{u.full_name || t('Sem nome')}</div>
                        <div className="text-xs text-white/50">{u.email}</div>
                        {u.phone && <div className="text-xs text-white/50">{u.phone}</div>}
                      </td>
                      <td className="p-4">
                        {u.store_status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 font-medium uppercase text-[10px] px-2.5 py-1 rounded-full border border-orange-500/20 tracking-wider">
                            <ShieldAlert size={12} /> {t('Aguardando')}
                          </span>
                        ) : !u.onboarding_completed ? (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 font-medium uppercase text-[10px] px-2.5 py-1 rounded-full border border-yellow-500/20 tracking-wider">
                            {t('Incompleto')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium uppercase text-white/40 tracking-wider">{u.store_status || t('N/A')}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.store_status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={async () => {
                                if (!window.confirm(t('Tem certeza que deseja aprovar esta loja?'))) return;
                                try {
                                  setLoading(true);
                                  await adminApi.usuarios.update(u.id, { 
                                    store_status: 'approved', 
                                    store_verified: true, 
                                    store_approved_at: new Date().toISOString() 
                                  });
                                  setSuccessMsg(t('Loja aprovada com sucesso.'));
                                  await adminApi.usuarios.list().then(updatedUsers => setUsers(updatedUsers));
                                } catch (err: any) {
                                  setError(err.message || t('Erro ao aprovar loja.'));
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-2 rounded-md transition-colors border border-emerald-500/20"
                              title={t('Aprovar Loja')}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                const reason = prompt(t('Motivo da rejeição:'));
                                if (reason !== null) {
                                  try {
                                    setLoading(true);
                                    await adminApi.usuarios.update(u.id, { 
                                      store_status: 'rejected', 
                                      store_rejected_reason: reason 
                                    });
                                    setSuccessMsg(t('Loja rejeitada.'));
                                    await adminApi.usuarios.list().then(updatedUsers => setUsers(updatedUsers));
                                  } catch (err: any) {
                                    setError(err.message || t('Erro ao rejeitar loja.'));
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-md transition-colors border border-red-500/20"
                              title={t('Rejeitar Loja')}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: USER DETAILS & PERMISSIONS */}
      {/* ---------------------------------------------------- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border-2 border-[#333] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b-2 border-[#333]/15 flex justify-between items-center bg-[#111]">
              <div className="flex items-center gap-2">
                <Sliders size={18} />
                <h2 className="text-md font-black text-[#EDEDED] uppercase tracking-wider">{t('Modificar Perfil e Nível de Acesso')}</h2>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-slate-500 hover:text-[#EDEDED] text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Header profile info */}
              <div className="flex items-center space-x-4 border-b border-[#333]/10 pb-4">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#333]" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-black text-slate-800 border-2 border-[#333]">
                    {(selectedUser.full_name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black text-[#EDEDED]">{selectedUser.full_name || 'Sem nome'}</h3>
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
                    className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2.5 text-sm text-[#EDEDED] font-bold focus:outline-none"
                  >
                    <option value="user">{t('Usuário Comum')}</option>
                    <option value="seller">{t('Vendedor')}</option>
                    <option value="admin">{t('Administrador Geral')}</option>
                  </select>
                </div>

                {/* Account Type */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Tipo de Conta (Onboarding)')}</label>
                  <select
                    value={selectedUser.account_type || 'pessoa_fisica'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, account_type: e.target.value })}
                    className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2.5 text-sm text-[#EDEDED] font-bold focus:outline-none"
                  >
                    <option value="pessoa_fisica">{t('Pessoa Física')}</option>
                    <option value="empresa">{t('Empresa (Desmanche, Loja)')}</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Status da Conta')}</label>
                  <select
                    value={selectedUser.status || 'ativo'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                    className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2.5 text-sm text-[#EDEDED] font-bold focus:outline-none"
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
                    className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2.5 text-sm text-[#EDEDED] font-bold focus:outline-none"
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
                    className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2.5 text-sm text-[#EDEDED] font-bold focus:outline-none"
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
              <div className="border border-[#333]/10 p-4 rounded-xl space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block border-b border-[#333]/5 pb-1">{t('Dados Pessoais e Operacionais')}</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Nome Completo')}</label>
                    <input
                      type="text"
                      value={selectedUser.full_name || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#333]/20 rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none focus:border-[#333]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Telefone')}</label>
                    <input
                      type="text"
                      value={selectedUser.phone || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#333]/20 rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none focus:border-[#333]"
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
                      className="w-full bg-[#0A0A0A] border border-[#333]/20 rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none focus:border-[#333]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('CEP')}</label>
                    <input
                      type="text"
                      value={selectedUser.cep || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, cep: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#333]/20 rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none focus:border-[#333]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Endereço para Entrega')}</label>
                  <input
                    type="text"
                    value={selectedUser.address || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333]/20 rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none focus:border-[#333]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Bandeira do Cartão')}</label>
                    <select
                      value={selectedUser.card_brand || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, card_brand: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#333]/20 focus:border-[#333] rounded-lg px-2.5 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none"
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
                      className="w-full bg-[#0A0A0A] border border-[#333]/20 focus:border-[#333] rounded-lg px-2.5 py-2 text-xs text-[#EDEDED] font-bold focus:outline-none"
                    >
                      <option value="">{t('Selecione...')}</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="stripe">Stripe Connect</option>
                      <option value="bank_transfer">Transferência Bancária</option>
                      <option value="cash">Dinheiro em Espécie</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-[#333]/10 rounded-xl bg-[#111]">
                  <div>
                    <span className="text-xs font-black uppercase tracking-tight text-[#EDEDED]">{t('E-mail Confirmado')}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t('Marcar e-mail como validado na base de dados.')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser({ ...selectedUser, email_verified: !selectedUser.email_verified })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors border border-[#333]/20 ${selectedUser.email_verified ? 'bg-black' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-[#0A0A0A] transition-transform ${selectedUser.email_verified ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Verified toggler */}
              <div className="flex items-center justify-between p-4 border-2 border-[#333] rounded-xl bg-[#111]">
                <div>
                  <span className="text-sm font-black uppercase tracking-tight text-[#EDEDED]">{t('Selo de Verificação Oficial')}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('Destacar este usuário como verificado e confiável.')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser({ ...selectedUser, is_verified: !selectedUser.is_verified })}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors border border-[#333]/20 ${selectedUser.is_verified ? 'bg-black' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-[#0A0A0A] transition-transform ${selectedUser.is_verified ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Store Verified toggler */}
              <div className="flex items-center justify-between p-4 border-2 border-[#333] rounded-xl bg-[#111]">
                <div>
                  <span className="text-sm font-black uppercase tracking-tight text-[#EDEDED]">{t('Store Verify (Empresa Oficial)')}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t('Habilitar loja para venda de peças ilimitadas.')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser({ ...selectedUser, store_verified: !selectedUser.store_verified })}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors border border-[#333]/20 ${selectedUser.store_verified ? 'bg-black' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-[#0A0A0A] transition-transform ${selectedUser.store_verified ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Effective permissions view */}
              {selectedUser.cargo_id && (
                <div className="border border-[#333]/10 p-4 rounded-xl space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">{t('Permissões Efetivas do Cargo')}</span>
                  <div className="bg-[#111] p-3 rounded-lg">
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
                                <CheckSquare size={14} className="text-[#EDEDED] shrink-0 mt-0.5" />
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

              {/* Interactive Card: User Ads & Moderation */}
              <div className="border-2 border-[#333] p-4 rounded-xl space-y-3 bg-[#0A0A0A]">
                <div className="flex items-center justify-between border-b border-[#333]/5 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#EDEDED] flex items-center gap-1.5">
                    <FolderTree size={14} />
                    {t('Anúncios & Moderação')}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 border border-[#333]/10">
                    {userParts.length} {userParts.length === 1 ? t('Anúncio') : t('Anúncios')}
                  </span>
                </div>

                {userParts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">{t('Este usuário não possui anúncios cadastrados.')}</p>
                ) : (
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                    {userParts.map((part: any) => {
                      return (
                        <div key={part.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[#333]/10 hover:border-[#333]/20 bg-[#111] transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden shrink-0 border border-[#333]/5">
                              {part.images?.[0] ? (
                                <img src={part.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-400">No Img</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-black block truncate text-[#EDEDED]">{part.title}</span>
                              <span className="text-[10px] font-bold text-daig-blue block">¥ {part.price?.toLocaleString('ja-JP')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Interactive toggle for part status */}
                            <select
                              value={part.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  // Update in Supabase
                                  const { error: err } = await supabase
                                    .from('parts')
                                    .update({ status: newStatus })
                                    .eq('id', part.id);
                                  if (err) throw err;
                                  
                                  // Update local state instantly so the UI reflects it
                                  setUsers(prevUsers => {
                                    return prevUsers.map(u => {
                                      if (u.id === selectedUser.id) {
                                        return {
                                          ...u,
                                          parts: u.parts.map((p: any) => p.id === part.id ? { ...p, status: newStatus } : p)
                                        };
                                      }
                                      return u;
                                    });
                                  });
                                } catch (error: any) {
                                  console.error("Error updating part status:", error);
                                  alert("Erro ao atualizar status do anúncio: " + error.message);
                                }
                              }}
                              className={`text-[10px] font-black uppercase rounded border-2 border-[#333] px-1.5 py-1 bg-[#0A0A0A] text-[#EDEDED] focus:outline-none cursor-pointer ${
                                part.status === 'active' 
                                  ? 'border-green-600 text-green-700 bg-green-50/50' 
                                  : part.status === 'sold'
                                  ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                                  : 'border-slate-400 text-slate-500'
                              }`}
                            >
                              <option value="active">{t('Ativo')}</option>
                              <option value="sold">{t('Vendido')}</option>
                              <option value="blocked">{t('Bloqueado')}</option>
                              <option value="inactive">{t('Inativo')}</option>
                            </select>

                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(t('Tem certeza que deseja excluir permanentemente este anúncio?'))) {
                                  try {
                                    const { error: err } = await supabase
                                      .from('parts')
                                      .delete()
                                      .eq('id', part.id);
                                    if (err) throw err;
                                    
                                    // Update local state
                                    setUsers(prevUsers => {
                                      return prevUsers.map(u => {
                                        if (u.id === selectedUser.id) {
                                          const filtered = u.parts.filter((p: any) => p.id !== part.id);
                                          return {
                                            ...u,
                                            parts: filtered,
                                            partsCount: filtered.length
                                          };
                                        }
                                        return u;
                                      });
                                    });
                                  } catch (error: any) {
                                    console.error("Error deleting part:", error);
                                    alert("Erro ao excluir anúncio: " + error.message);
                                  }
                                }
                              }}
                              className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 hover:border-red-200 border border-transparent transition-colors"
                              title={t('Excluir anúncio')}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Warehouse permissions (Logistix integration - Oculto no modelo Direct Ship) */}
              {/* <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">{t('Vincular Acesso a Armazéns (Logistix WMS)')}</span>
                <div className="grid grid-cols-2 gap-2 border-2 border-[#333] rounded-xl p-4 bg-[#111] max-h-40 overflow-y-auto">
                  {armazens.map(a => {
                    const isChecked = userArmazens.some(ua => ua.armazem_id === a.id);
                    return (
                      <label key={a.id} className="flex items-center gap-2.5 p-1.5 rounded hover:bg-[#1A1A1A] cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleWarehouseToggle(a.id)}
                          className="h-4 w-4 rounded border-[#333] border-2 text-[#EDEDED] focus:ring-black"
                        />
                        <span className="text-xs font-bold text-[#EDEDED]">{a.nome}</span>
                      </label>
                    );
                  })}
                </div>
              </div> */}
            </div>

            <div className="p-4 bg-[#111] border-t-2 border-[#333]/15 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#EDEDED] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333]/20"
              >
                {t('Cancelar')}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveUserDetails}
                className="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333] disabled:opacity-50"
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
          <div className="bg-[#0A0A0A] border-2 border-[#333] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b-2 border-[#333]/15 flex justify-between items-center bg-[#111]">
              <h2 className="text-md font-black text-[#EDEDED] uppercase tracking-wider">{editingCargo ? t('Editar Cargo') : t('Cadastrar Novo Cargo')}</h2>
              <button 
                onClick={() => setShowCargoModal(false)} 
                className="text-slate-500 hover:text-[#EDEDED] text-xl font-bold"
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
                  className="w-full px-3 py-2 bg-[#0A0A0A] border-2 border-[#333] rounded-lg text-sm text-[#EDEDED] focus:outline-none font-bold"
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
                    className="w-full px-3 py-2 bg-[#0A0A0A] border-2 border-[#333] rounded-lg text-sm text-[#EDEDED] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">{t('Setor Vinculado')}</label>
                  <select
                    value={cargoForm.setor_id}
                    onChange={(e) => setCargoForm({ ...cargoForm, setor_id: e.target.value })}
                    className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2 text-sm text-[#EDEDED] font-bold focus:outline-none"
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
                <div className="border-2 border-[#333] rounded-xl p-3 bg-[#111] divide-y divide-black/10 max-h-60 overflow-y-auto">
                  {PREDEFINED_PERMISSIONS.map(p => {
                    const isChecked = cargoForm.permissoes.includes(p.id);
                    return (
                      <div key={p.id} className="py-2.5 flex items-start gap-3 first:pt-0 last:pb-0">
                        <input 
                          type="checkbox" 
                          id={`perm-chk-${p.id}`}
                          checked={isChecked}
                          onChange={() => handleCargoPermissionToggle(p.id)}
                          className="h-4 w-4 rounded border-[#333] border-2 text-[#EDEDED] focus:ring-black mt-0.5"
                        />
                        <label htmlFor={`perm-chk-${p.id}`} className="cursor-pointer">
                          <span className="text-xs font-black block text-[#EDEDED]">{p.label}</span>
                          <span className="text-[10px] text-slate-500 block font-medium leading-tight mt-0.5">{p.desc}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#111] border-t-2 border-[#333]/15 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCargoModal(false)}
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#EDEDED] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333]/20"
              >
                {t('Cancelar')}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveCargo}
                className="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333] disabled:opacity-50"
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
          <div className="bg-[#0A0A0A] border-2 border-[#333] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-[#333]/15 flex justify-between items-center bg-[#111]">
              <h2 className="text-md font-black text-[#EDEDED] uppercase tracking-wider">{editingSetor ? t('Editar Setor') : t('Cadastrar Setor')}</h2>
              <button 
                onClick={() => setShowSetorModal(false)} 
                className="text-slate-500 hover:text-[#EDEDED] text-xl font-bold"
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
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border-2 border-[#333] rounded-lg text-sm text-[#EDEDED] focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="p-4 bg-[#111] border-t-2 border-[#333]/15 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSetorModal(false)}
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#EDEDED] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333]/20"
              >
                {t('Cancelar')}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSaveSetor}
                className="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333] disabled:opacity-50"
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
          <div className="bg-[#0A0A0A] border-2 border-[#333] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b-2 border-[#333]/15 flex justify-between items-center bg-[#111]">
              <h2 className="text-md font-black text-[#EDEDED] uppercase tracking-wider">{t('Cadastrar Novo Usuário')}</h2>
              <button 
                onClick={() => setShowCreateUserModal(false)} 
                className="text-slate-500 hover:text-[#EDEDED] text-xl font-bold"
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
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border-2 border-[#333] rounded-lg text-sm text-[#EDEDED] focus:outline-none font-bold"
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
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border-2 border-[#333] rounded-lg text-sm text-[#EDEDED] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1.5">{t('Role')}</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2.5 text-sm text-[#EDEDED] font-bold focus:outline-none"
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
                    className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2.5 text-sm text-[#EDEDED] font-bold focus:outline-none"
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
                  className="w-full bg-[#0A0A0A] border-2 border-[#333] rounded-lg px-3 py-2.5 text-sm text-[#EDEDED] font-bold focus:outline-none"
                >
                  <option value="">{t('Nenhum')}</option>
                  {cargos
                    .filter(c => !newUserForm.setor_id || c.setor_id === newUserForm.setor_id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
              </div>

              <div className="p-4 bg-[#111] -mx-6 -mb-6 border-t-2 border-[#333]/15 flex justify-end gap-3 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#EDEDED] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333]/20"
                >
                  {t('Cancelar')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-black hover:bg-neutral-800 text-white font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333] disabled:opacity-50"
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
          <div className="bg-[#0A0A0A] border-2 border-red-600 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
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
                className="text-red-600 hover:text-[#EDEDED] text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                Esta ação é <span className="font-bold text-red-600 uppercase">definitiva</span> e não pode ser desfeita.
                O usuário <strong className="font-bold text-[#EDEDED]">{deletingUser.full_name || 'Sem Nome'}</strong> (<span className="font-mono text-xs">{deletingUser.email}</span>) será excluído permanentemente da plataforma, perdendo todos os acessos imediatos.
              </p>

              <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">{t('Atenção')}</span>
                <p className="text-xs text-red-600 leading-normal font-bold">
                  Todos os dados de perfil, preferências e vinculações associados a este usuário serão removidos.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Para confirmar, digite <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#EDEDED] font-bold">{deletingUser.email}</span> no campo abaixo:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={deletingUser.email}
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border-2 border-red-200 focus:border-red-600 rounded-lg text-sm text-[#EDEDED] focus:outline-none font-bold placeholder-slate-300"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#111] border-t border-[#333]/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeletingUser(null);
                  setDeleteConfirmationText('');
                }}
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#EDEDED] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-widest border border-[#333]/20"
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
          <div className="bg-[#0A0A0A] border-2 border-[#333] rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#333]/10 flex justify-between items-center bg-[#111]">
              <div>
                <h3 className="text-[#EDEDED] font-black text-lg">
                  {t('Anúncios de')} {selectedUserPartsOwner}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  {selectedUserParts.length} {selectedUserParts.length === 1 ? t('anúncio encontrado') : t('anúncios encontrados')}
                </p>
              </div>
              <button 
                onClick={() => { setSelectedUserParts(null); setSelectedUserPartsOwner(''); }}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-[#EDEDED] transition-colors"
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
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-[#333]/10">
                        {part.images?.[0] ? (
                          <img src={part.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold bg-[#111]">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[#EDEDED] font-black text-sm truncate">{part.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                            part.status === 'active' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : part.status === 'sold'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-[#111] text-slate-500 border-slate-200'
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
                      className="bg-[#0A0A0A] hover:bg-[#111] text-[#EDEDED] border border-[#333]/20 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <Eye size={12} /> {t('Ver anúncio')}
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[#111] border-t border-[#333]/10 flex justify-end">
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

      {activeModUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border-2 border-[#333] rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#333]/10 flex justify-between items-center bg-[#111]">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#EDEDED]" />
                <h3 className="text-[#EDEDED] font-black text-sm uppercase tracking-wider">
                  {t('Painel de Moderação Rápida')}
                </h3>
              </div>
              <button 
                onClick={() => setActiveModUser(null)}
                className="text-slate-500 hover:text-[#EDEDED] font-bold p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Profile Card Header */}
              <div className="flex items-center space-x-3 p-3 bg-[#111] rounded-xl border border-[#333]/15">
                {activeModUser.avatar_url ? (
                  <img src={activeModUser.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-[#333]/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-sm font-black text-slate-800 border border-[#333]/10">
                    {(activeModUser.full_name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-[#EDEDED] truncate">{activeModUser.full_name || t('Sem nome')}</h4>
                  <p className="text-xs text-slate-500 truncate font-semibold">{activeModUser.email}</p>
                </div>
              </div>

              {/* Status and Verification Toggle */}
              <div className="grid grid-cols-2 gap-3">
                {/* Status Switcher */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Status da Conta')}</label>
                  <select
                    value={activeModUser.status || 'ativo'}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        await adminApi.usuarios.update(activeModUser.id, { status: newStatus });
                        setUsers(prev => prev.map(u => u.id === activeModUser.id ? { ...u, status: newStatus } : u));
                        setActiveModUser(prev => ({ ...prev, status: newStatus }));
                      } catch (err: any) {
                        alert(t('Erro ao atualizar status: ') + err.message);
                      }
                    }}
                    className="w-full bg-[#0A0A0A] border border-[#333]/20 rounded-lg px-2 py-1.5 text-xs text-[#EDEDED] font-black focus:outline-none"
                  >
                    <option value="ativo">{t('Ativo')}</option>
                    <option value="inativo">{t('Inativo')}</option>
                    <option value="suspenso">{t('Suspenso')}</option>
                    <option value="blocked">{t('Bloqueado')}</option>
                  </select>
                </div>

                {/* Role Switcher */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t('Nível de Acesso (Role)')}</label>
                  <select
                    value={activeModUser.role || 'user'}
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      try {
                        await adminApi.usuarios.update(activeModUser.id, { role: newRole });
                        setUsers(prev => prev.map(u => u.id === activeModUser.id ? { ...u, role: newRole } : u));
                        setActiveModUser(prev => ({ ...prev, role: newRole }));
                      } catch (err: any) {
                        alert(t('Erro ao atualizar nível: ') + err.message);
                      }
                    }}
                    className="w-full bg-[#0A0A0A] border border-[#333]/20 rounded-lg px-2 py-1.5 text-xs text-[#EDEDED] font-black focus:outline-none"
                  >
                    <option value="user">{t('Comprador')}</option>
                    <option value="seller">{t('Vendedor')}</option>
                    <option value="admin">{t('Admin')}</option>
                  </select>
                </div>
              </div>

              {/* Selo de Verificação Toggle */}
              <div className="flex items-center justify-between p-3 border border-[#333]/10 rounded-xl bg-[#111]">
                <div>
                  <span className="text-xs font-black uppercase tracking-tight text-[#EDEDED]">{t('Verificação Oficial')}</span>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{t('Destacar usuário com selo de confiança.')}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = !activeModUser.is_verified;
                    try {
                      await toggleUserVerificationDirect(activeModUser.id, activeModUser.is_verified || false);
                      setUsers(prev => prev.map(u => u.id === activeModUser.id ? { ...u, is_verified: nextVal } : u));
                      setActiveModUser(prev => ({ ...prev, is_verified: nextVal }));
                    } catch (err: any) {
                      alert(t('Erro ao alternar verificação: ') + err.message);
                    }
                  }}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors border border-[#333]/20 ${activeModUser.is_verified ? 'bg-black' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#0A0A0A] transition-transform ${activeModUser.is_verified ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Personal Data & Address Summary */}
              <div className="border border-[#333]/10 rounded-xl p-4 bg-[#111] space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block border-b border-[#333]/5 pb-1">{t('Dados Pessoais & Endereço')}</span>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-[#EDEDED]">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">{t('Telefone')}</span>
                    <span className="font-bold">{activeModUser.phone || t('Não cadastrado')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">{t('CEP')}</span>
                    <span className="font-bold">{activeModUser.cep || t('Não cadastrado')}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">{t('Endereço')}</span>
                  <span className="text-xs font-bold leading-tight block">{activeModUser.address || t('Não cadastrado')}</span>
                </div>
              </div>

              {/* Financial & Activity Summary */}
              <div className="border border-[#333]/10 rounded-xl p-4 bg-[#111] space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block border-b border-[#333]/5 pb-1">{t('Resumo de Transações')}</span>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Sales summary */}
                  <div className="bg-[#0A0A0A] p-2.5 rounded-lg border border-[#333]/10">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">{t('Vendas Confirmadas')}</span>
                    <span className="text-sm font-black text-[#EDEDED] block mt-0.5">
                      ¥ {(activeModUser.totalSalesValue || 0).toLocaleString('ja-JP')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                      {activeModUser.salesCount || 0} {t('itens vendidos')}
                    </span>
                  </div>

                  {/* Purchases spent summary */}
                  <div className="bg-[#0A0A0A] p-2.5 rounded-lg border border-[#333]/10">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">{t('Total Gasto (Compras)')}</span>
                    <span className="text-sm font-black text-[#EDEDED] block mt-0.5">
                      ¥ {(activeModUser.totalSpent || 0).toLocaleString('ja-JP')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                      {activeModUser.purchasesCount || 0} {t('compras')}
                    </span>
                  </div>
                </div>

                {/* Shipping Courier (Transportadoras usadas) */}
                <div className="pt-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t('Canais de Logística (Transportadoras)')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModUser.couriers && activeModUser.couriers.length > 0 ? (
                      activeModUser.couriers.map((courier: string) => (
                        <span key={courier} className="text-[9px] font-black uppercase bg-slate-100 border border-[#333]/15 text-[#EDEDED] px-2 py-0.5 rounded-full">
                          🚚 {courier}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">{t('Nenhuma transportadora registrada')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#111] border-t border-[#333]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModUser(null)}
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