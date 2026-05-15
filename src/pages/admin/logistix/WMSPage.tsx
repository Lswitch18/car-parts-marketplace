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
    onSuccess: () => { setSortInvId(''); setSortZonaId(''); refetchInv(); },
  });

  const invRows = Array.isArray(inventory) ? inventory : [];
  const zonaRows = Array.isArray(zonas) ? zonas : [];
  const totalQty = invRows.reduce((s: number, i: any) => s + (i.quantidade || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">WMS — Armazém</h2>
          <p className="text-sm text-gray-400 mt-1">{invRows.length} itens · {totalQty} unidades</p>
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
              tab === t.id ? 'bg-blue-500 text-white' : 'bg-[#111827] text-gray-400 border border-white/5'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Armazém selector */}
      <div className="flex items-center gap-3">
        <select value={armazemId} onChange={e => setArmazemId(e.target.value)}
          className="h-10 bg-[#111827] border border-white/10 rounded-lg px-3 text-sm text-white outline-none">
          <option value="">Selecione o armazém</option>
          {(armazens || []).map((a: any) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
        {tab === 'inventory' && (
          <select value={zonaId} onChange={e => setZonaId(e.target.value)}
            className="h-10 bg-[#111827] border border-white/10 rounded-lg px-3 text-sm text-white outline-none">
            <option value="">Todas zonas</option>
            {zonaRows.map((z: any) => (
              <option key={z.id} value={z.id}>{z.nome}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tab content */}
      {tab === 'inventory' && (
        <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[12px] text-gray-400 font-medium p-4">Produto</th>
                <th className="text-left text-[12px] text-gray-400 font-medium p-4">Zona</th>
                <th className="text-left text-[12px] text-gray-400 font-medium p-4">Qtd</th>
                <th className="text-left text-[12px] text-gray-400 font-medium p-4">Lote</th>
                <th className="text-left text-[12px] text-gray-400 font-medium p-4">Armazém</th>
              </tr>
            </thead>
            <tbody>
              {invRows.filter(i => i.quantidade > 0).map((i: any) => (
                <tr key={i.id} className="border-b border-white/5">
                  <td className="p-4 text-sm font-medium">{i.produto}</td>
                  <td className="p-4 text-sm text-gray-400">{i.zona?.nome || '—'}</td>
                  <td className="p-4 text-sm">{i.quantidade}</td>
                  <td className="p-4 text-sm text-gray-400 font-mono">{i.lote || '—'}</td>
                  <td className="p-4 text-sm text-gray-400">{i.armazem?.nome || '—'}</td>
                </tr>
              ))}
              {invRows.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500 text-sm">Nenhum item no inventário</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'receive' && (
        <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-semibold mb-1">Receber Pacote no CD</h3>
          <p className="text-xs text-gray-400 mb-4">Escaneie ou digite o código de barras do pacote</p>

          <div className="flex gap-2 mb-4">
            <input type="text" value={scanCode} onChange={e => setScanCode(e.target.value)}
              placeholder="Código de barras..."
              className="flex-1 h-12 bg-[#0B1220] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500 font-mono" />
            <button onClick={() => receiveMutation.mutate()} disabled={!scanCode || !armazemId || receiveMutation.isPending}
              className="h-12 px-6 bg-blue-500 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {receiveMutation.isPending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></> : <><CheckCircle size={16} /> Receber</>}
            </button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>📦 O pacote será adicionado ao inventário do armazém selecionado</p>
            <p>📋 O tracking será atualizado automaticamente</p>
          </div>
        </div>
      )}

      {tab === 'sort' && (
        <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-semibold mb-1">Triagem / Separar para Rota</h3>
          <p className="text-xs text-gray-400 mb-4">Atribua itens a zonas de separação</p>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Item do Inventário (ID)</label>
              <input type="text" value={sortInvId} onChange={e => setSortInvId(e.target.value)}
                placeholder="ID do inventário..."
                className="w-full h-11 bg-[#0B1220] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500 font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Zona de Destino</label>
              <select value={sortZonaId} onChange={e => setSortZonaId(e.target.value)}
                className="w-full h-11 bg-[#0B1220] border border-white/10 rounded-xl px-4 text-sm text-white outline-none">
                <option value="">Selecione...</option>
                {zonaRows.filter(z => z.tipo === 'SEPARACAO').map((z: any) => (
                  <option key={z.id} value={z.id}>{z.nome} ({z.tipo})</option>
                ))}
              </select>
            </div>
            <button onClick={() => sortMutation.mutate()} disabled={!sortInvId || !sortZonaId || sortMutation.isPending}
              className="h-11 px-5 bg-blue-500 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              <ArrowRight size={16} /> Separar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
