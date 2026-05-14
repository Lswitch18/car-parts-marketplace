import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Plus, Edit3, Trash2, X, Warehouse, MapPin } from 'lucide-react';

export default function ArmazensPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', cidade: '', estado: '', pais: 'BR', capacidade: 0, ocupacao: 0, ativo: true });

  const { data: armazens, isLoading } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.armazens.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'armazens-list'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => { if (!editingId) throw new Error('No id'); return adminApi.armazens.update(editingId, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'armazens-list'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.armazens.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'armazens-list'] }),
  });

  function openCreate() {
    setEditingId(null); setForm({ nome: '', cidade: '', estado: '', pais: 'BR', capacidade: 0, ocupacao: 0, ativo: true }); setShowModal(true);
  }

  function openEdit(row: any) {
    setEditingId(row.id);
    setForm({ nome: row.nome || '', cidade: row.cidade || '', estado: row.estado || '', pais: row.pais || 'BR', capacidade: row.capacidade || 0, ocupacao: row.ocupacao || 0, ativo: row.ativo !== false });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); }

  function handleSave() { if (editingId) updateMutation.mutate(); else createMutation.mutate(); }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Armazéns</h2><p className="text-sm text-gray-400 mt-1">{(armazens || []).length} armazéns cadastrados</p></div>
        <button onClick={openCreate} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 text-sm"><Plus size={16} /> Novo Armazém</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(armazens || []).map((a: any) => (
          <div key={a.id} className="bg-[#111827] rounded-xl border border-white/5 p-5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Warehouse size={20} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400"><Edit3 size={14} /></button>
                <button onClick={() => deleteMutation.mutate(a.id)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{a.nome}</h3>
            <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={12} />{a.cidade}{a.estado ? ` - ${a.estado}` : ''}</p>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Ocupação</span>
                <span className="font-medium" style={{ color: (a.pct || 0) > 80 ? '#EF4444' : (a.pct || 0) > 60 ? '#FACC15' : '#22C55E' }}>{a.pct || 0}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${Math.min(a.pct || 0, 100)}%`,
                  background: (a.pct || 0) > 80 ? '#EF4444' : (a.pct || 0) > 60 ? '#FACC15' : '#22C55E',
                }} />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{a.ocupacao || 0} unidades</span>
              <span>Capacidade: {a.capacidade || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-lg mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Armazém' : 'Novo Armazém'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nome</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Cidade</label>
                  <input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Estado</label>
                  <input value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} maxLength={2} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Capacidade</label>
                  <input type="number" value={form.capacidade} onChange={e => setForm({ ...form, capacidade: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Ocupação Atual</label>
                  <input type="number" value={form.ocupacao} onChange={e => setForm({ ...form, ocupacao: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} className="h-4 w-4 rounded border-white/20 bg-[#111827]" />
                <span className="text-sm text-gray-400">Ativo</span>
              </label>
            </div>
            <div className="flex items-center gap-3 mt-6 justify-end">
              <button onClick={closeModal} className="h-10 px-4 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
