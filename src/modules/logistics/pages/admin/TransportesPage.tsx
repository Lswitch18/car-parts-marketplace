import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/modules/transactions/api/adminApi';
import { logisticsApi } from '@/modules/logistics/api/logisticsApi';
import { Plus, Edit3, X, Truck, Play, CheckCircle2, User } from 'lucide-react';

export default function TransportesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'veiculos' | 'despacho'>('veiculos');
  const [armazemFilter, setArmazemFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', placa: '', armazem_id: '', tipo: 'caminhao', capacidade_kg: 1000, ativo: true });

  // Despacho States
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('');

  const { data: transportes, isLoading } = useQuery({
    queryKey: ['admin', 'transportes', armazemFilter],
    queryFn: () => adminApi.transportes.list(armazemFilter || undefined),
  });

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const { data: pendingShipments, refetch: refetchPending } = useQuery({
    queryKey: ['admin', 'pending-shipments'],
    queryFn: async () => {
      const supabase = (await import('@/modules/shared/lib/supabase')).supabase;
      const { data } = await supabase
        .from('admin_shipments')
        .select('*, pedido:admin_pedidos(codigo, cliente:admin_clientes(nome))')
        .in('status', ['recebido', 'coletado', 'pending'])
        .is('motorista_id', null);
      return data || [];
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ['admin', 'drivers-list'],
    queryFn: async () => {
      const supabase = (await import('@/modules/shared/lib/supabase')).supabase;
      const { data } = await supabase
        .from('admin_profiles')
        .select('id, full_name, email')
        .order('full_name');
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.transportes.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'transportes'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => { if (!editingId) throw new Error('No id'); return adminApi.transportes.update(editingId, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'transportes'] }); closeModal(); },
  });

  const dispatchMutation = useMutation({
    mutationFn: async () => {
      if (selectedShipments.length === 0 || !selectedDriver) {
        alert('Selecione pelo menos um pacote e um motorista.');
        return;
      }
      
      const supabase = (await import('@/modules/shared/lib/supabase')).supabase;

      const route = await logisticsApi.rotas.create({
        nome: `Rota Last-Mile ${new Date().toLocaleDateString()}`,
        status: 'criada'
      });

      const routeId = (route as any)?.id;

      for (const shipmentId of selectedShipments) {
        await logisticsApi.assign({
          shipment_id: shipmentId,
          motorista_id: selectedDriver,
          veiculo_id: selectedVehicle || undefined,
          transportadora: selectedCarrier || undefined
        });

        await supabase
          .from('admin_shipments')
          .update({
            rota_id: routeId,
            status: 'em_transito',
            etapa: 'EM_TRANSITO'
          })
          .eq('id', shipmentId);

        const { data: shipment } = await supabase
          .from('admin_shipments')
          .select('pedido_id')
          .eq('id', shipmentId)
          .single();

        await supabase.from('admin_rastreamento').insert({
          pedido_id: shipment?.pedido_id || null,
          titulo: 'Em trânsito',
          descricao: `O pacote foi despachado na rota e está a caminho do destinatário.`,
          etapa: 'EM_TRANSITO',
          localizacao: 'Em trânsito'
        });
      }

      alert('Rota criada e motorista despachado com sucesso!');
      setSelectedShipments([]);
      setSelectedDriver('');
      setSelectedVehicle('');
      setSelectedCarrier('');
      refetchPending();
    }
  });

  function openCreate() { setEditingId(null); setForm({ nome: '', placa: '', armazem_id: '', tipo: 'caminhao', capacidade_kg: 1000, ativo: true }); setShowModal(true); }
  function openEdit(row: any) {
    setEditingId(row.id); setForm({ nome: row.nome || '', placa: row.placa || '', armazem_id: row.armazem_id || '', tipo: row.tipo || 'caminhao', capacidade_kg: row.capacidade_kg || 1000, ativo: row.ativo !== false }); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingId(null); }
  function handleSave() { if (editingId) updateMutation.mutate(); else createMutation.mutate(); }

  const list = Array.isArray(transportes) ? transportes : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transportes & Roteirização</h2>
          <p className="text-sm text-text-secondary mt-1">
            {tab === 'veiculos' ? `${list.length} veículos cadastrados` : `${pendingShipments?.length || 0} remessas aguardando roteirização`}
          </p>
        </div>
        {tab === 'veiculos' && (
          <button onClick={openCreate} className="h-10 px-4 bg-primary hover:bg-primary-dark text-black rounded-lg font-bold flex items-center gap-2 text-sm">
            <Plus size={16} /> Novo Veículo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('veiculos')}
          className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
            tab === 'veiculos' ? 'bg-primary text-black' : 'bg-[#111827] text-text-secondary border border-border'
          }`}
        >
          <Truck size={16} /> Veículos
        </button>
        <button
          onClick={() => setTab('despacho')}
          className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
            tab === 'despacho' ? 'bg-primary text-black' : 'bg-[#111827] text-text-secondary border border-border'
          }`}
        >
          <Play size={16} /> Torre de Despacho (Roteirização)
        </button>
      </div>

      {tab === 'veiculos' ? (
        <>
          <div className="flex items-center gap-3">
            <select value={armazemFilter} onChange={e => setArmazemFilter(e.target.value)}
              className="bg-[#111827] border border-border rounded-lg h-10 px-3 text-sm text-white outline-none">
              <option value="">Todos armazéns</option>
              {(armazens || []).map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.length === 0 ? (
              <div className="col-span-full text-center py-12 text-text-muted">Nenhum veículo encontrado</div>
            ) : list.map((row: any) => (
              <div key={row.id} className="bg-[#111827] rounded-xl border border-border p-5 hover:border-blue-500/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center"><Truck size={20} className="text-orange-400" /></div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-surface/5 rounded-lg text-text-secondary hover:text-blue-400"><Edit3 size={14} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">{row.nome}</h3>
                <p className="text-sm text-text-secondary font-mono">{row.placa || 'Sem placa'}</p>
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-background0/20 text-gray-300">{row.tipo || 'caminhao'}</span>
                  <span className="text-text-secondary">{row.capacidade_kg}kg</span>
                  <span className={`px-2 py-0.5 rounded-full ${row.ativo ? 'text-green-400 bg-green-400/15' : 'text-text-secondary bg-gray-400/15'}`}>{row.ativo ? 'Ativo' : 'Inativo'}</span>
                </div>
                <p className="text-xs text-text-muted mt-2">Armazém: {row.armazem?.nome || row.armazem_id?.substring(0, 8) || '-'}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Seletor de Carga e Roteirização */}
          <div className="lg:col-span-2 bg-[#111827] rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary-light" /> 1. Selecionar Pacotes Pendentes
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-secondary font-bold">
                    <th className="p-3">Selec.</th>
                    <th className="p-3">Código</th>
                    <th className="p-3">Pedido</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Peso</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(pendingShipments || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-text-muted">
                        Nenhum pacote aguardando envio no momento
                      </td>
                    </tr>
                  ) : (
                    (pendingShipments || []).map((sh: any) => (
                      <tr key={sh.id} className="hover:bg-slate-900/50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedShipments.includes(sh.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedShipments(prev => [...prev, sh.id]);
                              } else {
                                setSelectedShipments(prev => prev.filter(id => id !== sh.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-white/20 bg-background"
                          />
                        </td>
                        <td className="p-3 font-mono font-medium text-text">{sh.codigo}</td>
                        <td className="p-3 font-mono text-text-secondary">{sh.pedido?.codigo || '—'}</td>
                        <td className="p-3 text-text-secondary">{sh.pedido?.cliente?.nome || '—'}</td>
                        <td className="p-3 text-text-secondary">{sh.peso_kg ? `${sh.peso_kg}kg` : '—'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                            {sh.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Atribuição de Motorista / Veículo */}
          <div className="bg-[#111827] rounded-xl border border-border p-5 space-y-5 h-fit">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <User size={16} className="text-primary-light" /> 2. Configurar Rota & Motorista
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Selecionar Motorista</label>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-white outline-none"
                >
                  <option value="">Selecione...</option>
                  {(drivers || []).map((d: any) => (
                    <option key={d.id} value={d.id}>{d.full_name || d.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1 block">Selecionar Veículo</label>
                <select
                  value={selectedVehicle}
                  onChange={e => setSelectedVehicle(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-white outline-none"
                >
                  <option value="">Selecione...</option>
                  {list.filter(v => v.ativo).map((v: any) => (
                    <option key={v.id} value={v.id}>{v.nome} ({v.placa})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1 block">Transportadora (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Yamato, Seino, Logistix"
                  value={selectedCarrier}
                  onChange={e => setSelectedCarrier(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-white outline-none placeholder:text-text-muted"
                />
              </div>
            </div>

            <div className="border-t border-border pt-3 text-xs text-text-secondary space-y-2">
              <div className="flex justify-between">
                <span>Pacotes Selecionados:</span>
                <span className="font-bold text-text">{selectedShipments.length}</span>
              </div>
            </div>

            <button
              onClick={() => dispatchMutation.mutate()}
              disabled={selectedShipments.length === 0 || !selectedDriver || dispatchMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary-dark text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {dispatchMutation.isPending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Play size={14} /> Despachar e Iniciar Rota</>}
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-lg mx-4 border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Veículo' : 'Novo Veículo'}</h3>
              <button onClick={closeModal} className="text-text-secondary hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-text-secondary mb-1 block">Nome</label><input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-text-secondary mb-1 block">Placa</label><input value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value })} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-text-secondary mb-1 block">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="caminhao">Caminhão</option>
                    <option value="van">Van</option>
                    <option value="carro">Carro</option>
                    <option value="moto">Moto</option>
                  </select>
                </div>
                <div><label className="text-sm text-text-secondary mb-1 block">Capacidade (kg)</label><input type="number" value={form.capacidade_kg} onChange={e => setForm({ ...form, capacidade_kg: Number(e.target.value) })} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div><label className="text-sm text-text-secondary mb-1 block">Armazém</label>
                <select value={form.armazem_id} onChange={e => setForm({ ...form, armazem_id: e.target.value })} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Selecione...</option>
                  {(armazens || []).map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} className="h-4 w-4 rounded border-white/20 bg-[#111827]" /><span className="text-sm text-text-secondary">Ativo</span></label>
            </div>
            <div className="flex items-center gap-3 mt-6 justify-end">
              <button onClick={closeModal} className="h-10 px-4 border border-border rounded-lg text-sm text-text-secondary hover:text-white">Cancelar</button>
              <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium disabled:opacity-50">{editingId ? 'Atualizar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
