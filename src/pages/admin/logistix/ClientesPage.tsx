import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ClientesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cidade: '', estado: '', cnpj: '', ativo: true });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'clientes', page, search],
    queryFn: () => adminApi.clientes.list({ page, limit: 15, search }),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.clientes.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'clientes'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => { if (!editingId) throw new Error('No id'); return adminApi.clientes.update(editingId, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'clientes'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.clientes.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'clientes'] }),
  });

  function openCreate() { setEditingId(null); setForm({ nome: '', email: '', telefone: '', cidade: '', estado: '', cnpj: '', ativo: true }); setShowModal(true); }
  function openEdit(row: any) {
    setEditingId(row.id); setForm({ nome: row.nome || '', email: row.email || '', telefone: row.telefone || '', cidade: row.cidade || '', estado: row.estado || '', cnpj: row.cnpj || '', ativo: row.ativo !== false }); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingId(null); }
  function handleSave() { if (editingId) updateMutation.mutate(); else createMutation.mutate(); }

  const rows = Array.isArray(data) ? data : (data as any)?.rows || [];
  const total = (data as any)?.total || rows.length;
  const pages = (data as any)?.pages || Math.ceil(total / 15);

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Clientes</h2><p className="text-sm text-gray-400 mt-1">{total} clientes</p></div>
        <button onClick={openCreate} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 text-sm"><Plus size={16} /> Novo Cliente</button>
      </div>

      <div className="flex items-center bg-[#111827] rounded-lg h-10 px-3 border border-white/5">
        <Search size={18} className="text-gray-400 mr-2" />
        <input type="text" placeholder="Buscar por nome ou CNPJ..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500" />
        {search && <X size={16} className="text-gray-400 cursor-pointer" onClick={() => setSearch('')} />}
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Nome', 'Email', 'Telefone', 'Cidade', 'CNPJ', 'Ativo', 'Ações'].map(h => (
                <th key={h} className="text-left text-[12px] text-gray-400 font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-500 text-sm">Nenhum cliente encontrado</td></tr>
              : rows.map((row: any) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm text-white font-medium">{row.nome}</td>
                  <td className="p-4 text-sm text-gray-300">{row.email || '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{row.telefone || '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{row.cidade}{row.estado ? `/${row.estado}` : ''}</td>
                  <td className="p-4 text-sm text-gray-400 font-mono">{row.cnpj || '-'}</td>
                  <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full ${row.ativo ? 'text-green-400 bg-green-400/15' : 'text-gray-400 bg-gray-400/15'}`}>{row.ativo ? 'Sim' : 'Não'}</span></td>
                  <td className="p-4"><div className="flex items-center gap-2">
                    <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400"><Edit3 size={14} /></button>
                    <button onClick={() => deleteMutation.mutate(row.id)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div></td>
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
              <h3 className="text-lg font-bold">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm text-gray-400 mb-1 block">Nome</label><input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Telefone</label><input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Cidade</label><input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Estado</label><input value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} maxLength={2} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div><label className="text-sm text-gray-400 mb-1 block">CNPJ</label><input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} className="h-4 w-4 rounded border-white/20 bg-[#111827]" /><span className="text-sm text-gray-400">Ativo</span></label>
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
