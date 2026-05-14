import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Search, Plus, Edit3, X, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_ENTREGA = ['pendente', 'em_transito', 'entregue', 'atrasado', 'cancelado'];
const STATUS_COLOR: Record<string, string> = {
  pendente: '#FACC15', em_transito: '#3B82F6', entregue: '#22C55E',
  atrasado: '#F97316', cancelado: '#EF4444',
};

export default function EntregasPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    pedido_id: '', transporte_id: '', status: 'pendente', entregue_em: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'entregas', page, statusFilter],
    queryFn: () => adminApi.entregas.list({ page, limit: 15, status: statusFilter }),
  });

  const { data: pedidos } = useQuery({
    queryKey: ['admin', 'pedidos-dropdown'],
    queryFn: () => adminApi.pedidos.list({ limit: 200 }),
  });

  const { data: transportes } = useQuery({
    queryKey: ['admin', 'transportes-list'],
    queryFn: () => adminApi.transportes.list(),
  });

  const createMutation = useMutation({
    mutationFn: (d: typeof form) => adminApi.entregas.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'entregas'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<typeof form> }) => adminApi.entregas.update(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'entregas'] }); closeModal(); },
  });

  function openCreate() {
    setEditingId(null);
    setForm({ pedido_id: '', transporte_id: '', status: 'pendente', entregue_em: '' });
    setShowModal(true);
  }

  function openEdit(row: any) {
    setEditingId(row.id);
    setForm({
      pedido_id: row.pedido_id || '',
      transporte_id: row.transporte_id || '',
      status: row.status || 'pendente',
      entregue_em: row.entregue_em ? row.entregue_em.split('T')[0] : '',
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); }

  function handleSave() {
    if (editingId) {
      updateMutation.mutate({ id: editingId, d: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const rows = Array.isArray(data) ? data : (data as any)?.rows || [];
  const total = (data as any)?.total || rows.length;
  const pages = (data as any)?.pages || Math.ceil(total / 15);

  const filteredRows = searchTerm
    ? rows.filter((r: any) => r.pedido?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()))
    : rows;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: total,
    em_transito: rows.filter((r: any) => r.status === 'em_transito').length,
    entregue: rows.filter((r: any) => r.status === 'entregue').length,
    pendente: rows.filter((r: any) => r.status === 'pendente' || !r.status).length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Entregas</h2>
          <p className="text-sm text-gray-400 mt-1">{total} entregas registradas</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors text-sm">
          <Plus size={16} /> Nova Entrega
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
          <p className="text-[13px] text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
          <p className="text-[13px] text-gray-400">Em Trânsito</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.em_transito}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
          <p className="text-[13px] text-gray-400">Entregues</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.entregue}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
          <p className="text-[13px] text-gray-400">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pendente}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#111827] rounded-lg h-10 flex-1 px-3 border border-white/5">
          <Search size={18} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Buscar por código do pedido..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500" />
          {searchTerm && <X size={16} className="text-gray-400 cursor-pointer" onClick={() => setSearchTerm('')} />}
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#111827] border border-white/5 rounded-lg h-10 px-3 text-sm text-white outline-none">
          <option value="">Todos os status</option>
          {STATUS_ENTREGA.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Pedido', 'Transporte', 'Status', 'Entregue em', 'Ações'].map(h => (
                  <th key={h} className="text-left text-[12px] text-gray-400 font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500 text-sm">Nenhuma entrega encontrada</td></tr>
              ) : filteredRows.map((row: any) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm font-mono text-blue-400">{row.pedido?.codigo || row.pedido_id?.substring(0, 8) || '-'}</td>
                  <td className="p-4 text-sm text-gray-300">{row.transporte?.nome || row.transporte_id?.substring(0, 8) || '-'}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-medium" style={{
                      color: STATUS_COLOR[row.status] || '#6B7280',
                      background: `${STATUS_COLOR[row.status] || '#6B7280'}18`,
                      border: `1px solid ${STATUS_COLOR[row.status] || '#6B7280'}33`,
                    }}>{row.status?.replace('_', ' ')}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{row.entregue_em ? new Date(row.entregue_em).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="p-4">
                    <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400 transition-colors" title="Editar">
                      <Edit3 size={14} />
                    </button>
                  </td>
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
              <h3 className="text-lg font-bold">{editingId ? 'Editar Entrega' : 'Nova Entrega'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Pedido</label>
                <select value={form.pedido_id} onChange={e => setForm({ ...form, pedido_id: e.target.value })}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Selecione...</option>
                  {(Array.isArray(pedidos) ? pedidos : (pedidos as any)?.rows || []).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.codigo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Transporte</label>
                <select value={form.transporte_id} onChange={e => setForm({ ...form, transporte_id: e.target.value })}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  <option value="">Selecione...</option>
                  {(transportes || []).map((t: any) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  {STATUS_ENTREGA.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Data de Entrega</label>
                <input type="date" value={form.entregue_em} onChange={e => setForm({ ...form, entregue_em: e.target.value })}
                  className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 justify-end">
              <button onClick={closeModal} className="h-10 px-4 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                {(createMutation.isPending || updateMutation.isPending) && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editingId ? 'Atualizar' : 'Criar Entrega'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
