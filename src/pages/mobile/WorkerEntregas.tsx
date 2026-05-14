import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '../../lib/mobileApi';
import { getCurrentPosition } from '../../lib/geo';
import ScannerCamera from '../../components/mobile/ScannerCamera';
import {
  MapPin, CheckCircle, Navigation, Box, AlertTriangle, RefreshCw, Map,
  ScanLine, User, Pen,
} from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  em_transito: 'Em Trânsito',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  problema: 'Problema',
};

const STATUS_CORES: Record<string, string> = {
  pendente: 'bg-yellow-400/15 text-yellow-400',
  em_transito: 'bg-blue-400/15 text-blue-400',
  entregue: 'bg-green-400/15 text-green-400',
  cancelado: 'bg-red-400/15 text-red-400',
  problema: 'bg-orange-400/15 text-orange-400',
};

export default function WorkerEntregas() {
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [selected, setSelected] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['worker', 'entregas', filtroStatus],
    queryFn: () => mobileApi.entregas.list({ status: filtroStatus }),
    refetchInterval: 15000,
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationFn: async (novoStatus: string) => {
      const gps = await getCurrentPosition();
      const payload: any = { status: novoStatus };
      if (novoStatus === 'entregue') {
        payload.data_entrega = new Date().toISOString();
        payload.recebedor = recipientName || 'Confirmado no app';
      }
      if (gps) {
        payload[`latitude_${novoStatus}`] = gps.latitude;
        payload[`longitude_${novoStatus}`] = gps.longitude;
      }
      return mobileApi.entregas.update(selected.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'entregas'] });
      setShowConfirm(false);
      setSelected(null);
      setRecipientName('');
      setScannedCode('');
    },
  });

  const reportProblem = useMutation({
    mutationFn: async () => {
      const gps = await getCurrentPosition();
      return mobileApi.entregas.update(selected.id, {
        status: 'problema',
        obs: 'Cliente ausente / endereço não encontrado',
        ...(gps ? { latitude_problema: gps.latitude, longitude_problema: gps.longitude } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'entregas'] });
      setShowConfirm(false);
      setSelected(null);
    },
  });

  const rows = Array.isArray(data) ? data : (data as any)?.rows || [];
  const totalDoDia = rows.length;
  const concluidas = rows.filter((r: any) => r.status === 'entregue').length;
  const pendentes = rows.filter((r: any) => r.status === 'pendente' || r.status === 'em_transito').length;
  const progresso = totalDoDia > 0 ? Math.round(concluidas * 100 / totalDoDia) : 0;

  const hoje = rows.filter((r: any) => {
    if (!r.created_at) return true;
    return new Date(r.created_at).toDateString() === new Date().toDateString() || r.status === 'pendente' || r.status === 'em_transito';
  });

  function makeAddress(row: any) {
    const p = row.pedido || {};
    return row.destino || [p.destino_cidade, p.destino_estado].filter(Boolean).join(', ') || 'Japão';
  }

  function handleScan(code: string) {
    setScannedCode(code);
    setShowScanner(false);
    setShowConfirm(true);
  }

  function handleConfirmDelivery() {
    updateMutation.mutate('entregue');
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4">
        {/* Stats bar */}
        <div className="bg-[#111827] rounded-xl p-4 border border-white/5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Entregas</h1>
            <span className="text-xs text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-yellow-400">{pendentes}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Pendentes</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-green-400">{concluidas}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Entregues</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-white">{totalDoDia}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Total</p>
            </div>
          </div>
          <div className="h-2 bg-[#0B1220] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }} />
          </div>
          <p className="text-[10px] text-gray-500 text-right mt-1">{progresso}% concluído</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{hoje.length} tarefa(s)</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['worker', 'entregas'] })}
            className="w-9 h-9 bg-[#111827] rounded-xl flex items-center justify-center border border-white/5">
            <RefreshCw size={16} className={`text-gray-400 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
          {['pendente', 'em_transito', 'entregue', 'problema', 'cancelado'].map(s => (
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
          <p className="text-sm text-gray-400">Carregando entregas...</p>
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
          <h2 className="text-lg font-semibold">Nenhuma entrega pendente</h2>
          <p className="text-sm text-gray-400 mt-1">Todas as entregas foram realizadas</p>
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
                        <h3 className="text-base font-bold">{p.codigo || `ENT-${row.id?.slice(0, 6)}`}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${STATUS_CORES[row.status] || ''}`}>
                          {STATUS_LABEL[row.status] || row.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">{row.id}</p>
                    </div>
                  </div>

                  <div className="bg-[#0B1220] rounded-xl p-3 space-y-2 mb-3">
                    <p className="text-sm flex items-start gap-2.5">
                      <MapPin size={16} className="text-green-400 mt-0.5 shrink-0" />
                      <span className="text-gray-200">{endereco}</span>
                    </p>
                    {p.cliente?.nome && (
                      <p className="text-sm flex items-start gap-2">
                        <User size={14} className="text-gray-500 mt-0.5 shrink-0" />
                        <span className="text-gray-400">{p.cliente.nome}</span>
                      </p>
                    )}
                    {p.peso_kg && (
                      <p className="text-xs flex items-center gap-2 text-gray-500">
                        <Box size={12} /> {p.peso_kg}kg · ¥{p.valor?.toLocaleString?.() || p.valor}
                      </p>
                    )}
                    {row.entregue_em && (
                      <p className="text-xs flex items-center gap-1 text-gray-500">
                        <CheckCircle size={12} /> Entregue: {new Date(row.entregue_em).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {row.recebedor && (
                      <p className="text-xs flex items-center gap-1 text-green-400">
                        <Pen size={12} /> Recebedor: {row.recebedor}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {(row.status === 'pendente' || row.status === 'em_transito') && (
                      <>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 h-10 bg-[#0B1220] border border-white/10 rounded-xl text-xs font-medium text-green-400 flex items-center justify-center gap-1.5 active:bg-white/5">
                          <Navigation size={14} /> Maps
                        </a>
                        <a href={`https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 h-10 bg-[#0B1220] border border-white/10 rounded-xl text-xs font-medium text-blue-400 flex items-center justify-center gap-1.5 active:bg-white/5">
                          <Map size={14} /> Waze
                        </a>
                        <button onClick={() => { setSelected(row); setShowScanner(true); setScannedCode(''); }}
                          className="flex-1 h-10 bg-green-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-green-600">
                          <ScanLine size={14} /> Entregar
                        </button>
                      </>
                    )}
                    {row.status === 'entregue' && (
                      <div className="w-full h-10 bg-green-500/10 rounded-xl flex items-center justify-center gap-2 text-sm text-green-400">
                        <CheckCircle size={16} /> Entregue para {row.recebedor || 'destinatário'}
                      </div>
                    )}
                    {row.status === 'problema' && (
                      <div className="w-full h-10 bg-orange-500/10 rounded-xl flex items-center justify-center gap-2 text-sm text-orange-400">
                        <AlertTriangle size={16} /> Problema reportado
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
          onScan={handleScan}
          onClose={() => { setShowScanner(false); setSelected(null); }}
          expectedCode={selected.pedido?.codigo || ''}
        />
      )}

      {showConfirm && selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={() => setShowConfirm(false)}>
          <div className="bg-[#1F2937] rounded-t-3xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-bold text-center mb-1">Confirmar Entrega</h2>
            <p className="text-sm text-gray-400 text-center mb-4">
              {selected.pedido?.codigo || selected.id?.slice(0, 8)}
            </p>

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

            <div className="bg-[#111827] rounded-xl p-4 mb-4 space-y-2">
              <p className="text-sm flex items-start gap-2.5">
                <MapPin size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>{makeAddress(selected)}</span>
              </p>
              {selected.pedido?.cliente?.nome && (
                <p className="text-sm flex items-start gap-2">
                  <User size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <span>{selected.pedido.cliente.nome}</span>
                </p>
              )}
            </div>

            {/* Nome do recebedor */}
            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-1.5">
                <Pen size={14} /> Nome do recebedor
              </label>
              <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)}
                placeholder="Digite o nome de quem recebeu"
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-green-500" />
            </div>

            <div className="space-y-3">
              <button onClick={handleConfirmDelivery} disabled={updateMutation.isPending || !recipientName.trim() || scannedCode !== selected.pedido?.codigo}
                className="w-full h-14 bg-green-500 rounded-2xl text-base font-bold disabled:opacity-50 flex items-center justify-center gap-3 active:bg-green-600">
                {updateMutation.isPending ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirmando...</>
                ) : !recipientName.trim() ? (
                  <><Pen size={20} /> Digite o nome do recebedor</>
                ) : scannedCode !== selected.pedido?.codigo ? (
                  <><ScanLine size={20} /> Escaneie o código primeiro</>
                ) : (
                  <><CheckCircle size={22} /> CONFIRMAR ENTREGA</>
                )}
              </button>

              {makeAddress(selected) && (
                <div className="grid grid-cols-2 gap-2">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(makeAddress(selected))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="h-12 border border-white/10 rounded-2xl text-sm font-medium text-green-400 flex items-center justify-center gap-2 active:bg-white/5">
                    <Navigation size={16} /> Google Maps
                  </a>
                  <a href={`https://waze.com/ul?q=${encodeURIComponent(makeAddress(selected))}&navigate=yes`}
                    target="_blank" rel="noopener noreferrer"
                    className="h-12 border border-white/10 rounded-2xl text-sm font-medium text-blue-400 flex items-center justify-center gap-2 active:bg-white/5">
                    <Map size={16} /> Waze
                  </a>
                </div>
              )}

              {/* Problema */}
              <button onClick={() => { if (confirm('Reportar problema com esta entrega?')) reportProblem.mutate(); }}
                disabled={reportProblem.isPending}
                className="w-full h-12 border border-red-500/30 rounded-2xl text-sm font-medium text-red-400 flex items-center justify-center gap-2 active:bg-red-500/5">
                <AlertTriangle size={16} /> {reportProblem.isPending ? 'Enviando...' : 'Problema — Cliente ausente'}
              </button>

              <button onClick={() => { setShowScanner(true); setShowConfirm(false); }}
                className="w-full h-12 rounded-2xl text-sm font-medium text-blue-400 flex items-center justify-center gap-2 active:bg-white/5">
                <ScanLine size={16} /> Escanear novamente
              </button>

              <button onClick={() => { setShowConfirm(false); setSelected(null); setScannedCode(''); }}
                className="w-full h-12 rounded-2xl text-sm text-gray-400 active:bg-white/5">Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
