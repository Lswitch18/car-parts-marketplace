import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Plus, X } from 'lucide-react';

export default function TransferenciasPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ armazem_origem_id: '', armazem_destino_id: '', produto: '', quantidade: 1, observacao: '' });

  const { data: transferencias, isLoading } = useQuery({
    queryKey: ['admin', 'transferencias'],
    queryFn: () => adminApi.transferencias.list(),
  });

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.transferencias.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'transferencias'] }); closeModal(); },
  });

  function closeModal() { setShowModal(false); setForm({ armazem_origem_id: '', armazem_destino_id: '', produto: '', quantidade: 1, observacao: '' }); }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const list = Array.isArray(transferencias) ? transferencias : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Transferências</h2><p className="text-sm text-gray-400 mt-1">{list.length} transferências</p></div>
        <button onClick={() => setShowModal(true)} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 text-sm"><Plus size={16} /> Nova Transferência</button>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {['Produto', 'Quantidade', 'Origem', 'Destino', 'Data', 'Status'].map(h => (
                <th key={h} className="text-left text-[12px] text-gray-400 font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {list.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">Nenhuma transferência</td></tr>
              : list.map((row: any, idx: number) => (
                <tr key={row.id || idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm text-white">{row.produto}</td>
                  <td className="p-4 text-sm text-gray-300">{row.quantidade}</td>
                  <td className="p-4 text-sm text-gray-400">{row.origem?.nome || row.armazem_origem_id?.substring(0, 8)}</td>
                  <td className="p-4 text-sm text-gray-400">{row.destino?.nome || row.armazem_destino_id?.substring(0, 8)}</td>
                  <td className="p-4 text-sm text-gray-400 whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="p-4"><span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">Pendente</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-lg mx-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Nova Transferência</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Origem</label>
                  <select value={form.armazem_origem_id} onChange={e => setForm({ ...form, armazem_origem_id: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="">Selecione...</option>
                    {(armazens || []).map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
                <div><label className="text-sm text-gray-400 mb-1 block">Destino</label>
                  <select value={form.armazem_destino_id} onChange={e => setForm({ ...form, armazem_destino_id: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                    <option value="">Selecione...</option>
                    {(armazens || []).map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Produto</label><input value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Quantidade</label><input type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div><label className="text-sm text-gray-400 mb-1 block">Observação</label><textarea value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} rows={2} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 resize-none" /></div>
            </div>
            <div className="flex items-center gap-3 mt-6 justify-end">
              <button onClick={closeModal} className="h-10 px-4 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Criar Transferência</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
