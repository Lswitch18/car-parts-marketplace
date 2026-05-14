import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '../../lib/mobileApi';
import { getCurrentPosition } from '../../lib/geo';
import ScannerCamera from '../../components/mobile/ScannerCamera';
import {
  MapPin, CheckCircle, Navigation, Clock, Box, AlertTriangle, ArrowRight,
  RefreshCw, Map, ScanLine,
} from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  em_transito: 'Em Trânsito',
  coletado: 'Coletado',
  cancelado: 'Cancelado',
};

const STATUS_CORES: Record<string, string> = {
  pendente: 'bg-yellow-400/15 text-yellow-400',
  em_transito: 'bg-blue-400/15 text-blue-400',
  coletado: 'bg-green-400/15 text-green-400',
  cancelado: 'bg-red-400/15 text-red-400',
};

export default function WorkerColetas() {
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [selected, setSelected] = useState<any>(null);
  const [showAction, setShowAction] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState('');

  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['worker', 'coletas', filtroStatus],
    queryFn: () => mobileApi.coletas.list({ status: filtroStatus }),
    refetchInterval: 15000,
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationFn: async (novoStatus: string) => {
      const gps = await getCurrentPosition();
      const payload: any = { status: novoStatus };
      if (novoStatus === 'coletado' || novoStatus === 'em_transito') {
        payload[novoStatus === 'coletado' ? 'data_coleta' : 'data_saida'] = new Date().toISOString();
      }
      if (gps) {
        payload[`latitude_${novoStatus}`] = gps.latitude;
        payload[`longitude_${novoStatus}`] = gps.longitude;
      }
      return mobileApi.coletas.update(selected.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'coletas'] });
      setShowAction(false);
      setSelected(null);
    },
  });

  const rows = Array.isArray(data) ? data : (data as any)?.rows || [];
  const hoje = rows.filter((r: any) => {
    if (!r.created_at) return true;
    return new Date(r.created_at).toDateString() === new Date().toDateString() || r.status === 'pendente';
  });

  function makeAddress(row: any) {
    const p = row.pedido || {};
    const parts = [p.destino_cidade, p.destino_estado].filter(Boolean);
    return parts.join(', ') || 'Japão';
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Coletas</h1>
            <p className="text-sm text-gray-400 mt-0.5">{hoje.length} tarefa(s)</p>
          </div>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['worker', 'coletas'] })}
            className="w-9 h-9 bg-[#111827] rounded-xl flex items-center justify-center border border-white/5">
            <RefreshCw size={16} className={`text-gray-400 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
          {['pendente', 'em_transito', 'coletado', 'cancelado'].map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filtroStatus === s ? 'bg-blue-500 text-white' : 'bg-[#111827] text-gray-400 border border-white/5'
              }`}>
              {STATUS_LABEL[s] || s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Carregando coletas...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle size={48} className="text-red-400 mb-3" />
          <p className="text-sm text-red-400">Erro ao carregar</p>
          <button onClick={() => window.location.reload()} className="mt-4 h-10 px-4 bg-blue-500 rounded-xl text-sm font-medium">
            Tentar novamente
          </button>
        </div>
      ) : hoje.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <CheckCircle size={64} className="text-green-500 mb-4" />
          <h2 className="text-lg font-semibold">Nenhuma coleta pendente</h2>
          <p className="text-sm text-gray-400 mt-1">Todas as coletas foram realizadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hoje.map((row: any) => {
            const p = row.pedido || {};
            const endereco = makeAddress(row);
            return (
              <div key={row.id}
                className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden active:scale-[0.99] transition-transform">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold">{p.codigo || `COL-${row.id?.slice(0, 6)}`}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${STATUS_CORES[row.status] || ''}`}>
                          {STATUS_LABEL[row.status] || row.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">{row.id}</p>
                    </div>
                  </div>

                  <div className="bg-[#0B1220] rounded-xl p-3 space-y-2 mb-3">
                    <p className="text-sm flex items-start gap-2.5">
                      <MapPin size={16} className="text-blue-400 mt-0.5 shrink-0" />
                      <span className="text-gray-200">{endereco}</span>
                    </p>
                    {p.peso_kg && (
                      <p className="text-xs flex items-center gap-2 text-gray-500">
                        <Box size={12} /> {p.peso_kg}kg · ¥{p.valor?.toLocaleString?.() || p.valor}
                      </p>
                    )}
                    {row.data_coleta && (
                      <p className="text-xs flex items-center gap-1 text-gray-500">
                        <Clock size={12} /> Coletado: {new Date(row.data_coleta).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {row.status === 'pendente' && (
                      <>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 h-10 bg-[#0B1220] border border-white/10 rounded-xl text-xs font-medium text-blue-400 flex items-center justify-center gap-1.5 active:bg-white/5">
                          <Navigation size={14} /> Maps
                        </a>
                        <a href={`https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 h-10 bg-[#0B1220] border border-white/10 rounded-xl text-xs font-medium text-blue-400 flex items-center justify-center gap-1.5 active:bg-white/5">
                          <Map size={14} /> Waze
                        </a>
                        <button onClick={() => { setSelected(row); updateMutation.mutate('em_transito'); }}
                          disabled={updateMutation.isPending}
                          className="flex-1 h-10 bg-blue-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-blue-600 disabled:opacity-50">
                          <ArrowRight size={14} /> Iniciar
                        </button>
                      </>
                    )}
                    {row.status === 'em_transito' && (
                      <>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 h-10 bg-[#0B1220] border border-white/10 rounded-xl text-xs font-medium text-green-400 flex items-center justify-center gap-1.5 active:bg-white/5">
                          <Navigation size={14} /> Navegar
                        </a>
                        <button onClick={() => { setSelected(row); setShowScanner(true); }}
                          className="flex-1 h-10 bg-green-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-green-600">
                          <ScanLine size={14} /> Escanear
                        </button>
                      </>
                    )}
                    {row.status === 'coletado' && (
                      <div className="w-full h-10 bg-green-500/10 rounded-xl flex items-center justify-center gap-2 text-sm text-green-400">
                        <CheckCircle size={16} /> Coletado em {new Date(row.data_coleta).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {row.status === 'cancelado' && (
                      <div className="w-full h-10 bg-red-500/10 rounded-xl flex items-center justify-center gap-2 text-sm text-red-400">
                        <AlertTriangle size={16} /> Cancelado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showScanner && selected && (
        <ScannerCamera
          onScan={(code) => { setScannedCode(code); setShowScanner(false); setShowAction(true); }}
          onClose={() => { setShowScanner(false); setSelected(null); }}
          expectedCode={selected.pedido?.codigo || ''}
        />
      )}

      {showAction && selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={() => setShowAction(false)}>
          <div className="bg-[#1F2937] rounded-t-3xl p-6 w-full max-w-md border border-white/10"
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-bold text-center mb-1">Confirmar Coleta</h2>
            <p className="text-sm text-gray-400 text-center mb-5">{selected.pedido?.codigo || selected.id?.slice(0, 8)}</p>

            {scannedCode && (
              <div className={`text-center mb-4 py-3 px-4 rounded-xl text-sm font-medium ${
                scannedCode === selected.pedido?.codigo
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-red-500/15 text-red-400'
              }`}>
                {scannedCode === selected.pedido?.codigo
                  ? <>✅ Código verificado: <span className="font-mono">{scannedCode}</span></>
                  : <>❌ Código não confere: <span className="font-mono">{scannedCode}</span></>
                }
              </div>
            )}

            <div className="bg-[#111827] rounded-xl p-4 mb-5 space-y-3">
              <p className="text-sm flex items-start gap-2.5">
                <MapPin size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <span>{makeAddress(selected)}</span>
              </p>
              {selected.pedido?.peso_kg && (
                <p className="text-xs text-gray-400">Peso: {selected.pedido.peso_kg}kg</p>
              )}
            </div>

            <div className="space-y-3">
              <button onClick={() => updateMutation.mutate('coletado')} disabled={updateMutation.isPending || scannedCode !== selected.pedido?.codigo}
                className="w-full h-14 bg-green-500 rounded-2xl text-base font-bold disabled:opacity-50 flex items-center justify-center gap-3 active:bg-green-600">
                {updateMutation.isPending ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirmando...</>
                ) : scannedCode !== selected.pedido?.codigo ? (
                  <><ScanLine size={22} /> Escaneie o código primeiro</>
                ) : (
                  <><CheckCircle size={22} /> CONFIRMAR COLETA</>
                )}
              </button>

              <button onClick={() => { setShowScanner(true); setShowAction(false); }}
                className="w-full h-12 border border-white/10 rounded-2xl text-sm font-medium text-blue-400 flex items-center justify-center gap-2 active:bg-white/5">
                <ScanLine size={16} /> Escanear novamente
              </button>

              {makeAddress(selected) && (
                <div className="grid grid-cols-2 gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(makeAddress(selected))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="h-12 border border-white/10 rounded-2xl text-sm font-medium text-blue-400 flex items-center justify-center gap-2 active:bg-white/5">
                    <Navigation size={16} /> Google Maps
                  </a>
                  <a href={`https://waze.com/ul?q=${encodeURIComponent(makeAddress(selected))}&navigate=yes`}
                    target="_blank" rel="noopener noreferrer"
                    className="h-12 border border-white/10 rounded-2xl text-sm font-medium text-blue-400 flex items-center justify-center gap-2 active:bg-white/5">
                    <Map size={16} /> Waze
                  </a>
                </div>
              )}

              <button onClick={() => setShowAction(false)}
                className="w-full h-12 rounded-2xl text-sm text-gray-400 active:bg-white/5">Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
