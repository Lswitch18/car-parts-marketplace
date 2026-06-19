import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/modules/transactions/api/adminApi';
import { Search, Package, MapPin } from 'lucide-react';
import LabelPrint from '@/modules/transactions/components/LabelPrint';

const TIPOS: Record<string, string> = {
  COLETA: 'Coleta',
  SAIDA: 'Saída',
  ROTA: 'Em Rota',
  ENTREGA: 'Entrega',
  TRIAGEM: 'Triagem',
  ENVIO: 'Envio',
  RECEBIMENTO: 'Recebimento',
};

export default function TrackingPage() {
  const [search, setSearch] = useState('');
  const [codigo, setCodigo] = useState('');
  const [showLabel, setShowLabel] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tracking', codigo],
    queryFn: () => adminApi.rastreamento.list(codigo || undefined) as any,
    enabled: !!codigo,
    retry: false,
  });

  const pedido = (data as any)?.pedido;
  const eventos = (data as any)?.eventos || [];
  const isLoaded = data && codigo;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Rastreamento</h2>
        <p className="text-sm text-text-secondary mt-1">Busque pelo código da etiqueta</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); setCodigo(search.trim()); }}
        className="flex items-center gap-2 bg-[#111827] rounded-lg h-11 px-3 border border-border">
        <Search size={18} className="text-text-secondary shrink-0" />
        <input type="text" placeholder="Digite o código do pedido (ex: #JP-PED-001)" value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-muted" />
        <button type="submit" className="h-8 px-4 bg-primary rounded-lg text-xs font-semibold whitespace-nowrap">
          Buscar
        </button>
      </form>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isLoaded && !pedido && (
        <div className="text-center py-12 bg-[#111827] rounded-xl">
          <Package size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-text-secondary font-medium">Pedido não encontrado</p>
          <p className="text-xs text-text-muted mt-1">Verifique o código digitado</p>
        </div>
      )}

      {pedido && (
        <div className="bg-[#111827] rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-text-muted mb-0.5">Código</p>
                <h3 className="text-lg font-bold font-mono">{pedido.codigo}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted mb-0.5">Status</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  pedido.status === 'entregue' ? 'bg-green-400/15 text-green-400' :
                  pedido.status === 'em_transito' ? 'bg-blue-400/15 text-blue-400' :
                  'bg-yellow-400/15 text-yellow-400'
                }`}>{pedido.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-text-secondary">
              <MapPin size={14} />
              <span>{pedido.destino_cidade}/{pedido.destino_estado}</span>
            </div>
            {pedido.peso_kg && (
              <p className="text-xs text-text-muted mt-1">{pedido.peso_kg}kg · ¥{(pedido.valor || 0).toLocaleString()}</p>
            )}
            <button onClick={() => setShowLabel(true)}
              className="mt-3 h-9 px-4 bg-primary/10 hover:bg-primary/20 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400 flex items-center gap-2">
              <Package size={14} /> Imprimir Etiqueta
            </button>
          </div>

          {/* Timeline */}
          <div className="p-5">
            <h4 className="text-sm font-semibold mb-4">Eventos de Rastreamento</h4>
            {eventos.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Nenhum evento registrado</p>
            ) : (
              <div className="space-y-0">
                {eventos.map((ev: any, idx: number) => (
                  <div key={ev.id} className="flex gap-3 pb-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 z-10 ${
                        idx === 0 ? 'bg-primary border-blue-400' : 'bg-[#111827] border-gray-600'
                      }`} />
                      {idx < eventos.length - 1 && <div className="w-0.5 flex-1 bg-gray-700 -mt-0.5" />}
                    </div>
                    <div className="flex-1 -mt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{TIPOS[ev.tipo] || ev.tipo}</span>
                        <span className="text-[10px] text-text-muted">{new Date(ev.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-0.5">{ev.descricao}</p>
                      {ev.local && <p className="text-[11px] text-text-muted mt-0.5">📍 {ev.local}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showLabel && pedido && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80"
          onClick={() => setShowLabel(false)}>
          <div onClick={e => e.stopPropagation()}>
            <LabelPrint pedido={pedido} onClose={() => setShowLabel(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
