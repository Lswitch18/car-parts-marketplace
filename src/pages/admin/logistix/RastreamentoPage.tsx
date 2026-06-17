import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, MapPin, RotateCcw, Clock, CheckCircle, X, AlertCircle, Truck, Warehouse } from 'lucide-react';

const TIPO_ICON: Record<string, any> = {
  CRIACAO: Package, ATUALIZACAO: RotateCcw, ENVIO: Truck,
  ENTREGA: CheckCircle, RECEBIMENTO: Warehouse, OCORRENCIA: AlertCircle,
};

const TIPO_COLOR: Record<string, string> = {
  CRIACAO: '#3B82F6', ATUALIZACAO: '#FACC15', ENVIO: '#F97316',
  ENTREGA: '#22C55E', RECEBIMENTO: '#8B5CF6', OCORRENCIA: '#EF4444',
};

const STATUS_COLOR: Record<string, string> = {
  pendente: '#FACC15', em_transito: '#3B82F6', entregue: '#22C55E',
  atrasado: '#F97316', cancelado: '#EF4444', recebido: '#8B5CF6',
};

import { useEffect } from 'react';

export default function RastreamentoPage({ initialCode, onClear }: { initialCode?: string; onClear?: () => void }) {
  const [searchCode, setSearchCode] = useState(initialCode || '');
  const [activeCode, setActiveCode] = useState(initialCode || '');

  useEffect(() => {
    if (initialCode) {
      setSearchCode(initialCode);
      setActiveCode(initialCode);
    }
  }, [initialCode]);

  const { data: trackingData, isLoading: trackingLoading, error: trackingError } = useQuery({
    queryKey: ['admin', 'rastreamento', activeCode],
    queryFn: async () => {
      if (!activeCode) return null;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin/rastreamento?codigo=${encodeURIComponent(activeCode)}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('sb-access-token')}` } }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!activeCode,
  });

  const { data: allTracking, isLoading: allLoading } = useQuery({
    queryKey: ['admin', 'rastreamento-list'],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin/rastreamento`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('sb-access-token')}` } }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchCode.trim()) {
      setActiveCode(searchCode.trim());
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Rastreamento</h2>
        <p className="text-sm text-gray-400 mt-1">Acompanhe pedidos em tempo real</p>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <div className="flex items-center bg-[#111827] rounded-lg h-12 flex-1 px-4 border border-white/5 focus-within:border-blue-500 transition-colors">
          <Search size={20} className="text-gray-400 mr-3" />
          <input type="text" placeholder="Digite o código do pedido (ex: #PED-...)" value={searchCode} onChange={e => setSearchCode(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-base w-full placeholder:text-gray-500 flex-1" />
          {searchCode && <X size={18} className="text-gray-400 cursor-pointer hover:text-white" onClick={() => { setSearchCode(''); setActiveCode(''); if (onClear) onClear(); }} />}
        </div>
        <button type="submit" className="h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Search size={18} /> Rastrear
        </button>
      </form>

      {trackingLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {trackingError && (
        <div className="bg-[#111827] rounded-xl border border-red-500/20 p-6 text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium">Erro ao buscar rastreamento</p>
          <p className="text-gray-400 text-sm mt-1">{(trackingError as any)?.message || 'Código inválido'}</p>
        </div>
      )}

      {trackingData && !trackingLoading && (
        <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{trackingData.pedido?.codigo || activeCode}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {trackingData.destino?.cidade}{trackingData.destino?.estado ? ` - ${trackingData.destino.estado}` : ''}
                </p>
              </div>
              <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium" style={{
                color: STATUS_COLOR[trackingData.pedido?.status] || '#6B7280',
                background: `${STATUS_COLOR[trackingData.pedido?.status] || '#6B7280'}18`,
                border: `1px solid ${STATUS_COLOR[trackingData.pedido?.status] || '#6B7280'}33`,
              }}>
                {trackingData.pedido?.status?.replace('_', ' ') || 'Desconhecido'}
              </span>
            </div>
          </div>

          <div className="p-6">
            {(!trackingData.eventos || trackingData.eventos.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <Package size={40} className="mx-auto mb-3 opacity-50" />
                <p>Nenhum evento de rastreamento encontrado</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-white/10" />
                <div className="space-y-0">
                  {trackingData.eventos.map((ev: any, idx: number) => {
                    const Icon = TIPO_ICON[ev.tipo] || Clock;
                    const color = TIPO_COLOR[ev.tipo] || '#6B7280';
                    return (
                      <div key={ev.id || idx} className="relative flex items-start gap-4 pb-8 last:pb-0">
                        <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">{ev.descricao || ev.tipo}</p>
                            <span className="text-[11px] text-gray-500 ml-4 whitespace-nowrap">
                              {ev.created_at ? new Date(ev.created_at).toLocaleString('pt-BR') : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {ev.local && <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{ev.local}</span>}
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{
                              color: STATUS_COLOR[ev.status] || '#6B7280',
                              background: `${STATUS_COLOR[ev.status] || '#6B7280'}15`,
                            }}>{ev.status?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!activeCode && (
        <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden mt-6">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-base font-medium">Eventos Recentes</h3>
          </div>
          {allLoading ? (
            <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Pedido', 'Tipo', 'Descrição', 'Local', 'Status', 'Data'].map(h => (
                      <th key={h} className="text-left text-[12px] text-gray-400 font-medium p-3 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(!allTracking || allTracking.length === 0) ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500 text-sm">Nenhum evento recente</td></tr>
                  ) : allTracking.slice(0, 50).map((ev: any, idx: number) => (
                    <tr key={ev.id || idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-sm font-mono text-blue-400">{ev.pedido?.codigo || ev.pedido_id?.substring(0, 8)}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px]" style={{
                          color: TIPO_COLOR[ev.tipo] || '#6B7280',
                          background: `${TIPO_COLOR[ev.tipo] || '#6B7280'}15`,
                        }}>{ev.tipo}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-300">{ev.descricao || '-'}</td>
                      <td className="p-3 text-sm text-gray-400">{ev.local || '-'}</td>
                      <td className="p-3">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          color: STATUS_COLOR[ev.status] || '#6B7280',
                          background: `${STATUS_COLOR[ev.status] || '#6B7280'}15`,
                        }}>{ev.status?.replace('_', ' ')}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-400 whitespace-nowrap">{ev.created_at ? new Date(ev.created_at).toLocaleString('pt-BR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
