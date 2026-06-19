import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { logisticsApi } from '@/modules/logistics/api/logisticsApi';
import { Box, ArrowRight, ScanLine, CheckCircle, Layers, Grid, MapPin } from 'lucide-react';
import { useI18n } from '@/modules/shared/lib/i18n';

const RACKS = ['A', 'B', 'C', 'D', 'E', 'F'];
const BAYS = ['01', '02', '03', '04', '05', '06'];
const LEVELS = ['F', 'E', 'D', 'C', 'B', 'A']; // Display top-down
const POSITIONS = ['1', '2'];

const LEVEL_COLORS: Record<string, { bg: string; text: string; hex: string; border: string }> = {
  A: { bg: 'bg-red-500/10 hover:bg-red-500/20', text: 'text-red-400', hex: '#EF4444', border: 'border-red-500/30' },
  B: { bg: 'bg-orange-500/10 hover:bg-orange-500/20', text: 'text-orange-400', hex: '#F97316', border: 'border-orange-500/30' },
  C: { bg: 'bg-yellow-500/10 hover:bg-yellow-500/20', text: 'text-yellow-400', hex: '#FACC15', border: 'border-yellow-500/30' },
  D: { bg: 'bg-green-500/10 hover:bg-green-500/20', text: 'text-green-400', hex: '#22C55E', border: 'border-green-500/30' },
  E: { bg: 'bg-blue-500/10 hover:bg-blue-500/20', text: 'text-blue-400', hex: '#3B82F6', border: 'border-blue-500/30' },
  F: { bg: 'bg-purple-500/10 hover:bg-purple-500/20', text: 'text-purple-400', hex: '#8B5CF6', border: 'border-purple-500/30' },
};

function getWarehouseLocation(code: string) {
  if (!code) return { rack: 'A', bay: '03', level: 'D', position: '1', formatted: 'A-03-D1' };
  
  // If the slot format is saved in the code
  if (code.startsWith('WMS-')) {
    const parts = code.replace('WMS-', '').split('-');
    if (parts.length >= 3) {
      const rack = parts[0];
      const bay = parts[1];
      const lp = parts[2];
      const level = lp[0] || 'A';
      const position = lp[1] || '1';
      return { rack, bay, level, position, formatted: `${rack}-${bay}-${level}${position}` };
    }
  }

  // Deterministic fallback
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const rack = RACKS[hash % RACKS.length];
  const bay = BAYS[(hash >> 2) % BAYS.length];
  const level = LEVELS[LEVELS.length - 1 - (hash >> 4) % LEVELS.length];
  const position = POSITIONS[(hash >> 6) % POSITIONS.length];

  return {
    rack,
    bay,
    level,
    position,
    formatted: `${rack}-${bay}-${level}${position}`,
  };
}

interface WarehouseGridProps {
  selectedRack: string;
  selectedBay: string;
  selectedLevel: string;
  selectedPosition: string;
  onChange?: (rack: string, bay: string, level: string, position: string) => void;
  highlightSlot?: string; // e.g. "A-03-D1"
  readOnly?: boolean;
}

