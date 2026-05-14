import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '../../lib/mobileApi';
import {
  MapPin, CheckCircle, Navigation, Clock, Box,
} from 'lucide-react';

export default function WorkerColetas() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['worker', 'coletas'],
    queryFn: () => mobileApi.coletas.list({ status: 'pendente' }),
    refetchInterval: 30000,
  });

  const confirmMutation = useMutation({
    mutationFn: () => mobileApi.coletas.update(selected.id, {
      status: 'coletado',
      data_coleta: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'coletas'] });
      setShowConfirm(false);
      setSelected(null);
    },
  });

  const rows = Array.isArray(data) ? data : (data as any)?.rows || [];
  const hoje = rows.filter((r: any) => {
    if (!r.previsao) return true;
    return new Date(r.previsao).toDateString() === new Date().toDateString();
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Carregando coletas...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Coletas de Hoje</h1>
        <p className="text-sm text-gray-400 mt-1">{hoje.length} coleta(s) pendente(s)</p>
      </div>

      {hoje.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <CheckCircle size={64} className="text-green-500 mb-4" />
          <h2 className="text-lg font-semibold">Todas as coletas feitas!</h2>
          <p className="text-sm text-gray-400 mt-1">Nenhuma coleta pendente no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hoje.map((row: any) => (
            <div key={row.id} onClick={() => { setSelected(row); setShowConfirm(true); }}
              className="bg-[#111827] rounded-2xl p-5 border border-white/5 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold">{row.pedido?.codigo || `COL-${row.id?.slice(0, 6)}`}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{row.id?.slice(0, 8)}...</p>
                </div>
                <span className="text-[10px] px-3 py-1 rounded-full bg-yellow-400/15 text-yellow-400 font-semibold uppercase tracking-wide">Pendente</span>
              </div>

              <div className="bg-[#0B1220] rounded-xl p-3 space-y-2 mb-3">
                <p className="text-sm flex items-start gap-2">
                  <MapPin size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-gray-200">{row.endereco || row.pedido?.destino_cidade || 'Endereço não informado'}</span>
                </p>
                {row.pedido?.cliente?.nome && (
                  <p className="text-sm flex items-start gap-2">
                    <Box size={16} className="text-gray-500 mt-0.5 shrink-0" />
                    <span className="text-gray-400">{row.pedido.cliente.nome}</span>
                  </p>
                )}
                {row.previsao && (
                  <p className="text-xs flex items-center gap-1 text-gray-500">
                    <Clock size={12} /> Previsto: {new Date(row.previsao).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {row.endereco && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(row.endereco)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 h-10 bg-[#0B1220] border border-white/10 rounded-xl text-xs font-medium text-blue-400 flex items-center justify-center gap-1.5 active:bg-white/5">
                    <Navigation size={14} /> Navegar
                  </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); setSelected(row); setShowConfirm(true); }}
                  className="flex-1 h-10 bg-blue-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-blue-600">
                  <CheckCircle size={14} /> Confirmar Coleta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showConfirm && selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={() => setShowConfirm(false)}>
          <div className="bg-[#1F2937] rounded-t-3xl p-6 w-full max-w-md border border-white/10"
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />

            <h2 className="text-xl font-bold text-center mb-1">Confirmar Coleta</h2>
            <p className="text-sm text-gray-400 text-center mb-6">
              {selected.pedido?.codigo || `COL-${selected.id?.slice(0, 6)}`}
            </p>

            <div className="bg-[#111827] rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Endereço</p>
                  <p className="text-sm font-medium">{selected.endereco || '—'}</p>
                </div>
              </div>
              {selected.pedido?.destino_cidade && (
                <div className="flex items-start gap-3">
                  <Navigation size={18} className="text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Destino</p>
                    <p className="text-sm font-medium">{selected.pedido.destino_cidade}/{selected.pedido.destino_estado}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}
                className="w-full h-14 bg-green-500 rounded-2xl text-base font-bold disabled:opacity-50 flex items-center justify-center gap-3 active:bg-green-600">
                {confirmMutation.isPending ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirmando...</>
                ) : (
                  <><CheckCircle size={22} /> CONFIRMAR COLETA</>
                )}
              </button>

              {selected.endereco && (
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.endereco)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full h-12 border border-white/10 rounded-2xl text-sm font-medium text-blue-400 flex items-center justify-center gap-2 active:bg-white/5">
                  <Navigation size={16} /> Abrir no Google Maps
                </a>
              )}

              <button onClick={() => setShowConfirm(false)}
                className="w-full h-12 rounded-2xl text-sm text-gray-400 active:bg-white/5">Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
