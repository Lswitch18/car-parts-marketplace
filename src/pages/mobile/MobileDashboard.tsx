import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { mobileApi } from '../../lib/mobileApi';
import { PackageSearch, Truck, Clock } from 'lucide-react';

export default function MobileDashboard() {
  const { user } = useAuthStore();
  const { data: coletas } = useQuery({ queryKey: ['mobile', 'coletas-pendentes'], queryFn: () => mobileApi.coletas.list({ status: 'pendente' }) });
  const { data: entregas } = useQuery({ queryKey: ['mobile', 'entregas-pendentes'], queryFn: () => mobileApi.entregas.list({ status: 'pendente' }) });

  const coletasArr = Array.isArray(coletas) ? coletas : (coletas as any)?.rows || [];
  const entregasArr = Array.isArray(entregas) ? entregas : (entregas as any)?.rows || [];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Olá, {user?.full_name?.split(' ')[0] || 'Operador'} 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center mb-3">
            <PackageSearch size={20} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold">{coletasArr.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Coletas pendentes</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center mb-3">
            <Truck size={20} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold">{entregasArr.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Entregas pendentes</p>
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock size={14} className="text-blue-400" /> Últimas Coletas
        </h2>
        <div className="space-y-2">
          {coletasArr.slice(0, 3).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
              <div>
                <p className="text-sm font-medium">{c.pedido?.codigo || c.id?.slice(0, 8)}</p>
                <p className="text-xs text-gray-400">{c.endereco || '—'}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">Pendente</span>
            </div>
          ))}
          {coletasArr.length === 0 && <p className="text-sm text-gray-500 text-center py-3">Nenhuma coleta pendente</p>}
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Truck size={14} className="text-green-400" /> Últimas Entregas
        </h2>
        <div className="space-y-2">
          {entregasArr.slice(0, 3).map((e: any) => (
            <div key={e.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
              <div>
                <p className="text-sm font-medium">{e.pedido?.codigo || e.id?.slice(0, 8)}</p>
                <p className="text-xs text-gray-400">{e.destino || '—'}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">Pendente</span>
            </div>
          ))}
          {entregasArr.length === 0 && <p className="text-sm text-gray-500 text-center py-3">Nenhuma entrega pendente</p>}
        </div>
      </div>
    </div>
  );
}
