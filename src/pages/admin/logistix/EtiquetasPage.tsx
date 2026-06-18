import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { logisticsApi } from '../../../lib/logisticsApi';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  Search, Package, CheckSquare, Square, Printer, Download, X,
} from 'lucide-react';
import { useI18n } from '../../../lib/i18n';

export default function EtiquetasPage() {
  const { t } = useI18n();
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
          <h2 className="text-2xl font-bold">{t('Geração de Etiquetas')}</h2>
          <p className="text-sm text-text-secondary mt-1">{total} {t('pedidos')} · {selected.size} {t('selecionados')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleAll}
            className="h-10 px-4 bg-[#111827] border border-border rounded-lg text-sm text-text-secondary flex items-center gap-2">
            {selected.size === rows.length && rows.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
            {t('Todos')}
          </button>
          <button onClick={handleGenerate} disabled={selected.size === 0}
            className="h-10 px-4 bg-primary rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 text-black">
            <Package size={16} /> {t('Gerar Etiquetas')} ({selected.size})
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#111827] rounded-lg h-10 px-3 border border-border flex-1">
          <Search size={18} className="text-text-secondary mr-2" />
          <input type="text" placeholder={t('Buscar por código...')} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-muted font-bold" />
          {search && <X size={16} className="text-text-secondary cursor-pointer" onClick={() => setSearch('')} />}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 bg-[#111827] border border-border rounded-lg px-3 text-sm text-white outline-none">
          <option value="pendente">{t('Pendentes')}</option>
          <option value="">{t('Todos')}</option>
        </select>
      </div>

      <div className="bg-[#111827] rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="w-10 p-4"><input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} className="h-4 w-4 rounded" /></th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">{t('Código')}</th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">{t('Cliente')}</th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">{t('Destino')}</th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">{t('Status')}</th>
              <th className="text-left text-[12px] text-text-secondary font-medium p-4 uppercase">{t('Peso')}</th>
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
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${row.status === 'pendente' ? 'bg-yellow-400/15 text-yellow-400' : row.status === 'em_transito' ? 'bg-blue-400/15 text-blue-400' : row.status === 'entregue' ? 'bg-green-400/15 text-green-400' : 'bg-gray-400/15 text-text-secondary'}`}>{t(row.status || '—')}</span>
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
              <p className="text-sm font-medium">{labels.length} {t('etiqueta(s) gerada(s)')}</p>
              <div className="flex gap-2">
                <button onClick={() => {
                  for (const l of labels) logisticsApi.labels.downloadZpl(l.shipmentId, `etiqueta-${l.codigo}.zpl`);
                }}
                  className="h-10 px-4 bg-[#111827] border border-border rounded-lg text-sm text-gray-300 flex items-center gap-2">
                  <Download size={16} /> {t('Baixar ZPL')}
                </button>
                <button onClick={() => window.print()}
                  className="h-10 px-4 bg-primary rounded-lg text-sm font-semibold flex items-center gap-2 text-black">
                  <Printer size={16} /> {t('Imprimir')}
                </button>
                <button onClick={() => setShowPreview(false)} className="h-10 px-4 border border-border rounded-lg text-sm text-text-secondary">{t('Fechar')}</button>
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

function getWarehouseLocation(code: string) {
  const racks = ['A', 'B', 'C', 'D', 'E', 'F'];
  const bays = ['01', '02', '03', '04', '05', '06'];
  const levels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const positions = ['1', '2'];

  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const rack = racks[hash % racks.length];
  const bay = bays[(hash >> 2) % bays.length];
  const level = levels[(hash >> 4) % levels.length];
  const position = positions[(hash >> 6) % positions.length];

  return {
    rack,
    bay,
    level,
    position,
    formatted: `${rack}-${bay}-${level}${position}`,
  };
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  A: { bg: 'bg-red-500/20', text: 'text-red-400 border-red-500/40', hex: '#EF4444' },
  B: { bg: 'bg-orange-500/20', text: 'text-orange-400 border-orange-500/40', hex: '#F97316' },
  C: { bg: 'bg-yellow-500/20', text: 'text-yellow-400 border-yellow-500/40', hex: '#FACC15' },
  D: { bg: 'bg-green-500/20', text: 'text-green-400 border-green-500/40', hex: '#22C55E' },
  E: { bg: 'bg-blue-500/20', text: 'text-blue-400 border-blue-500/40', hex: '#3B82F6' },
  F: { bg: 'bg-purple-500/20', text: 'text-purple-400 border-purple-500/40', hex: '#8B5CF6' },
};

function LabelCard({ label, index }: { label: any; index: number }) {
  const { t } = useI18n();
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrRef = useRef<HTMLImageElement>(null);

  const loc = getWarehouseLocation(label.codigo || '');
  const colorScheme = LEVEL_COLORS[loc.level] || LEVEL_COLORS.A;

  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, label.codigo, { format: 'CODE128', width: 2, height: 60, displayValue: true, fontSize: 14, margin: 5 });
      } catch {}
    }
    if (qrRef.current && label.codigo) {
      // QR Code with daig.jp domain name as requested
      QRCode.toDataURL(`https://daig.jp/tracking/${label.codigo}`, { width: 120, margin: 1, color: { dark: '#111827', light: '#ffffff' } })
        .then(url => { if (qrRef.current) qrRef.current.src = url; });
    }
  }, [label.codigo]);

  return (
    <div className="bg-[#111827] text-white rounded-xl p-6 shadow-2xl border border-border break-inside-avoid">
      <div className="flex justify-between items-start mb-4 pb-3 border-b border-border/60">
        <div>
          <p className="text-[10px] text-primary font-bold tracking-widest">DAIG LOGISTIX</p>
          <p className="text-lg font-extrabold tracking-tight">{t('ETIQUETA DE ENVIO')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold font-mono text-primary">{label.codigo}</p>
          <p className="text-[10px] text-text-secondary">{t('Vol.')} #{index + 1} de {index + 1}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {/* QR Code & Location Badge */}
        <div className="flex flex-col items-center justify-center bg-black/20 p-3 rounded-xl border border-border/40">
          <img ref={qrRef} width="100" height="100" alt="QR" className="mb-2 bg-white p-1 rounded" />
          <span className="text-[9px] text-text-secondary font-medium uppercase tracking-wider mb-2">{t('Escanear CD')}</span>
          
          {/* Warehouse Address Badge */}
          <div className={`mt-1 px-3 py-1.5 rounded-lg border flex flex-col items-center justify-center w-full ${colorScheme.bg} ${colorScheme.text}`}>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{t('Endereço WMS')}</span>
            <span className="text-sm font-extrabold font-mono tracking-wide mt-0.5">{loc.formatted}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full border border-current" style={{ backgroundColor: colorScheme.hex }} />
              <span className="text-[8px] font-bold uppercase">{t('Nível')} {loc.level}</span>
            </div>
          </div>
        </div>

        {/* Info Envio / Recebimento */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-black/10 p-3 rounded-xl border border-border/30 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">{t('Destinatário')}</h4>
            <div className="text-xs space-y-1">
              <p><span className="text-text-muted">{t('Nome')}:</span> <span className="font-semibold text-white">{label.cliente}</span></p>
              <p><span className="text-text-muted">{t('Endereço')}:</span> <span className="text-white">{label.destino}</span></p>
            </div>
          </div>

          <div className="bg-black/10 p-3 rounded-xl border border-border/30 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{t('Remetente / Origem')}</h4>
            <div className="text-xs space-y-1">
              <p><span className="text-text-muted">{t('Nome')}:</span> <span className="font-semibold text-white">Auto Peças Premium S.A.</span></p>
              <p><span className="text-text-muted">{t('Origem')}:</span> <span className="text-white">{t('CD Principal')} — {label.origem}</span></p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-black/15 px-3 py-2 rounded-xl border border-border/20 text-xs">
            <span><span className="text-text-muted">{t('Peso')}:</span> <strong className="text-white">{label.peso}</strong></span>
            <span><span className="text-text-muted">{t('Prazo SLA')}:</span> <strong className="text-white">{label.sla}</strong></span>
          </div>
        </div>
      </div>

      {/* Barcode CODE128 */}
      <div className="bg-white rounded-xl p-3 flex justify-center border border-border/50">
        <svg ref={barcodeRef} className="max-w-full" />
      </div>

      <div className="flex justify-between text-[9px] text-text-secondary mt-3 pt-3 border-t border-border/40">
        <span>{label.data}</span>
        <span className="font-mono">{label.codigo}</span>
        <span>{label.peso}</span>
      </div>

      {/* ZPL code for download */}
      <details className="mt-3 no-print">
        <summary className="text-[10px] text-primary cursor-pointer hover:underline font-semibold">{t('Visualizar ZPL para Impressora Térmica')}</summary>
        <pre className="text-[9px] text-text-secondary bg-black/30 border border-border/50 p-2.5 rounded-lg mt-1.5 overflow-x-auto whitespace-pre-wrap font-mono">{label.zpl}</pre>
      </details>
    </div>
  );
}

