import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react';

const STATUS_OPTIONS = ['pendente', 'em_transito', 'entregue', 'atrasado', 'cancelado', 'recebido'];
const STATUS_COLOR: Record<string, string> = {
  pendente: '#FACC15', em_transito: '#3B82F6', entregue: '#22C55E',
  atrasado: '#F97316', cancelado: '#EF4444', recebido: '#8B5CF6',
};

interface PedidoForm {
  codigo: string; cliente_id: string; armazem_origem_id: string;
  destino_cidade: string; destino_estado: string; status: string;
  peso_kg: number; valor: number; previsao: string;
}

const emptyForm: PedidoForm = {
  codigo: '', cliente_id: '', armazem_origem_id: '',
  destino_cidade: '', destino_estado: '', status: 'pendente',
  peso_kg: 0, valor: 0, previsao: '',
};

export default function PedidosPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PedidoForm>(emptyForm);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pedidos', page, search, statusFilter],
    queryFn: () => adminApi.pedidos.list({ page, limit: 15, search, status: statusFilter }),
  });

  const { data: clientes } = useQuery({
    queryKey: ['admin', 'clientes-list'],
    queryFn: () => adminApi.clientes.list({ limit: 200 }),
  });

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const createMutation = useMutation({
    mutationFn: (d: PedidoForm) => adminApi.pedidos.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'pedidos'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<PedidoForm> }) => adminApi.pedidos.update(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'pedidos'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.pedidos.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'pedidos'] }); setShowDelete(null); },
  });

  function openCreate() {
    setEditingId(null); setForm(emptyForm); setShowModal(true);
  }

  function openEdit(row: any) {
    setEditingId(row.id);
    setForm({
      codigo: row.codigo || '',
      cliente_id: row.cliente_id || '',
      armazem_origem_id: row.armazem_origem_id || '',
      destino_cidade: row.destino_cidade || '',
      destino_estado: row.destino_estado || '',
      status: row.status || 'pendente',
      peso_kg: row.peso_kg || 0,
      valor: row.valor || 0,
      previsao: row.previsao ? row.previsao.split('T')[0] : '',
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); setForm(emptyForm); }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <p className="text-sm text-gray-400 mt-1">{total} pedidos no total</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors text-sm">
          <Plus size={16} /> Novo Pedido
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#111827] rounded-lg h-10 flex-1 px-3 border border-white/5">
          <Search size={18} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Buscar por código..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500" />
          {search && <X size={16} className="text-gray-400 cursor-pointer" onClick={() => setSearch('')} />}
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#111827] border border-white/5 rounded-lg h-10 px-3 text-sm text-white outline-none">
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Código', 'Cliente', 'Origem', 'Destino', 'Status', 'Peso', 'Valor', 'Previsão', 'Ações'].map(h => (
                  <th key={h} className="text-left text-[12px] text-gray-400 font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-500 text-sm">Nenhum pedido encontrado</td></tr>
              ) : rows.map((row: any) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm font-mono text-blue-400 whitespace-nowrap">{row.codigo}</td>
                  <td className="p-4 text-sm text-gray-300">{row.cliente?.nome || row.cliente_id?.substring(0, 8) || '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{row.armazem?.nome || '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{row.destino_cidade}{row.destino_estado ? ` - ${row.destino_estado}` : ''}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-medium" style={{
                      color: STATUS_COLOR[row.status] || '#6B7280',
                      background: `${STATUS_COLOR[row.status] || '#6B7280'}18`,
                      border: `1px solid ${STATUS_COLOR[row.status] || '#6B7280'}33`,
                    }}>{row.status?.replace('_', ' ')}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{row.peso_kg ? `${row.peso_kg}kg` : '-'}</td>
                  <td className="p-4 text-sm text-green-400 font-mono">{row.valor ? `R$ ${Number(row.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
                  <td className="p-4 text-sm text-gray-400">{row.previsao ? new Date(row.previsao).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(row)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400 transition-colors" title="Editar"><Edit3 size={14} /></button>
                      <button onClick={() => window.open(`/admin/logistix/rastreamento?codigo=${row.codigo}`, '_blank')}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-green-400 transition-colors" title="Rastrear"><MapPin size={14} /></button>
                      <button onClick={() => setShowDelete(row.id)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors" title="Excluir"><Trash2 size={14} /></button>
                    </div>
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
              <h3 className="text-lg font-bold">{editingId ? 'Editar Pedido' : 'Novo Pedido'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Código</label>
                <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} placeholder="#PED-..." className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Cliente</label>
                  <select value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="">Selecione...</option>
                    {(Array.isArray(clientes) ? clientes : (clientes as any)?.rows || []).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Armazém Origem</label>
                  <select value={form.armazem_origem_id} onChange={e => setForm({ ...form, armazem_origem_id: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="">Selecione...</option>
                    {(armazens || []).map((a: any) => (
                      <option key={a.id} value={a.id}>{a.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Cidade Destino</label>
                  <input value={form.destino_cidade} onChange={e => setForm({ ...form, destino_cidade: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Estado</label>
                  <input value={form.destino_estado} onChange={e => setForm({ ...form, destino_estado: e.target.value })} maxLength={2} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Peso (kg)</label>
                  <input type="number" value={form.peso_kg} onChange={e => setForm({ ...form, peso_kg: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Valor (R$)</label>
                  <input type="number" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Previsão de Entrega</label>
                <input type="date" value={form.previsao} onChange={e => setForm({ ...form, previsao: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 justify-end">
              <button onClick={closeModal} className="h-10 px-4 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                {(createMutation.isPending || updateMutation.isPending) && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editingId ? 'Atualizar' : 'Criar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowDelete(null)}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-sm mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-gray-400 mb-6">Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowDelete(null)} className="h-10 px-4 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={() => deleteMutation.mutate(showDelete)} disabled={deleteMutation.isPending}
                className="h-10 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
