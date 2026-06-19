import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/modules/transactions/api/adminApi';
import { 
  Search, Plus, Edit3, X, Shield, ChevronLeft, ChevronRight, 
  UserCheck, Eye, RefreshCw, FileText, CheckCircle
} from 'lucide-react';

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'biometria'>('usuarios');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    usuario_id: '', nome: '', email: '', role: 'admin',
    cargo_id: '', setor_id: '', telefone: '', status: 'ativo',
    armazens: [] as any[],
  });

  // Driver biometrics preview modal states
  const [previewModal, setPreviewModal] = useState<{
    type: 'cnh' | 'face' | 'signature' | null;
    title: string;
    image: string | null;
  }>({ type: null, title: '', image: null });

  // State to read local registered drivers
  const [localDrivers, setLocalDrivers] = useState<any[]>([]);

  const loadLocalDrivers = () => {
    const drivers = [];
    const profileStr = localStorage.getItem('driver_profile');
    const faceStr = localStorage.getItem('driver_face_template');
    
    // Find all signatures in localstorage
    let signatureStr = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('col_sig_') || key.startsWith('batch_signature_'))) {
        signatureStr = localStorage.getItem(key);
        break; // Grab the first one found for demonstration
      }
    }

    if (profileStr) {
      try {
        const p = JSON.parse(profileStr);
        drivers.push({
          id: 'driver-001',
          nome: p.name,
          cnh: p.cnh,
          plate: p.plate,
          phone: p.phone,
          cnhPhoto: p.docPhoto || null,
          faceTemplate: faceStr || null,
          signature: signatureStr || null
        });
      } catch (e) {
        console.error(e);
      }
    }

    // Add mock drivers if empty to ensure the admin has data to see
    if (drivers.length === 0) {
      drivers.push({
        id: 'driver-mock-001',
        nome: 'Carlos Silva (Exemplo)',
        cnh: '98765432100',
        plate: 'XYZ-9876',
        phone: '(11) 98888-7777',
        cnhPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        faceTemplate: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      });
    }

    setLocalDrivers(drivers);
  };

  useEffect(() => {
    if (activeSubTab === 'biometria') {
      loadLocalDrivers();
    }
  }, [activeSubTab]);

  const handleResetBiometrics = () => {
    if (confirm('Deseja realmente redefinir o cadastro biométrico local do motorista?')) {
      localStorage.removeItem('driver_profile');
      localStorage.removeItem('driver_face_template');
      // Clear signatures
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('col_sig_') || key.startsWith('batch_signature_'))) {
          localStorage.removeItem(key);
        }
      }
      loadLocalDrivers();
    }
  };

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['admin', 'usuarios', search],
    queryFn: () => adminApi.usuarios.list(search || undefined),
  });

  const { data: setoresList } = useQuery({
    queryKey: ['admin', 'setores-list'],
    queryFn: () => adminApi.setores.list(),
  });

  const { data: cargosList } = useQuery({
    queryKey: ['admin', 'cargos-list'],
    queryFn: () => adminApi.cargos.list(),
  });

  const { data: armazensList } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const { data: semCargo } = useQuery({
    queryKey: ['admin', 'usuarios-sem-cargo'],
    queryFn: () => adminApi.usuarios.list('', true),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.usuarios.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios-sem-cargo'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingId) throw new Error('No id');
      return adminApi.usuarios.update(editingId, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
      closeModal();
    },
  });

  function openCreate() {
    setEditingId(null);
    setForm({ usuario_id: '', nome: '', email: '', role: 'admin', cargo_id: '', setor_id: '', telefone: '', status: 'ativo', armazens: [] });
    setShowModal(true);
  }

  function openEdit(row: any) {
    setEditingId(row.id);
    const ua = row.armazens || [];
    setForm({
      usuario_id: row.id, nome: row.full_name || row.nome || '', email: row.email || '',
      role: row.role || 'admin', cargo_id: row.cargo_id || row.cargo?.id || '',
      setor_id: row.setor_id || row.setor?.id || '',
      telefone: row.telefone || '', status: row.status || 'ativo',
      armazens: ua.map((a: any) => ({ id: a.armazem_id || a.armazem?.id })),
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); }

  function handleSave() {
    if (editingId) updateMutation.mutate();
    else createMutation.mutate();
  }

  function toggleArmazem(armazemId: string) {
    setForm((f: any) => ({
      ...f,
      armazens: f.armazens.some((a: any) => a.id === armazemId)
        ? f.armazens.filter((a: any) => a.id !== armazemId)
        : [...f.armazens, { id: armazemId, acesso_admin: false }],
    }));
  }

  const getArray = (val: any): any[] => {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.rows)) return val.rows;
    if (val && Array.isArray(val.data)) return val.data;
    return [];
  };

  const setoresArr = getArray(setoresList);
  const cargosArr = getArray(cargosList);
  const armazensArr = getArray(armazensList);
  const semCargoArr = getArray(semCargo);

  const rows = getArray(usuarios);
  const total = rows.length;
  const perPage = 15;
  const pages = Math.ceil(total / perPage);
  const paginated = rows.slice((page - 1) * perPage, page * perPage);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Tab Switcher Headers */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveSubTab('usuarios')}
            className={`text-lg font-bold pb-2 transition-all border-b-2 ${
              activeSubTab === 'usuarios' 
                ? 'text-white border-blue-500' 
                : 'text-text-secondary border-transparent hover:text-white'
            }`}
          >
            Usuários Logistix
          </button>
          <button 
            onClick={() => setActiveSubTab('biometria')}
            className={`text-lg font-bold pb-2 transition-all border-b-2 ${
              activeSubTab === 'biometria' 
                ? 'text-white border-blue-500' 
                : 'text-text-secondary border-transparent hover:text-white'
            }`}
          >
            Controle Biométrico (Motoristas)
          </button>
        </div>
        
        {activeSubTab === 'usuarios' ? (
          <button onClick={openCreate} className="h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center gap-2 text-sm">
            <Plus size={16} /> Vincular ao Logistix
          </button>
        ) : (
          <button onClick={handleResetBiometrics} className="h-10 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-medium flex items-center gap-2 text-sm transition-all">
            <RefreshCw size={14} /> Redefinir Biometrias Locais
          </button>
        )}
      </div>

      {activeSubTab === 'usuarios' ? (
        <>
          <div className="flex items-center bg-[#111827] rounded-lg h-10 px-3 border border-border">
            <Search size={18} className="text-text-secondary mr-2" />
            <input type="text" placeholder="Buscar por nome ou email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-muted" />
            {search && <X size={16} className="text-text-secondary cursor-pointer" onClick={() => setSearch('')} />}
          </div>

          <div className="bg-[#111827] rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Nome', 'Email', 'Cargo', 'Setor', 'Tipo', 'Status', 'Ações'].map(h => (
                      <th key={h} className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-text-muted text-sm">Nenhum usuário encontrado</td></tr>
                  ) : paginated.map((row: any) => (
                    <tr key={row.id} className="border-b border-border hover:bg-surface/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {(row.full_name || row.email || '?')[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-white font-medium">{row.full_name || 'Sem nome'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-300">{row.email || '-'}</td>
                      <td className="p-4 text-sm text-text-secondary">{row.cargo?.nome || <span className="text-gray-600">—</span>}</td>
                      <td className="p-4 text-sm text-text-secondary">{row.setor?.nome || <span className="text-gray-600">—</span>}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${row.role === 'admin' ? 'text-purple-400 bg-purple-400/15' : row.role === 'seller' ? 'text-blue-400 bg-blue-400/15' : 'text-text-secondary bg-gray-400/15'}`}>
                          {row.role || 'buyer'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${row.status === 'ativo' ? 'text-green-400 bg-green-400/15' : 'text-text-secondary bg-gray-400/15'}`}>
                          {row.status || 'ativo'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-surface/5 rounded-lg text-text-secondary hover:text-blue-400">
                          <Edit3 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <span className="text-sm text-text-secondary">Página {page} de {pages}</span>
                <div className="flex items-center gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-surface/5 rounded-lg disabled:opacity-30 text-text-secondary"><ChevronLeft size={16} /></button>
                  <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-surface/5 rounded-lg disabled:opacity-30 text-text-secondary"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Driver Biometrics Audit Panel */
        <div className="bg-[#111827] rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Motorista', 'CNH / Doc', 'Placa do Veículo', 'Telefone', 'Status CNH', 'Biometria Facial', 'Assinatura'].map(h => (
                    <th key={h} className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {localDrivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-border hover:bg-surface/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium text-white">{driver.nome}</td>
                    <td className="p-4 text-sm text-gray-300 font-mono">{driver.cnh}</td>
                    <td className="p-4 text-sm text-blue-400 font-semibold">{driver.plate}</td>
                    <td className="p-4 text-sm text-gray-400">{driver.phone}</td>
                    <td className="p-4">
                      {driver.cnhPhoto ? (
                        <button 
                          onClick={() => setPreviewModal({ type: 'cnh', title: `CNH - ${driver.nome}`, image: driver.cnhPhoto })}
                          className="h-8 px-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-blue-500/20 transition-all"
                        >
                          <FileText size={13} /> Visualizar
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Pendente</span>
                      )}
                    </td>
                    <td className="p-4">
                      {driver.faceTemplate ? (
                        <button 
                          onClick={() => setPreviewModal({ type: 'face', title: `Rosto - ${driver.nome}`, image: driver.faceTemplate })}
                          className="h-8 px-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-green-500/20 transition-all"
                        >
                          <UserCheck size={13} /> Ver Biometria
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Pendente</span>
                      )}
                    </td>
                    <td className="p-4">
                      {driver.signature ? (
                        <button 
                          onClick={() => setPreviewModal({ type: 'signature', title: `Última Assinatura - ${driver.nome}`, image: driver.signature })}
                          className="h-8 px-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-purple-500/20 transition-all"
                        >
                          <CheckCircle size={13} /> Assinatura
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Pendente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver Biometric Audit Preview Modal */}
      {previewModal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreviewModal({ type: null, title: '', image: null })}>
          <div className="bg-[#1F2937] rounded-2xl p-6 w-full max-w-md border border-border flex flex-col items-center gap-4 relative" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center w-full">{previewModal.title}</h3>
            <button 
              onClick={() => setPreviewModal({ type: null, title: '', image: null })}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className={`w-full bg-black rounded-xl border border-white/5 overflow-hidden flex items-center justify-center ${
              previewModal.type === 'face' ? 'h-64 w-64 rounded-full border-2 border-green-500/40' : 'h-48'
            }`}>
              {previewModal.image ? (
                <img src={previewModal.image} alt={previewModal.title} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-sm text-gray-500">Nenhuma imagem disponível</span>
              )}
            </div>
            
            <button 
              onClick={() => setPreviewModal({ type: null, title: '', image: null })}
              className="h-10 px-6 bg-[#111827] text-gray-400 rounded-lg text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Vincular/Editar Usuários Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-2xl mx-4 border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold">{editingId ? 'Editar Usuário Logistix' : 'Vincular ao Logistix'}</h3>
              </div>
              <button onClick={closeModal} className="text-text-secondary hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-5">
              {!editingId && (
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Selecionar usuário do marketplace</label>
                  <select value={form.usuario_id} onChange={e => {
                    const sel = semCargoArr.find((u: any) => u.id === e.target.value);
                    setForm({ ...form, usuario_id: e.target.value, nome: sel?.full_name || '', email: sel?.email || '' });
                  }} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="">Selecione um usuário...</option>
                    {semCargoArr.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.email})</option>
                    ))}
                  </select>
                  {semCargoArr.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-1">Todos os usuários já possuem cargo no Logistix</p>
                  )}
                </div>
              )}

              {editingId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">Nome</label>
                    <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                      className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">Email</label>
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Setor</label>
                  <select value={form.setor_id} onChange={e => setForm({ ...form, setor_id: e.target.value })}
                    className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="">Selecione...</option>
                    {setoresArr.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Cargo</label>
                  <select value={form.cargo_id} onChange={e => setForm({ ...form, cargo_id: e.target.value })}
                    className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="">Selecione...</option>
                    {cargosArr.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Telefone</label>
                  <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })}
                    className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="afastado">Afastado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Acesso a Armazéns</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {armazensArr.map((a: any) => (
                    <label key={a.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface/5 cursor-pointer">
                      <input type="checkbox" checked={form.armazens.some((fa: any) => fa.id === a.id)}
                        onChange={() => toggleArmazem(a.id)}
                        className="h-4 w-4 rounded border-white/20 bg-[#111827] text-blue-500" />
                      <span className="text-sm text-gray-300">{a.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 justify-end border-t border-border pt-4">
              <button onClick={closeModal} className="h-10 px-4 border border-border rounded-lg text-sm text-text-secondary hover:text-white">Cancelar</button>
              <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending || (!editingId && !form.usuario_id)}
                className="h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {createMutation.isPending || updateMutation.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
                ) : editingId ? 'Atualizar' : 'Vincular ao Logistix'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
