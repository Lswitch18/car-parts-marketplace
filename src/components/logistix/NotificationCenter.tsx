import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Bell, Truck, X } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

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

  const items: { id: string; icon: any; color: string; title: string; desc: string; time: string }[] = [];

  (ocorrencias || []).forEach((o: any) => {
    items.push({
      id: o.id,
      icon: AlertCircle,
      color: '#EF4444',
      title: `Ocorrência: ${o.tipo}`,
      desc: o.descricao?.slice(0, 50) || '',
      time: timeAgo(o.created_at),
    });
  });

  (pedidos || []).slice(0, 5).forEach((p: any) => {
    items.push({
      id: p.id || p.codigo,
      icon: Truck,
      color: '#F97316',
      title: `Pedido ${p.codigo} atrasado`,
      desc: `${p.cliente} · previsto ${p.previsao || ''}`,
      time: timeAgo(p.created_at),
    });
  });

  items.sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return -1;
  });

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={onClose} />}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-[#1a1a2e] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 h-12 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell size={14} className="text-blue-400" />
              Notificações
              {items.length > 0 && (
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{items.length}</span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={14} /></button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">Nenhuma notificação</div>
            ) : (
              items.slice(0, 10).map((item, i) => (
                <div key={`${item.id}-${i}`} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${item.color}18` }}>
                    <item.icon size={14} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{item.desc}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 flex-shrink-0">{item.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
