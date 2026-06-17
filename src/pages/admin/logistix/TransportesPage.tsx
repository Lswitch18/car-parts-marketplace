import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Plus, Edit3, X, Truck } from 'lucide-react';

export default function TransportesPage() {
  const queryClient = useQueryClient();
  const [armazemFilter, setArmazemFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', placa: '', armazem_id: '', tipo: 'caminhao', capacidade_kg: 1000, ativo: true });

  const { data: transportes, isLoading } = useQuery({
    queryKey: ['admin', 'transportes', armazemFilter],
    queryFn: () => adminApi.transportes.list(armazemFilter || undefined),
  });

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.transportes.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'transportes'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => { if (!editingId) throw new Error('No id'); return adminApi.transportes.update(editingId, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'transportes'] }); closeModal(); },
  });

  function openCreate() { setEditingId(null); setForm({ nome: '', placa: '', armazem_id: '', tipo: 'caminhao', capacidade_kg: 1000, ativo: true }); setShowModal(true); }
  function openEdit(row: any) {
    setEditingId(row.id); setForm({ nome: row.nome || '', placa: row.placa || '', armazem_id: row.armazem_id || '', tipo: row.tipo || 'caminhao', capacidade_kg: row.capacidade_kg || 1000, ativo: row.ativo !== false }); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingId(null); }
  function handleSave() { if (editingId) updateMutation.mutate(); else createMutation.mutate(); }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const list = Array.isArray(transportes) ? transportes : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Transportes</h2><p className="text-sm text-text-secondary mt-1">{list.length} veículos cadastrados</p></div>
        <button onClick={openCreate} className="h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center gap-2 text-sm"><Plus size={16} /> Novo Veículo</button>
      </div>

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
