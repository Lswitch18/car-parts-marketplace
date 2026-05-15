import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { adminApi } from '../../../lib/adminApi';
import { Plus, Edit3, X, ChevronLeft, ChevronRight } from 'lucide-react';

async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data as T;
}

export default function ColetasPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ pedido_id: '', endereco: '', cidade: '', estado: '', contato: '', telefone: '', observacao: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coletas', page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      return authFetch<any>(`/coletas?${params}`);
    },
  });

  const { data: pedidos } = useQuery({
    queryKey: ['admin', 'pedidos-dropdown'],
    queryFn: () => adminApi.pedidos.list({ limit: 200 }),
  });

  const createMutation = useMutation({
    mutationFn: () => authFetch('/coletas', { method: 'POST', body: JSON.stringify(form) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coletas'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => { if (!editingId) throw new Error('No id'); return authFetch(`/coletas/${editingId}`, { method: 'PUT', body: JSON.stringify(form) }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coletas'] }); closeModal(); },
  });

  function openCreate() { setEditingId(null); setForm({ pedido_id: '', endereco: '', cidade: '', estado: '', contato: '', telefone: '', observacao: '' }); setShowModal(true); }
  function openEdit(row: any) { setEditingId(row.id); setForm({ pedido_id: row.pedido_id || '', endereco: row.endereco || '', cidade: row.cidade || '', estado: row.estado || '', contato: row.contato || '', telefone: row.telefone || '', observacao: row.observacao || '' }); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingId(null); }
  function handleSave() { if (editingId) updateMutation.mutate(); else createMutation.mutate(); }

  const rows = Array.isArray(data) ? data : (data as any)?.rows || [];
  const total = (data as any)?.total || rows.length;
  const pages = (data as any)?.pages || Math.ceil(total / 15);

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Coletas</h2><p className="text-sm text-gray-400 mt-1">{total} coletas agendadas</p></div>
        <button onClick={openCreate} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 text-sm"><Plus size={16} /> Nova Coleta</button>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Pedido', 'Endereço', 'Cidade', 'Contato', 'Telefone', 'Ações'].map(h => (
                <th key={h} className="text-left text-[12px] text-gray-400 font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">Nenhuma coleta encontrada</td></tr>
              : rows.map((row: any) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm font-mono text-blue-400">{row.pedido?.codigo || row.pedido_id?.substring(0, 8)}</td>
                  <td className="p-4 text-sm text-gray-300 max-w-xs truncate">{row.endereco || '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{row.cidade}{row.estado ? `/${row.estado}` : ''}</td>
                  <td className="p-4 text-sm text-gray-300">{row.contato || '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{row.telefone || '-'}</td>
                  <td className="p-4"><button onClick={() => openEdit(row)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400"><Edit3 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <span className="text-sm text-gray-400">Página {page} de {pages}</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30 text-gray-400"><ChevronLeft size={16} /></button>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30 text-gray-400"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-lg mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Coleta' : 'Nova Coleta'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm text-gray-400 mb-1 block">Pedido</label>
                <select value={form.pedido_id} onChange={e => setForm({ ...form, pedido_id: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Selecione...</option>
                  {(Array.isArray(pedidos) ? pedidos : (pedidos as any)?.rows || []).map((p: any) => <option key={p.id} value={p.id}>{p.codigo}</option>)}
                </select>
              </div>
              <div><label className="text-sm text-gray-400 mb-1 block">Endereço</label><input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Cidade</label><input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Estado</label><input value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} maxLength={2} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Contato</label><input value={form.contato} onChange={e => setForm({ ...form, contato: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Telefone</label><input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div><label className="text-sm text-gray-400 mb-1 block">Observação</label><textarea value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} rows={2} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 resize-none" /></div>
            </div>
            <div className="flex items-center gap-3 mt-6 justify-end">
              <button onClick={closeModal} className="h-10 px-4 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{editingId ? 'Atualizar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
