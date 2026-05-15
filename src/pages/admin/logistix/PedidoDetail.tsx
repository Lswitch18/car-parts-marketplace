import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import {
  ArrowLeft, Package, MapPin, Truck, CheckCircle, AlertCircle,
  Clock, User, Scale, DollarSign, FileText, Printer,
} from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente', em_transito: 'Em Trânsito', entregue: 'Entregue',
  atrasado: 'Atrasado', cancelado: 'Cancelado', recebido: 'Recebido',
};

const STATUS_COLOR: Record<string, string> = {
  pendente: '#FACC15', em_transito: '#3B82F6', entregue: '#22C55E',
  atrasado: '#F97316', cancelado: '#EF4444', recebido: '#8B5CF6',
};

const EVENT_ICONS: Record<string, any> = {
  CRIACAO: FileText, ATUALIZACAO: Clock, ENVIO: Truck,
  ENTREGA: CheckCircle, RECEBIMENTO: Package, OCORRENCIA: AlertCircle,
};

function Timeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">Nenhum evento registrado</p>;
  }
  return (
    <div className="relative pl-8 space-y-0">
      {events.map((ev, i) => {
        const Icon = EVENT_ICONS[ev.tipo] || Clock;
        const cor = STATUS_COLOR[ev.status] || '#6B7280';
        return (
          <div key={i} className="relative pb-6 last:pb-0">
            <div
              className="absolute left-[-24px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: cor, background: '#0B1220' }}
            >
              <Icon size={8} style={{ color: cor }} />
            </div>
            {i < events.length - 1 && (
              <div className="absolute left-[-17px] top-5 bottom-0 w-[1px] bg-white/5" />
            )}
            <div>
              <p className="text-sm font-medium">{ev.descricao || ev.tipo}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {ev.local ? `${ev.local} · ` : ''}{ev.created_at || ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PedidoDetail({
  pedidoId,
  onBack,
}: {
  pedidoId?: string;
  onBack: () => void;
}) {
  const orderCode = pedidoId || '';

  const { data: pedidos } = useQuery({
    queryKey: ['admin', 'pedidos'],
    queryFn: () => adminApi.pedidos.list(),
  });

  const pedido = pedidos?.find((p: any) => p.codigo === orderCode || p.id === orderCode);

  const { data: tracking } = useQuery({
    queryKey: ['admin', 'tracking', pedido?.codigo],
    queryFn: () => adminApi.rastreamento.list(pedido.codigo),
    enabled: !!pedido?.codigo,
  });

  const pedidoStatus = pedido?.status || '';
  const statusCor = STATUS_COLOR[pedidoStatus] || '#6B7280';
  const statusLabel = STATUS_LABEL[pedidoStatus] || pedidoStatus;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      {!orderCode ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-sm">Selecione um pedido para ver detalhes</p>
        </div>
      ) : !pedido ? (
        <div className="text-center py-16 text-gray-500">
          <Package size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm">Pedido não encontrado</p>
          <p className="text-xs text-gray-600 mt-1">{orderCode}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{pedido.codigo}</h2>
                <span
                  className="inline-flex px-3 py-1 rounded-lg text-[12px] font-medium"
                  style={{
                    color: statusCor,
                    background: `${statusCor}18`,
                    border: `1px solid ${statusCor}33`,
                  }}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {pedido.cliente || pedido.cliente_nome || 'Cliente não informado'}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="h-9 px-4 bg-[#111827] border border-white/5 rounded-lg text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                <Printer size={14} /> Imprimir
              </button>
              <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm text-white flex items-center gap-2 transition-colors">
                <MapPin size={14} /> Rastrear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-[11px] mb-1"><MapPin size={13} /> Origem</div>
              <p className="text-sm font-medium">{pedido.origem || '-'}</p>
            </div>
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-[11px] mb-1"><MapPin size={13} /> Destino</div>
              <p className="text-sm font-medium">{pedido.destino_cidade || pedido.destino || '-'}</p>
              {pedido.destino_estado && <p className="text-[11px] text-gray-500">{pedido.destino_estado}</p>}
            </div>
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-[11px] mb-1"><Scale size={13} /> Peso</div>
              <p className="text-sm font-medium">{pedido.peso ? `${pedido.peso} kg` : '-'}</p>
            </div>
            <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 text-[11px] mb-1"><DollarSign size={13} /> Valor</div>
              <p className="text-sm font-medium">
                {pedido.valor ? `¥${Number(pedido.valor).toLocaleString('ja-JP')}` : '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
              <h3 className="text-base font-medium mb-4">Timeline</h3>
              <Timeline events={(() => { if (!tracking) return []; if (Array.isArray(tracking)) return tracking; return (tracking as any).eventos || []; })()} />
            </div>

            <div className="space-y-4">
              <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
                <h3 className="text-base font-medium mb-3">Detalhes do Pedido</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Cliente', value: pedido.cliente || pedido.cliente_nome, icon: User },
                    { label: 'Criado em', value: pedido.created_at || '-', icon: Clock },
                    { label: 'Previsão', value: pedido.previsao || '-', icon: Clock },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon size={14} className="text-gray-500" />
                      <span className="text-gray-400 min-w-[80px]">{item.label}</span>
                      <span className="text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111827] rounded-xl p-5 border border-white/5">
                <h3 className="text-base font-medium mb-3">Ações</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="h-9 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/20 transition-colors">
                    Editar Pedido
                  </button>
                  <button className="h-9 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/20 transition-colors">
                    Gerar Etiqueta
                  </button>
                  <button className="h-9 px-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm border border-orange-500/20 transition-colors">
                    Registrar Ocorrência
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
