import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Bell, Truck, X, Package } from 'lucide-react';
import { adminApi } from '@/modules/transactions/api/adminApi';

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function NotificationCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: ocorrencias } = useQuery({
    queryKey: ['admin', 'ocorrencias-ativas'],
    queryFn: () => adminApi.ocorrencias.list('aberto,em_andamento'),
    refetchInterval: 30000,
  });

  const { data: pedidos } = useQuery({
    queryKey: ['admin', 'pedidos-atrasados'],
    queryFn: async () => {
      const all = await adminApi.pedidos.list();
      return (all || []).filter((p: any) => p.status === 'atrasado');
    },
  });

  const items: {
    id: string;
    icon: any;
    color: string;
    title: string;
    desc: string;
    time: string;
    severity: 'high' | 'medium' | 'low';
  }[] = [];

  (ocorrencias || []).forEach((o: any) => {
    items.push({
      id: o.id,
      icon: AlertTriangle,
      color: '#FF4B4B',
      title: `Ocorrência: ${o.tipo}`,
      desc: o.descricao?.slice(0, 50) || '',
      time: timeAgo(o.created_at),
      severity: 'high',
    });
  });

  (pedidos || []).slice(0, 5).forEach((p: any) => {
    items.push({
      id: p.id || p.codigo,
      icon: Truck,
      color: '#FFB800',
      title: `Pedido ${p.codigo} atrasado`,
      desc: `${p.cliente} · previsto ${p.previsao || ''}`,
      time: timeAgo(p.created_at),
      severity: 'medium',
    });
  });

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={onClose} />}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(10,10,15,0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 h-12"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: '#0D75FF' }} />
              <span className="text-sm font-semibold text-white">Notificações</span>
              {items.length > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ background: '#FF4B4B', color: '#fff' }}
                >
                  {items.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: '#6B7280' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(13,117,255,0.1)', border: '1px solid rgba(13,117,255,0.15)' }}
                >
                  <Package size={20} style={{ color: 'rgba(13,117,255,0.6)' }} />
                </div>
                <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Nenhuma notificação</p>
              </div>
            ) : (
              items.slice(0, 10).map((item, i) => (
                <div
                  key={`${item.id}-${i}`}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {/* Severity dot */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}
                    >
                      <item.icon size={14} style={{ color: item.color }} />
                    </div>
                    {item.severity === 'high' && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                        style={{ background: item.color, boxShadow: `0 0 4px ${item.color}` }}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: '#6B7280' }}>{item.desc}</p>
                  </div>

                  <span className="text-[10px] flex-shrink-0 mt-0.5 font-medium tabular-nums" style={{ color: '#4B5563' }}>
                    {item.time}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div
              className="px-4 h-9 flex items-center justify-center"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <button className="text-[11px] font-semibold transition-colors hover:text-white" style={{ color: '#0D75FF' }}>
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
