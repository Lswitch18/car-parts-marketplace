import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/modules/transactions/api/adminApi';
import { Plus, Edit3, X } from 'lucide-react';

export default function OcorrenciasPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ pedido_id: '', tipo: 'avaria', descricao: '', status: 'aberto' });

  const { data: ocorrencias, isLoading } = useQuery({
    queryKey: ['admin', 'ocorrencias', statusFilter],
    queryFn: () => adminApi.ocorrencias.list(statusFilter || undefined),
  });

  const { data: pedidos } = useQuery({
    queryKey: ['admin', 'pedidos-dropdown'],
    queryFn: () => adminApi.pedidos.list({ limit: 200 }),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.ocorrencias.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'ocorrencias'] }); closeModal(); },
  });

  async function updateOcorrencia(id: string, data: any) {
    const token = localStorage.getItem('sb-access-token');
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin/ocorrencias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'API error');
    return json.data;
  }

  const updateMutation = useMutation({
    mutationFn: () => { if (!editingId) throw new Error('No id'); return updateOcorrencia(editingId, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'ocorrencias'] }); closeModal(); },
  });

  function openCreate() { setEditingId(null); setForm({ pedido_id: '', tipo: 'avaria', descricao: '', status: 'aberto' }); setShowModal(true); }
  function openEdit(row: any) { setEditingId(row.id); setForm({ pedido_id: row.pedido_id || '', tipo: row.tipo || 'avaria', descricao: row.descricao || '', status: row.status || 'aberto' }); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingId(null); }
  function handleSave() { if (editingId) updateMutation.mutate(); else createMutation.mutate(); }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const list = Array.isArray(ocorrencias) ? ocorrencias : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Ocorrências</h2><p className="text-sm text-text-secondary mt-1">{list.length} registros</p></div>
        <button onClick={openCreate} className="h-10 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center gap-2 text-sm"><Plus size={16} /> Nova Ocorrência</button>
      </div>

      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        className="bg-[#111827] border border-border rounded-lg h-10 px-3 text-sm text-white outline-none">
        <option value="">Todos os status</option>
        <option value="aberto">Aberto</option>
        <option value="em_andamento">Em Andamento</option>
        <option value="resolvido">Resolvido</option>
        <option value="cancelado">Cancelado</option>
      </select>

      <div className="bg-[#111827] rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['Pedido', 'Tipo', 'Descrição', 'Status', 'Data', 'Ações'].map(h => (
                <th key={h} className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {list.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-text-muted text-sm">Nenhuma ocorrência</td></tr>
              : list.map((row: any) => (
                <tr key={row.id} className="border-b border-border hover:bg-surface/[0.02] transition-colors">
                  <td className="p-4 text-sm font-mono text-blue-400">{row.pedido?.codigo || row.pedido_id?.substring(0, 8)}</td>
                  <td className="p-4"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-500/15 text-red-400">{row.tipo}</span></td>
                  <td className="p-4 text-sm text-gray-300 max-w-xs truncate">{row.descricao}</td>
                  <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full ${
                    row.status === 'aberto' ? 'text-red-400 bg-red-400/15' :
                    row.status === 'em_andamento' ? 'text-yellow-400 bg-yellow-400/15' :
                    row.status === 'resolvido' ? 'text-green-400 bg-green-400/15' : 'text-text-secondary bg-gray-400/15'
                  }`}>{row.status?.replace('_', ' ')}</span></td>
                  <td className="p-4 text-sm text-text-secondary whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="p-4"><button onClick={() => openEdit(row)} className="p-1.5 hover:bg-surface/5 rounded-lg text-text-secondary hover:text-blue-400"><Edit3 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-lg mx-4 border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Ocorrência' : 'Nova Ocorrência'}</h3>
              <button onClick={closeModal} className="text-text-secondary hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm text-text-secondary mb-1 block">Pedido</label>
                <select value={form.pedido_id} onChange={e => setForm({ ...form, pedido_id: e.target.value })} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Selecione...</option>
                  {(Array.isArray(pedidos) ? pedidos : (pedidos as any)?.rows || []).map((p: any) => <option key={p.id} value={p.id}>{p.codigo}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-text-secondary mb-1 block">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="avaria">Avaria</option>
                    <option value="perda">Perda</option>
                    <option value="atraso">Atraso</option>
                    <option value="extraviado">Extraviado</option>
                    <option value="devolucao">Devolução</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div><label className="text-sm text-text-secondary mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div><label className="text-sm text-text-secondary mb-1 block">Descrição</label>
                <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={3} className="w-full bg-[#111827] border border-border rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 resize-none" />
              </div>
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
