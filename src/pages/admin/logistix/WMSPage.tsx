import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { logisticsApi } from '../../../lib/logisticsApi';
import { Box, ArrowRight, ScanLine, CheckCircle, Layers } from 'lucide-react';

export default function WMSPage() {
  const [tab, setTab] = useState<'inventory' | 'receive' | 'sort'>('inventory');
  const [armazemId, setArmazemId] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [scanCode, setScanCode] = useState('');
  const [sortInvId, setSortInvId] = useState('');
  const [sortZonaId, setSortZonaId] = useState('');
  const [sortScanCode, setSortScanCode] = useState('');
  const [resolvedInvItem, setResolvedInvItem] = useState<any | null>(null);

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-wms'],
    queryFn: async () => {
      const supabase = (await import('../../../lib/supabase')).supabase;
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
    mutationFn: () => logisticsApi.wms.receive({ codigo_barras: scanCode, armazem_id: armazemId }),
    onSuccess: () => { setScanCode(''); refetchInv(); },
  });

  const sortMutation = useMutation({
    mutationFn: () => logisticsApi.wms.sort({ inventory_id: sortInvId, zona_id: sortZonaId }),
    onSuccess: () => { setSortInvId(''); setSortZonaId(''); setSortScanCode(''); setResolvedInvItem(null); refetchInv(); },
  });

  const handleResolveSortItem = async () => {
    if (!armazemId) {
      alert('Selecione um armazém primeiro.');
      return;
    }
    if (!sortScanCode) return;
    try {
      const supabase = (await import('../../../lib/supabase')).supabase;
      const { data: invItem } = await supabase
        .from('admin_inventario')
        .select('*')
        .eq('armazem_id', armazemId)
        .or(`produto.ilike.%${sortScanCode}%,lote.eq.${sortScanCode}`)
        .limit(1)
        .maybeSingle();

      if (invItem) {
        setResolvedInvItem(invItem);
        setSortInvId(invItem.id);
      } else {
        alert('Item não localizado no estoque deste armazém.');
        setResolvedInvItem(null);
        setSortInvId('');
      }
    } catch (e: any) {
      alert('Erro ao buscar item: ' + e.message);
    }
  };

  const invRows = Array.isArray(inventory) ? inventory : [];
  const zonaRows = Array.isArray(zonas) ? zonas : [];
  const totalQty = invRows.reduce((s: number, i: any) => s + (i.quantidade || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">WMS — Armazém</h2>
          <p className="text-sm text-text-secondary mt-1">{invRows.length} itens · {totalQty} unidades</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'inventory', label: 'Inventário', icon: Box },
          { id: 'receive', label: 'Receber', icon: ScanLine },
          { id: 'sort', label: 'Triagem', icon: Layers },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-primary text-white' : 'bg-[#111827] text-text-secondary border border-border'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Armazém selector */}
      <div className="flex items-center gap-3">
        <select value={armazemId} onChange={e => setArmazemId(e.target.value)}
          className="h-10 bg-[#111827] border border-border rounded-lg px-3 text-sm text-white outline-none">
          <option value="">Selecione o armazém</option>
          {(armazens || []).map((a: any) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
        {tab === 'inventory' && (
          <select value={zonaId} onChange={e => setZonaId(e.target.value)}
            className="h-10 bg-[#111827] border border-border rounded-lg px-3 text-sm text-white outline-none">
            <option value="">Todas zonas</option>
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
              <tr className="border-b border-border">
                <th className="text-left text-[12px] text-text-secondary font-medium p-4">Produto</th>
                <th className="text-left text-[12px] text-text-secondary font-medium p-4">Zona</th>
                <th className="text-left text-[12px] text-text-secondary font-medium p-4">Qtd</th>
                <th className="text-left text-[12px] text-text-secondary font-medium p-4">Lote</th>
                <th className="text-left text-[12px] text-text-secondary font-medium p-4">Armazém</th>
              </tr>
            </thead>
            <tbody>
              {invRows.filter(i => i.quantidade > 0).map((i: any) => (
                <tr key={i.id} className="border-b border-border">
                  <td className="p-4 text-sm font-medium">{i.produto}</td>
                  <td className="p-4 text-sm text-text-secondary">{i.zona?.nome || '—'}</td>
                  <td className="p-4 text-sm">{i.quantidade}</td>
                  <td className="p-4 text-sm text-text-secondary font-mono">{i.lote || '—'}</td>
                  <td className="p-4 text-sm text-text-secondary">{i.armazem?.nome || '—'}</td>
                </tr>
              ))}
              {invRows.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-text-muted text-sm">Nenhum item no inventário</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'receive' && (
        <div className="bg-[#111827] rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold mb-1">Receber Pacote no CD</h3>
          <p className="text-xs text-text-secondary mb-4">Escaneie ou digite o código de barras do pacote</p>

          <div className="flex gap-2 mb-4">
            <input type="text" value={scanCode} onChange={e => setScanCode(e.target.value)}
              placeholder="Código de barras..."
              className="flex-1 h-12 bg-[#0B1220] border border-border rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500 font-mono" />
            <button onClick={() => receiveMutation.mutate()} disabled={!scanCode || !armazemId || receiveMutation.isPending}
              className="h-12 px-6 bg-primary rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {receiveMutation.isPending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></> : <><CheckCircle size={16} /> Receber</>}
            </button>
          </div>

          <div className="text-xs text-text-muted space-y-1">
            <p>📦 O pacote será adicionado ao inventário do armazém selecionado</p>
            <p>📋 O tracking será atualizado automaticamente</p>
          </div>
        </div>
      )}

      {tab === 'sort' && (
        <div className="bg-[#111827] rounded-xl p-5 border border-border space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Triagem / Separar para Rota (WMS Sort Center)</h3>
            <p className="text-xs text-text-secondary">Escaneie o pacote para verificar e direcioná-lo para a zona de embarque correta</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Escanear Lote/Pacote</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escaneie o código de barras ou lote (ex: #PED-...)"
                  value={sortScanCode}
                  onChange={e => setSortScanCode(e.target.value)}
                  className="flex-1 h-11 bg-[#0B1220] border border-border rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500 font-mono"
                />
                <button
                  onClick={handleResolveSortItem}
                  className="h-11 px-4 bg-surface border border-border hover:bg-slate-900/50 text-text rounded-xl text-xs font-semibold"
                >
                  Buscar
                </button>
              </div>
            </div>

            {resolvedInvItem && (
              <div className="bg-background border border-border rounded-xl p-4 space-y-2 text-xs">
                <p className="font-bold text-text">Item Localizado:</p>
                <div className="grid grid-cols-2 gap-2 text-text-secondary">
                  <div><span className="font-semibold text-text">Produto:</span> {resolvedInvItem.produto}</div>
                  <div><span className="font-semibold text-text">Lote/Pedido:</span> {resolvedInvItem.lote || '—'}</div>
                  <div><span className="font-semibold text-text">Quantidade:</span> {resolvedInvItem.quantidade}</div>
                  <div><span className="font-semibold text-text">Localização Atual:</span> {resolvedInvItem.zona_id || '—'}</div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-text-secondary mb-1 block">Direcionar para Zona de Destino</label>
              <select value={sortZonaId} onChange={e => setSortZonaId(e.target.value)}
                className="w-full h-11 bg-[#0B1220] border border-border rounded-xl px-4 text-sm text-white outline-none">
                <option value="">Selecione a zona de saída...</option>
                {zonaRows.map((z: any) => (
                  <option key={z.id} value={z.id}>{z.nome} ({z.tipo})</option>
                ))}
              </select>
            </div>

            <button onClick={() => sortMutation.mutate()} disabled={!sortInvId || !sortZonaId || sortMutation.isPending}
              className="h-11 w-full bg-primary hover:bg-primary-dark text-black rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
              {sortMutation.isPending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><ArrowRight size={16} /> Confirmar Triagem / Enviar para Saída</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
