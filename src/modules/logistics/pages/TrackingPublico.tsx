import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, Truck, CheckCircle, AlertTriangle, Clock, Building } from 'lucide-react';

const ETAPAS: Record<string, { label: string; icon: any; cor: string }> = {
  CREATED: { label: 'Pedido criado', icon: Package, cor: '#9CA3AF' },
  DROPOFF: { label: 'Recebido na agência', icon: Building, cor: '#3B82F6' },
  FIRST_MILE: { label: 'Saiu para coleta', icon: Truck, cor: '#3B82F6' },
  SORTING: { label: 'Em triagem', icon: Package, cor: '#FACC15' },
  SORTED: { label: 'Separado para rota', icon: CheckCircle, cor: '#22C55E' },
  LINE_HAUL: { label: 'Em transporte', icon: Truck, cor: '#3B82F6' },
  LAST_MILE: { label: 'Saiu para entrega', icon: Truck, cor: '#F97316' },
  DELIVERED: { label: 'Entregue', icon: CheckCircle, cor: '#22C55E' },
};

const TIPO_LABEL: Record<string, string> = {
  CREATED: 'Criado', DROPOFF: 'Drop-off', FIRST_MILE: 'Coleta',
  SORTING: 'Triagem', LINE_HAUL: 'Transporte', OUT_FOR_DELIVERY: 'Saiu p/ entrega',
  DELIVERED: 'Entregue', RECEBIDO_CD: 'Recebido no CD',
};

export default function TrackingPublico() {
  const [search, setSearch] = useState('');
  const [codigo, setCodigo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tracking-publico', codigo],
    queryFn: async () => {
      const { logisticsApi } = await import('@/modules/logistics/api/logisticsApi');
      return logisticsApi.tracking.get(codigo);
    },
    enabled: !!codigo,
    retry: false,
  });

  const shipment = data?.shipment;
  const pedido = data?.pedido;
  const cliente = data?.cliente;
  const eventos = data?.eventos || [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = search.trim();
    if (val) setCodigo(val);
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 pb-12">
        <div className="max-w-lg mx-auto px-4 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Rastreamento</h1>
              <p className="text-sm text-white/70">DAIG Logistix</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Digite o código de rastreamento..."
                  className="w-full h-12 bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 text-sm text-white outline-none focus:border-white/40 placeholder:text-white/40"
                  autoFocus />
              </div>
              <button type="submit" disabled={!search.trim()}
                className="h-12 px-5 bg-white/20 rounded-xl text-sm font-semibold disabled:opacity-40">
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 pb-12">
        {isLoading && (
          <div className="bg-[#1F2937] rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Buscando rastreamento...</p>
          </div>
        )}

        {codigo && !isLoading && !shipment && (
          <div className="bg-[#1F2937] rounded-2xl p-8 text-center">
            <Package size={48} className="mx-auto text-gray-600 mb-3" />
            <h2 className="text-lg font-semibold mb-1">Código não encontrado</h2>
            <p className="text-sm text-gray-400">Verifique o código digitado</p>
          </div>
        )}

        {shipment && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-[#1F2937] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Código de rastreio</p>
                  <h2 className="text-lg font-bold font-mono">{shipment.codigo}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    shipment.status === 'delivered' ? 'bg-green-500/15 text-green-400' :
                    shipment.risco_atraso === 'alto' ? 'bg-red-500/15 text-red-400' :
                    shipment.risco_atraso === 'medio' ? 'bg-yellow-400/15 text-yellow-400' :
                    'bg-blue-400/15 text-blue-400'
                  }`}>
                    {ETAPAS[shipment.etapa]?.label || shipment.etapa}
                  </span>
                </div>
              </div>

              {/* Riscos de atraso */}
              {shipment.risco_atraso && shipment.risco_atraso !== 'baixo' && (
                <div className={`flex items-start gap-3 p-3 rounded-xl mb-4 ${
                  shipment.risco_atraso === 'alto' ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-400/10 border border-yellow-400/20'
                }`}>
                  <AlertTriangle size={18} className={shipment.risco_atraso === 'alto' ? 'text-red-400 shrink-0 mt-0.5' : 'text-yellow-400 shrink-0 mt-0.5'} />
                  <div>
                    <p className={`text-sm font-medium ${shipment.risco_atraso === 'alto' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {shipment.risco_atraso === 'alto' ? '🔴 Alto risco de atraso' : '🟡 Risco médio de atraso'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{shipment.motivo_atraso}</p>
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {cliente?.nome && (
                  <div>
                    <p className="text-xs text-gray-500">Destinatário</p>
                    <p className="font-medium">{cliente.nome}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Destino</p>
                  <p className="font-medium">{pedido?.destino_cidade ? `${pedido.destino_cidade}/${pedido.destino_estado}` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Previsão</p>
                  <p className="font-medium">{shipment.data_prazo ? new Date(shipment.data_prazo).toLocaleDateString('pt-BR') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Peso</p>
                  <p className="font-medium">{shipment.peso_kg ? `${shipment.peso_kg}kg` : '—'}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#1F2937] rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" /> Eventos de rastreamento
              </h3>
              {eventos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum evento registrado</p>
              ) : (
                <div className="space-y-0">
                  {eventos.map((ev: any, idx: number) => (
                    <div key={ev.id} className="flex gap-3 pb-4 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 z-10 ${
                          idx === 0 ? 'bg-blue-500 border-blue-400' : 'bg-[#1F2937] border-gray-600'
                        }`} />
                        {idx < eventos.length - 1 && <div className="w-0.5 flex-1 bg-gray-700 -mt-0.5" />}
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold">{TIPO_LABEL[ev.tipo] || ev.tipo}</span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(ev.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mt-0.5">{ev.descricao}</p>
                        {ev.local && <p className="text-[11px] text-gray-500 mt-0.5">📍 {ev.local}</p>}
                        {ev.responsavel && <p className="text-[11px] text-gray-500">👤 {ev.responsavel}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SLA info */}
            <div className="bg-[#1F2937] rounded-2xl p-5 border border-white/5 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">SLA contratado</span>
                <span className="font-medium">{shipment.sla_horas}h</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Horas restantes</span>
                <span className={`font-medium ${
                  shipment.horas_restantes < 0 ? 'text-red-400' :
                  shipment.horas_restantes < 12 ? 'text-yellow-400' : 'text-green-400'
                }`}>{shipment.horas_restantes}h</span>
              </div>
              <div className="h-2 bg-[#0B1220] rounded-full overflow-hidden mt-1">
                <div className={`h-full rounded-full transition-all ${
                  shipment.horas_restantes < 0 ? 'bg-red-500' :
                  shipment.horas_restantes < 12 ? 'bg-yellow-400' : 'bg-green-500'
                }`} style={{ width: `${Math.min(100, Math.max(0, (1 - shipment.horas_restantes / shipment.sla_horas) * 100))}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
