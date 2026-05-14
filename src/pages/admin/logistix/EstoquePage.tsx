import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Search, Plus, Edit3, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EstoquePage() {
  const queryClient = useQueryClient();
  const [armazemFilter, setArmazemFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ armazem_id: '', produto: '', sku: '', quantidade: 1 });

  const { data: estoque, isLoading } = useQuery({
    queryKey: ['admin', 'estoque', armazemFilter],
    queryFn: () => adminApi.estoque.list(armazemFilter || undefined),
  });

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.estoque.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'estoque'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => { if (!editingId) throw new Error('No id'); return adminApi.estoque.update(editingId, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'estoque'] }); closeModal(); },
  });

  function openCreate() { setEditingId(null); setForm({ armazem_id: armazemFilter || '', produto: '', sku: '', quantidade: 1 }); setShowModal(true); }
  function openEdit(row: any) {
    setEditingId(row.id); setForm({ armazem_id: row.armazem_id || '', produto: row.produto || '', sku: row.sku || '', quantidade: row.quantidade || 1 }); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingId(null); }
  function handleSave() { if (editingId) updateMutation.mutate(); else createMutation.mutate(); }

  const allItems = Array.isArray(estoque) ? estoque : [];
  const filtered = searchTerm ? allItems.filter((i: any) => i.produto?.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku?.toLowerCase().includes(searchTerm.toLowerCase())) : allItems;

  const perPage = 15;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalItems = allItems.reduce((s: number, i: any) => s + (i.quantidade || 0), 0);

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Estoque</h2><p className="text-sm text-gray-400 mt-1">{totalItems} unidades em {allItems.length} itens</p></div>
        <button onClick={openCreate} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 text-sm"><Plus size={16} /> Novo Item</button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#111827] rounded-lg h-10 flex-1 px-3 border border-white/5">
          <Search size={18} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Buscar por produto ou SKU..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500" />
          {searchTerm && <X size={16} className="text-gray-400 cursor-pointer" onClick={() => setSearchTerm('')} />}
        </div>
        <select value={armazemFilter} onChange={e => { setArmazemFilter(e.target.value); setPage(1); }}
          className="bg-[#111827] border border-white/5 rounded-lg h-10 px-3 text-sm text-white outline-none">
          <option value="">Todos armazéns</option>
          {(armazens || []).map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Produto', 'SKU', 'Armazém', 'Quantidade', 'Ações'].map(h => (
                <th key={h} className="text-left text-[12px] text-gray-400 font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {paged.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-gray-500 text-sm">Nenhum item no estoque</td></tr>
              : paged.map((row: any) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm text-white">{row.produto}</td>
                  <td className="p-4 text-sm font-mono text-gray-400">{row.sku || '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{row.armazem?.nome || row.armazem_id?.substring(0, 8) || '-'}</td>
                  <td className="p-4"><span className={`text-sm font-mono ${(row.quantidade || 0) > 10 ? 'text-green-400' : (row.quantidade || 0) > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{row.quantidade || 0}</span></td>
                  <td className="p-4"><button onClick={() => openEdit(row)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400"><Edit3 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <span className="text-sm text-gray-400">Página {page} de {totalPages}</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30 text-gray-400"><ChevronLeft size={16} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30 text-gray-400"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-lg mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Item' : 'Novo Item'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm text-gray-400 mb-1 block">Produto</label><input value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Quantidade</label><input type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div><label className="text-sm text-gray-400 mb-1 block">Armazém</label>
                <select value={form.armazem_id} onChange={e => setForm({ ...form, armazem_id: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Selecione...</option>
                  {(armazens || []).map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
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