function WarehouseGrid({
  selectedRack,
  selectedBay,
  selectedLevel,
  selectedPosition,
  onChange,
  highlightSlot,
  readOnly = false,
}: WarehouseGridProps) {
  const { t } = useI18n();
  const [activeRack, setActiveRack] = useState(selectedRack);
  const highlighted = highlightSlot ? getWarehouseLocation('WMS-' + highlightSlot) : null;

  const currentRack = highlighted ? highlighted.rack : activeRack;

  return (
    <div className="bg-[#111827] border border-border/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Grid className="text-primary" size={18} />
          <h4 className="text-sm font-bold text-white">{t('Endereçamento do Armazém')}</h4>
        </div>
        {!highlighted && !readOnly && (
          <span className="text-xs bg-primary/10 text-primary font-mono px-2 py-0.5 rounded-full border border-primary/20">
            {t('Selecionado')}: {activeRack}-{selectedBay}-{selectedLevel}{selectedPosition}
          </span>
        )}
        {highlighted && (
          <span className="text-xs bg-green-500/10 text-green-400 font-mono px-2 py-0.5 rounded-full border border-green-500/20">
            {t('Localizado')}: {highlighted.formatted}
          </span>
        )}
      </div>

      {/* Rack Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {RACKS.map((r) => {
          const isSelected = r === currentRack;
          const isHighlighted = highlighted && highlighted.rack === r;
          return (
            <button
              key={r}
              disabled={readOnly || !!highlighted}
              onClick={() => {
                setActiveRack(r);
                if (onChange) onChange(r, selectedBay, selectedLevel, selectedPosition);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isSelected
                  ? isHighlighted
                    ? 'bg-green-500 text-black border-green-600'
                    : 'bg-primary text-black border-primary'
                  : 'bg-black/35 text-text-secondary border-border/40 hover:text-white'
              }`}
            >
              {t('Corredor')} {r}
            </button>
          );
        })}
      </div>

      {/* Grid of Bays and Levels */}
      <div className="space-y-2">
        {LEVELS.map((lv) => {
          const cfg = LEVEL_COLORS[lv] || LEVEL_COLORS.A;
          return (
            <div key={lv} className="flex items-center gap-2">
              <span className="w-8 text-[11px] font-bold text-text-secondary uppercase tracking-wider text-right font-mono pr-1">
                {t('Nível')} {lv}
              </span>
              <div className="grid grid-cols-6 gap-2 flex-1">
                {BAYS.map((b) => {
                  const isHighlightedCell =
                    highlighted &&
                    highlighted.rack === currentRack &&
                    highlighted.bay === b &&
                    highlighted.level === lv;

                  const isSelectedCell =
                    !highlighted &&
                    activeRack === currentRack &&
                    selectedBay === b &&
                    selectedLevel === lv;

                  return (
                    <div
                      key={b}
                      className={`relative flex flex-col items-center justify-center border rounded-lg p-1 min-h-[52px] transition-all ${
                        isHighlightedCell
                          ? 'bg-green-500/20 border-green-500 shadow-md shadow-green-500/10 scale-[1.02] z-10'
                          : isSelectedCell
                          ? 'bg-primary/20 border-primary shadow-md shadow-primary/10 scale-[1.02] z-10'
                          : `${cfg.bg} ${cfg.border}`
                      }`}
                    >
                      <span className="text-[10px] text-text-muted font-bold font-mono">B{b}</span>
                      
                      {/* Subpositions 1 and 2 */}
                      <div className="flex gap-1.5 mt-1.5 w-full">
                        {POSITIONS.map((p) => {
                          const isHSub = isHighlightedCell && highlighted.position === p;
                          const isSSub = isSelectedCell && selectedPosition === p;

                          return (
                            <button
                              key={p}
                              disabled={readOnly}
                              onClick={() => {
                                if (onChange && !readOnly) {
                                  onChange(currentRack, b, lv, p);
                                }
                              }}
                              className={`flex-1 text-[9px] py-0.5 rounded text-center font-bold transition-all ${
                                isHSub
                                  ? 'bg-green-500 text-black font-extrabold ring-2 ring-green-400'
                                  : isSSub
                                  ? 'bg-primary text-black font-extrabold ring-2 ring-primary-light'
                                  : 'bg-black/40 text-text-secondary hover:text-white'
                              }`}
                            >
                              P{p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Legend */}
      <div className="flex flex-wrap gap-3 pt-2 text-[10px] text-text-muted justify-between border-t border-border/30">
        <div className="flex gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-red-500" /> A ({t('Térreo')})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-orange-500" /> B
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-yellow-500" /> C
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-green-500" /> D
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-blue-500" /> E
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-purple-500" /> F ({t('Topo')})
          </span>
        </div>
        <span className="font-semibold text-text-secondary">{t('Corredor A-F · Baia 01-06 · Posição 1-2')}</span>
      </div>
    </div>
  );
}

export default function WMSPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'inventory' | 'receive' | 'sort'>('inventory');
  const [armazemId, setArmazemId] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [scanCode, setScanCode] = useState('');
  const [sortInvId, setSortInvId] = useState('');
  const [sortZonaId, setSortZonaId] = useState('');
  const [sortScanCode, setSortScanCode] = useState('');
  const [resolvedInvItem, setResolvedInvItem] = useState<any | null>(null);

  // WMS Grid States
  const [rack, setRack] = useState('A');
  const [bay, setBay] = useState('03');
  const [level, setLevel] = useState('D');
  const [position, setPosition] = useState('1');
  const [autoAllocate, setAutoAllocate] = useState(true);

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-wms'],
    queryFn: async () => {
      const supabase = (await import('@/modules/shared/lib/supabase')).supabase;
      const { data } = await supabase.from('admin_armazens').select('id,nome').order('nome');
      return data || [];
    },
  });

  const { data: zonas } = useQuery({
    queryKey: ['admin', 'zonas-wms', armazemId],
    queryFn: () => logisticsApi.wms.zones(armazemId || undefined),
    enabled: !!armazemId,
  });

  const { data: inventory, refetch: refetchInv } = useQuery({
    queryKey: ['admin', 'inventory-wms', armazemId, zonaId],
    queryFn: () => logisticsApi.wms.inventory(armazemId || undefined, zonaId || undefined),
  });

  const receiveMutation = useMutation({
    background: false,
    mutationFn: () => {
      // Create the WMS address label
      const wmsAddress = autoAllocate 
        ? getWarehouseLocation(scanCode).formatted
        : `${rack}-${bay}-${level}${position}`;

      return logisticsApi.wms.receive({
        codigo_barras: scanCode,
        armazem_id: armazemId,
        lote: `WMS-${wmsAddress}`
      });
    },
    onSuccess: () => {
      setScanCode('');
      refetchInv();
    },
  } as any);

  const sortMutation = useMutation({
    mutationFn: () => logisticsApi.wms.sort({ inventory_id: sortInvId, zona_id: sortZonaId }),
    onSuccess: () => {
      setSortInvId('');
      setSortZonaId('');
      setSortScanCode('');
      setResolvedInvItem(null);
      refetchInv();
    },
  });

  const handleResolveSortItem = async () => {
    if (!armazemId) {
      alert(t('Selecione um armazém primeiro.'));
      return;
    }
    if (!sortScanCode) return;
    try {
      const supabase = (await import('@/modules/shared/lib/supabase')).supabase;
      const { data: invItem } = await supabase
        .from('admin_inventario')
        .select('*')
        .eq('armazem_id', armazemId)
        .or(`produto.ilike.%${sortScanCode}%,lote.eq.${sortScanCode},sku.eq.${sortScanCode}`)
        .limit(1)
        .maybeSingle();

      if (invItem) {
        setResolvedInvItem(invItem);
        setSortInvId(invItem.id);
      } else {
        alert(t('Item não localizado no estoque deste armazém.'));
        setResolvedInvItem(null);
        setSortInvId('');
      }
    } catch (e: any) {
      alert(t('Erro ao buscar item: ') + e.message);
    }
  };

  const invRows = Array.isArray(inventory) ? inventory : [];
  const zonaRows = Array.isArray(zonas) ? zonas : [];
  const totalQty = invRows.reduce((s: number, i: any) => s + (i.quantidade || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('WMS — Armazém')}</h2>
          <p className="text-sm text-text-secondary mt-1">{invRows.length} {t('itens')} · {totalQty} {t('unidades em estoque')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'inventory', label: t('Inventário'), icon: Box },
          { id: 'receive', label: t('Receber Pacote'), icon: ScanLine },
          { id: 'sort', label: t('Triagem / Expedição'), icon: Layers },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id as any)}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition-colors ${
              tab === tb.id ? 'bg-primary text-black font-extrabold' : 'bg-[#111827] text-text-secondary border border-border'
            }`}>
            <tb.icon size={16} /> {tb.label}
          </button>
        ))}
      </div>

      {/* Armazém selector */}
      <div className="flex items-center gap-3">
        <select value={armazemId} onChange={e => setArmazemId(e.target.value)}
          className="h-10 bg-[#111827] border border-border rounded-lg px-3 text-sm text-white outline-none">
          <option value="">{t('Selecione o armazém')}</option>
          {(armazens || []).map((a: any) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
        {tab === 'inventory' && (
          <select value={zonaId} onChange={e => setZonaId(e.target.value)}
            className="h-10 bg-[#111827] border border-border rounded-lg px-3 text-sm text-white outline-none">
            <option value="">{t('Todas zonas')}</option>
            {zonaRows.map((z: any) => (
              <option key={z.id} value={z.id}>{z.nome}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tab content */}
      {tab === 'inventory' && (
        <div className="bg-[#111827] rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-black/10">
                <th className="text-left text-[12px] text-text-secondary font-bold p-4 uppercase tracking-wider">{t('Produto')}</th>
                <th className="text-left text-[12px] text-text-secondary font-bold p-4 uppercase tracking-wider">{t('Endereço WMS')}</th>
                <th className="text-left text-[12px] text-text-secondary font-bold p-4 uppercase tracking-wider">{t('Zona')}</th>
                <th className="text-left text-[12px] text-text-secondary font-bold p-4 uppercase tracking-wider">{t('Qtd')}</th>
                <th className="text-left text-[12px] text-text-secondary font-bold p-4 uppercase tracking-wider">{t('Lote / Registro')}</th>
                <th className="text-left text-[12px] text-text-secondary font-bold p-4 uppercase tracking-wider">{t('Armazém')}</th>
              </tr>
            </thead>
            <tbody>
              {invRows.filter(i => i.quantidade > 0).map((i: any) => {
                const loc = getWarehouseLocation(i.lote || i.sku || '');
                const colorScheme = LEVEL_COLORS[loc.level] || LEVEL_COLORS.A;
                return (
                  <tr key={i.id} className="border-b border-border hover:bg-surface/[0.02]">
                    <td className="p-4 text-sm font-medium">{i.produto}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}>
                        <MapPin size={12} /> {loc.formatted}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">{i.zona?.nome || '—'}</td>
                    <td className="p-4 text-sm font-bold">{i.quantidade}</td>
                    <td className="p-4 text-sm text-text-secondary font-mono">{i.lote || '—'}</td>
                    <td className="p-4 text-sm text-text-secondary">{i.armazem?.nome || '—'}</td>
                  </tr>
                );
              })}
              {invRows.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-text-muted text-sm">{t('Nenhum item no inventário')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'receive' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] rounded-xl p-6 border border-border space-y-4">
            <div>
              <h3 className="text-base font-bold text-white mb-1">{t('Receber Pacote no CD')}</h3>
              <p className="text-xs text-text-secondary">{t('Escaneie o código de barras da etiqueta de envio para registrar a entrada.')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">{t('Código de Barras')}</label>
                <div className="flex gap-2">
                  <input type="text" value={scanCode} onChange={e => setScanCode(e.target.value)}
                    placeholder={t('Escanear ou digitar código (Ex: #DAIG-...)')}
                    className="flex-1 h-12 bg-[#0B1220] border border-border rounded-xl px-4 text-sm text-white outline-none focus:border-primary font-mono" />
                  <button onClick={() => receiveMutation.mutate()} disabled={!scanCode || !armazemId || receiveMutation.isPending}
                    className="h-12 px-6 bg-primary hover:bg-primary-dark text-black rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                    {receiveMutation.isPending ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /></> : <><CheckCircle size={16} /> {t('Receber')}</>}
                  </button>
                </div>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-border/40 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAllocate}
                    onChange={(e) => setAutoAllocate(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-black/40"
                  />
                  <span>{t('Auto-alocar endereço WMS com base no SKU')}</span>
                </label>
                
                {autoAllocate && scanCode && (
                  <div className="text-xs text-text-secondary">
                    {t('O pacote será guardado na posição')}: <strong className="text-primary font-mono">{getWarehouseLocation(scanCode).formatted}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!autoAllocate && (
            <WarehouseGrid
              selectedRack={rack}
              selectedBay={bay}
              selectedLevel={level}
              selectedPosition={position}
              onChange={(r, b, l, p) => {
                setRack(r);
                setBay(b);
                setLevel(l);
                setPosition(p);
              }}
            />
          )}
        </div>
      )}

      {tab === 'sort' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] rounded-xl p-6 border border-border space-y-4">
            <div>
              <h3 className="text-base font-bold text-white mb-1">{t('Triagem / Separar para Rota (WMS Sort Center)')}</h3>
              <p className="text-xs text-text-secondary">{t('Escaneie o código de barras para localizar o pacote e selecionar a zona de despacho.')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">{t('Código de Barras / SKU')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('Código de barras...')}
                    value={sortScanCode}
                    onChange={e => setSortScanCode(e.target.value)}
                    className="flex-1 h-12 bg-[#0B1220] border border-border rounded-xl px-4 text-sm text-white outline-none focus:border-primary font-mono"
                  />
                  <button
                    onClick={handleResolveSortItem}
                    className="h-12 px-6 bg-surface hover:bg-black/40 border border-border text-white rounded-xl text-xs font-bold"
                  >
                    {t('Buscar')}
                  </button>
                </div>
              </div>

              {resolvedInvItem && (
                <div className="bg-black/20 border border-border/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('Item Localizado')}</h4>
                  
                  {/* Detailed Warehouse Location badge */}
                  {(() => {
                    const loc = getWarehouseLocation(resolvedInvItem.lote || resolvedInvItem.sku || '');
                    const colorScheme = LEVEL_COLORS[loc.level] || LEVEL_COLORS.A;
                    return (
                      <div className="flex items-center justify-between border-b border-border/30 pb-3">
                        <span className="text-xs text-text-secondary">{t('Posição de Coleta (Picking)')}:</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}>
                          <MapPin size={12} /> {loc.formatted} ({t('Nível')} {loc.level})
                        </span>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary">
                    <div><span className="font-semibold text-white">{t('Produto')}:</span> {resolvedInvItem.produto}</div>
                    <div><span className="font-semibold text-white">{t('Código')}:</span> {resolvedInvItem.sku || '—'}</div>
                    <div><span className="font-semibold text-white">{t('Quantidade')}:</span> {resolvedInvItem.quantidade}</div>
                    <div><span className="font-semibold text-white">{t('Registro Lote')}:</span> {resolvedInvItem.lote || '—'}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">{t('Direcionar para Zona de Saída / Rota')}</label>
                <select value={sortZonaId} onChange={e => setSortZonaId(e.target.value)}
                  className="w-full h-12 bg-[#0B1220] border border-border rounded-xl px-4 text-sm text-white outline-none focus:border-primary">
                  <option value="">{t('Selecione a zona de saída...')}</option>
                  {zonaRows.map((z: any) => (
                    <option key={z.id} value={z.id}>{z.nome} ({z.tipo})</option>
                  ))}
                </select>
              </div>

              <button onClick={() => sortMutation.mutate()} disabled={!sortInvId || !sortZonaId || sortMutation.isPending}
                className="h-12 w-full bg-primary hover:bg-primary-dark text-black rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                {sortMutation.isPending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><ArrowRight size={16} /> {t('Confirmar Triagem / Despachar')}</>}
              </button>
            </div>
          </div>

          {resolvedInvItem && (
            <WarehouseGrid
              selectedRack="A"
              selectedBay="01"
              selectedLevel="A"
              selectedPosition="1"
              highlightSlot={getWarehouseLocation(resolvedInvItem.lote || resolvedInvItem.sku || '').formatted}
              readOnly={true}
            />
          )}
        </div>
      )}
    </div>
  );
}

