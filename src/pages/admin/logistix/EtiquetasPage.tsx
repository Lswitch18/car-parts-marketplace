import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { logisticsApi } from '../../../lib/logisticsApi';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  Search, Package, CheckSquare, Square, Printer, Download, X,
} from 'lucide-react';

export default function EtiquetasPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pendente');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [labels, setLabels] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { data: pedidosData } = useQuery({
    queryKey: ['admin', 'pedidos', statusFilter, search, page],
    queryFn: () => adminApi.pedidos.list({ page, limit: 20, search: search || undefined, status: statusFilter }),
  });

  const rows = (pedidosData as any)?.rows || [];
  const total = (pedidosData as any)?.total || 0;

  function toggleSelect(id: string) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  }

  function toggleAll() {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r: any) => r.id)));
  }

  async function handleGenerate() {
    const results: any[] = [];
    for (const id of selected) {
      const pedido = rows.find((r: any) => r.id === id);
      if (!pedido) continue;
      try {
        const shipment = await logisticsApi.shipments.create({
          pedido_id: pedido.id, cliente_id: pedido.cliente_id,
          armazem_origem_id: pedido.armazem_origem_id,
          destino_cidade: pedido.destino_cidade, destino_estado: pedido.destino_estado,
          peso_kg: pedido.peso_kg,
        });
        const preview = await logisticsApi.labels.preview(shipment.id);
        results.push({ ...preview, shipmentId: shipment.id, pedidoCod: pedido.codigo });
      } catch (e: any) {
        console.error(`Erro no pedido ${pedido.codigo}:`, e.message);
      }
    }
    setLabels(results);
    setShowPreview(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Geração de Etiquetas</h2>
          <p className="text-sm text-text-secondary mt-1">{total} pedidos · {selected.size} selecionados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleAll}
            className="h-10 px-4 bg-[#111827] border border-border rounded-lg text-sm text-text-secondary flex items-center gap-2">
            {selected.size === rows.length && rows.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
            Todos
          </button>
          <button onClick={handleGenerate} disabled={selected.size === 0}
            className="h-10 px-4 bg-primary rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
            <Package size={16} /> Gerar Etiquetas ({selected.size})
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#111827] rounded-lg h-10 px-3 border border-border flex-1">
          <Search size={18} className="text-text-secondary mr-2" />
          <input type="text" placeholder="Buscar por código..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-muted" />
          {search && <X size={16} className="text-text-secondary cursor-pointer" onClick={() => setSearch('')} />}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 bg-[#111827] border border-border rounded-lg px-3 text-sm text-white outline-none">
          <option value="pendente">Pendentes</option>
          <option value="">Todos</option>
        </select>
      </div>

      <div className="bg-[#111827] rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 p-4"><input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} className="h-4 w-4 rounded" /></th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">Código</th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">Cliente</th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">Destino</th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">Status</th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">Peso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} className="border-b border-border hover:bg-surface/[0.02]">
                <td className="p-4"><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} className="h-4 w-4 rounded" /></td>
                <td className="p-4 text-sm font-mono font-medium">{row.codigo || '—'}</td>
                <td className="p-4 text-sm text-text-secondary max-w-[150px] truncate">{(typeof row.cliente === 'object' ? row.cliente?.nome : row.cliente) || '—'}</td>
                <td className="p-4 text-sm">{(row.destino_cidade && row.destino_estado) ? `${row.destino_cidade}/${row.destino_estado}` : '—'}</td>
                <td className="p-4">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${row.status === 'pendente' ? 'bg-yellow-400/15 text-yellow-400' : row.status === 'em_transito' ? 'bg-blue-400/15 text-blue-400' : row.status === 'entregue' ? 'bg-green-400/15 text-green-400' : 'bg-gray-400/15 text-text-secondary'}`}>{row.status || '—'}</span>
                </td>
                <td className="p-4 text-sm text-text-secondary">{row.peso_kg ? `${row.peso_kg}kg` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Pré-visualização */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto py-6" onClick={() => setShowPreview(false)}>
          <div className="w-full max-w-3xl mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-[#1F2937] rounded-xl px-5 py-3 border border-border sticky top-0 z-10">
              <p className="text-sm font-medium">{labels.length} etiqueta(s) gerada(s)</p>
              <div className="flex gap-2">
                <button onClick={() => {
                  for (const l of labels) logisticsApi.labels.downloadZpl(l.shipmentId, `etiqueta-${l.codigo}.zpl`);
                }}
                  className="h-10 px-4 bg-[#111827] border border-border rounded-lg text-sm text-gray-300 flex items-center gap-2">
                  <Download size={16} /> Baixar ZPL
                </button>
                <button onClick={() => window.print()}
                  className="h-10 px-4 bg-primary rounded-lg text-sm font-semibold flex items-center gap-2">
                  <Printer size={16} /> Imprimir
                </button>
                <button onClick={() => setShowPreview(false)} className="h-10 px-4 border border-border rounded-lg text-sm text-text-secondary">Fechar</button>
              </div>
            </div>

            {labels.map((label, i) => (
              <LabelCard key={label.shipmentId} label={label} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LabelCard({ label, index }: { label: any; index: number }) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, label.codigo, { format: 'CODE128', width: 2, height: 60, displayValue: true, fontSize: 14, margin: 5 });
      } catch {}
    }
    if (qrRef.current && label.codigo) {
      QRCode.toDataURL(label.codigo, { width: 120, margin: 1, color: { dark: '#111827', light: '#ffffff' } })
        .then(url => { if (qrRef.current) qrRef.current.src = url; });
    }
  }, [label.codigo]);

  return (
    <div className="bg-surface text-text rounded-xl p-5 shadow-xl break-inside-avoid">
      <div className="flex justify-between items-start mb-3 pb-3 border-b-2 border-gray-900">
        <div>
          <p className="text-[10px] text-text-muted font-bold tracking-wider">DAIG LOGISTIX</p>
          <p className="text-base font-black tracking-tight">ETIQUETA DE ENVIO</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold font-mono text-blue-600">{label.codigo}</p>
          <p className="text-[10px] text-text-secondary">#{index + 1} de {index + 1}</p>
        </div>
      </div>

      <div className="flex gap-5 mb-3">
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <img ref={qrRef} width="110" height="110" alt="QR" className="mb-1" />
          <span className="text-[8px] text-text-secondary">Escanear</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-sm space-y-1.5">
          <p><span className="text-text-muted">Destinatário:</span> <span className="font-semibold">{label.cliente}</span></p>
          <p><span className="text-text-muted">Destino:</span> {label.destino}</p>
          <p><span className="text-text-muted">Origem:</span> {label.origem}</p>
          <div className="flex gap-4 text-xs">
            <span><span className="text-text-muted">Peso:</span> {label.peso}</span>
            <span><span className="text-text-muted">SLA:</span> {label.sla}</span>
          </div>
        </div>
      </div>

      {/* Barcode CODE128 */}
      <div className="bg-background rounded-lg p-2 flex justify-center">
        <svg ref={barcodeRef} className="max-w-full" />
      </div>

      <div className="flex justify-between text-[9px] text-text-secondary mt-2 pt-2 border-t border-border">
        <span>{label.data}</span>
        <span className="font-mono">{label.codigo}</span>
        <span>{label.peso}</span>
      </div>

      {/* ZPL code for download */}
      <details className="mt-2 no-print">
        <summary className="text-[10px] text-blue-600 cursor-pointer hover:text-blue-800">ZPL para impressora térmica</summary>
        <pre className="text-[9px] text-gray-600 bg-background p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap">{label.zpl}</pre>
      </details>
    </div>
  );
}
