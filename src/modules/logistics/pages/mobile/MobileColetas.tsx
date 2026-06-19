import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '@/modules/logistics/api/mobileApi';
import { MapPin, CheckCircle, ChevronRight, Clock } from 'lucide-react';

export default function MobileColetas() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['mobile', 'coletas', search],
    queryFn: () => mobileApi.coletas.list({ status: search || undefined }),
  });

  const confirmMutation = useMutation({
    mutationFn: () => mobileApi.coletas.update(selected.id, { status: 'coletado' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile', 'coletas'] });
      queryClient.invalidateQueries({ queryKey: ['mobile', 'coletas-pendentes'] });
      setShowConfirm(false);
      setSelected(null);
    },
  });

  const rows = Array.isArray(data) ? data : (data as any)?.rows || [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Coletas</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'pendente', 'coletado', 'cancelado'].map(s => (
          <button key={s} onClick={() => setSearch(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              search === s ? 'bg-blue-500 text-white' : 'bg-[#111827] text-gray-400 border border-white/5'
            }`}>
            {s || 'Todas'}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500 text-sm">Nenhuma coleta encontrada</p>
        </div>
      ) : rows.map((row: any) => (
        <div key={row.id} onClick={() => { setSelected(row); setShowConfirm(true); }}
          className="bg-[#111827] rounded-xl p-4 border border-white/5 active:scale-[0.98] transition-transform cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{row.pedido?.codigo || `COL-${row.id?.slice(0, 6)}`}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  row.status === 'coletado' ? 'bg-green-400/15 text-green-400' :
                  row.status === 'cancelado' ? 'bg-red-400/15 text-red-400' :
                  'bg-yellow-400/15 text-yellow-400'
                }`}>{row.status || 'pendente'}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <MapPin size={11} /> {row.endereco || row.pedido?.destino_cidade || 'Endereço não informado'}
              </p>
              {row.previsao && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock size={11} /> {new Date(row.previsao).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <ChevronRight size={18} className="text-gray-600 mt-1" />
          </div>
        </div>
      ))}

      {showConfirm && selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowConfirm(false)}>
          <div className="bg-[#1F2937] rounded-t-2xl p-6 w-full max-w-md mx-4 border border-white/10"
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-center mb-2">Confirmar Coleta</h3>
            <p className="text-sm text-gray-400 text-center mb-5">
              {selected.pedido?.codigo || `COL-${selected.id?.slice(0, 6)}`}
            </p>

            <div className="bg-[#111827] rounded-xl p-4 mb-5 space-y-2">
              {selected.endereco && (
                <p className="text-sm flex items-start gap-2">
                  <MapPin size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <span>{selected.endereco}</span>
                </p>
              )}
              {selected.pedido?.destino_cidade && (
                <p className="text-sm text-gray-300">Destino: {selected.pedido.destino_cidade}/{selected.pedido.destino_estado}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 h-11 border border-white/10 rounded-xl text-sm text-gray-400">Cancelar</button>
              <button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}
                className="flex-1 h-11 bg-green-500 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {confirmMutation.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirmando...</>
                ) : (
                  <><CheckCircle size={16} /> Confirmar Coleta</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
