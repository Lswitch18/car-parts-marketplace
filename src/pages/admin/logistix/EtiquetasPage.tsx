import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { logisticsApi } from '../../../lib/logisticsApi';
import { Search, Package, CheckSquare, Square, Printer, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EtiquetasPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pendente');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [labelsData, setLabelsData] = useState<any[]>([]);
  const [printMode, setPrintMode] = useState(false);

  const { data: pedidosData, isLoading } = useQuery({
    queryKey: ['admin', 'pedidos', statusFilter, search, page],
    queryFn: () => adminApi.pedidos.list({ page, limit: 20, search: search || undefined, status: statusFilter }),
  });

  const rows = (pedidosData as any)?.rows || [];
  const total = (pedidosData as any)?.total || 0;
  const pages = Math.ceil(total / 20);

  const createShipmentMutation = useMutation({
    mutationFn: async (pedidoId: string) => {
      const pedido = rows.find((r: any) => r.id === pedidoId);
      if (!pedido) throw new Error('Pedido não encontrado');
      return logisticsApi.shipments.create({
        pedido_id: pedido.id,
        cliente_id: pedido.cliente_id,
        armazem_origem_id: pedido.armazem_origem_id,
        destino_cidade: pedido.destino_cidade,
        destino_estado: pedido.destino_estado,
        peso_kg: pedido.peso_kg,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pedidos'] });
    },
  });

  async function handleGenerateLabels() {
    setGenerating(true);
    const results: any[] = [];
    for (const id of selected) {
      try {
        const shipment = await createShipmentMutation.mutateAsync(id);
        results.push(shipment);
      } catch (e) {
        console.error('[Etiquetas] Erro ao gerar:', e);
      }
    }
    setLabelsData(results);
    setGenerating(false);
    setShowGenerate(false);
    if (results.length > 0) setPrintMode(true);
  }

  function toggleSelect(id: string) {
    const newSel = new Set(selected);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelected(newSel);
  }

  function toggleAll() {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r: any) => r.id)));
    }
  }

  function handleOpenLabelPage() {
    const shipmentIds = labelsData.map((s: any) => s.id);
    const url = `/oms/labels?ids=${shipmentIds.join(',')}`;
    window.open(url, '_blank');
  }

  function printLabels() {
    window.print();
  }

  // Print view
  if (printMode && labelsData.length > 0) {
    return (
      <div className="bg-white min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 no-print">
            <button onClick={() => setPrintMode(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Voltar</button>
            <button onClick={printLabels}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
              <Printer size={16} /> Imprimir
            </button>
          </div>

          <div className="grid gap-4">
            {labelsData.map((s: any, i: number) => (
              <div key={s.id} className="border-2 border-gray-300 rounded-lg p-4 print:border-black">
                <div className="flex justify-between items-start mb-3 pb-2 border-b-2 border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 font-bold">DAIG LOGISTIX</p>
                    <p className="text-lg font-black tracking-tight">ETIQUETA DE ENVIO</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono">{s.codigo || `#DAIG-${Date.now()}`}</p>
                    <p className="text-xs text-gray-400 mt-1">Lote #{i + 1}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Origem</p>
                    <p className="font-semibold">{s.armazem_origem_id || 'CD Yokohama - Porto'}</p>
                    <p className="text-xs text-gray-500">Yokohama, Kanagawa, Japão</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium">Destino</p>
                    <p className="font-semibold">{s.destino_cidade || 'Inuyama'}</p>
                    <p className="text-xs text-gray-500">{s.destino_estado || 'Aichi'}, Japão</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                  <span>Peso: {s.peso_kg || '1.5'}kg</span>
                  <span>SLA: {s.sla_horas || '48'}h</span>
                  <span>{s.codigo || `#DAIG-${Date.now()}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media print { .no-print { display: none !important; } }`}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Geração de Etiquetas</h2>
          <p className="text-sm text-gray-400 mt-1">{total} pedidos · {selected.size} selecionados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleAll}
            className="h-10 px-4 bg-[#111827] border border-white/10 rounded-lg text-sm text-gray-400 flex items-center gap-2">
            {selected.size === rows.length && rows.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
            Selecionar todos
          </button>
          <button onClick={() => setShowGenerate(true)} disabled={selected.size === 0 || generating}
            className="h-10 px-4 bg-blue-500 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
            {generating ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Gerando...</>
            ) : (
              <><Package size={16} /> Gerar Etiquetas ({selected.size})</>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#111827] rounded-lg h-10 px-3 border border-white/5 flex-1">
          <Search size={18} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Buscar por código..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500" />
          {search && <X size={16} className="text-gray-400 cursor-pointer" onClick={() => setSearch('')} />}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 bg-[#111827] border border-white/10 rounded-lg px-3 text-sm text-white outline-none">
          <option value="pendente">Pendentes</option>
          <option value="">Todos status</option>
          <option value="em_transito">Em trânsito</option>
          <option value="entregue">Entregues</option>
        </select>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="w-10 p-4">
                  <input type="checkbox" checked={selected.size === rows.length && rows.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-white/20 bg-[#111827]" />
                </th>
                {['Código', 'Cliente', 'Origem', 'Destino', 'Status', 'Peso', 'Ações'].map(h => (
                  <th key={h} className="text-left text-[12px] text-gray-400 font-medium p-4 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500 text-sm">Nenhum pedido encontrado</td></tr>
              ) : rows.map((row: any) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <input type="checkbox" checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="h-4 w-4 rounded border-white/20 bg-[#111827]" />
                  </td>
                  <td className="p-4 text-sm font-mono font-medium">{row.codigo || '—'}</td>
                  <td className="p-4 text-sm text-gray-400 max-w-[150px] truncate">{row.cliente?.nome || '—'}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {row.armazem_origem ? (typeof row.armazem_origem === 'object' ? row.armazem_origem.nome : row.armazem_origem) : '—'}
                  </td>
                  <td className="p-4 text-sm">{(row.destino_cidade && row.destino_estado) ? `${row.destino_cidade}/${row.destino_estado}` : '—'}</td>
                  <td className="p-4">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      row.status === 'pendente' ? 'bg-yellow-400/15 text-yellow-400' :
                      row.status === 'em_transito' ? 'bg-blue-400/15 text-blue-400' :
                      row.status === 'entregue' ? 'bg-green-400/15 text-green-400' :
                      'bg-gray-400/15 text-gray-400'
                    }`}>{row.status || '—'}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{row.peso_kg ? `${row.peso_kg}kg` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <span className="text-sm text-gray-400">Página {page} de {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30"><ChevronLeft size={16} className="text-gray-400" /></button>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-30"><ChevronRight size={16} className="text-gray-400" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
