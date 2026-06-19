import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '@/modules/logistics/api/mobileApi';
import { getCurrentPosition } from '@/modules/shared/lib/geo';
import { getCityCoords, haversineKm } from '@/modules/shared/lib/distance';
import { useGpsTracking } from '@/modules/logistics/hooks/useGpsTracking';
import ScannerCamera from '@/modules/logistics/components/mobile/ScannerCamera';
import BiometricScanner from '@/modules/logistics/components/mobile/BiometricScanner';
import SignaturePad from '@/modules/logistics/components/mobile/SignaturePad';
import {
  MapPin, CheckCircle, Navigation, Clock, Box, AlertTriangle, ArrowRight,
  RefreshCw, ScanLine, UserCheck, PenTool
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
  const [batchMode, setBatchMode] = useState(false);
  const [batchCount, setBatchCount] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  // Biometric & Signature states
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [batchFinalize, setBatchFinalize] = useState(false);

  const { data, isLoading, error, isRefetching } = useQuery({
    queryKey: ['worker', 'coletas', filtroStatus],
    queryFn: () => mobileApi.coletas.list({ status: filtroStatus }),
    refetchInterval: 15000,
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationFn: async (payloadData: { status: string; assinatura?: string }) => {
      const gps = await getCurrentPosition();
      const payload: any = { status: payloadData.status };
      if (payloadData.status === 'coletado') {
        payload.data_coleta = new Date().toISOString();
      }
      if (payloadData.assinatura) {
        payload.assinatura = payloadData.assinatura;
        payload.biometria_verificada = true;
      }
      if (gps) {
        payload[`latitude_${payloadData.status}`] = gps.latitude;
        payload[`longitude_${payloadData.status}`] = gps.longitude;
      }
      return mobileApi.coletas.update(selected.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'coletas'] });
      setShowAction(false);
      setSelected(null);
    },
  });

  const batchMutation = useMutation({
    mutationFn: async (coletaId: string) => {
      const gps = await getCurrentPosition();
      const payload: any = { status: 'coletado', data_coleta: new Date().toISOString() };
      if (gps) { payload.latitude_coleta = gps.latitude; payload.longitude_coleta = gps.longitude; }
      return mobileApi.coletas.update(coletaId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker', 'coletas'] });
    },
  });

  const rows = Array.isArray(data) ? data : (data as any)?.rows || [];
  const [sortedRows, setSortedRows] = useState<any[]>([]);
  const [userPos, setUserPos] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getCurrentPosition().then(pos => {
      if (pos) setUserPos({ latitude: pos.latitude, longitude: pos.longitude });
    });
  }, []);

  useEffect(() => {
    if (!rows.length) { setSortedRows([]); return; }
    const items = rows.map((r: any) => ({
      ...r,
      destino_cidade: r.pedido?.destino_cidade,
      destino_estado: r.pedido?.destino_estado,
      _dist: 0,
    }));
    if (userPos) {
      for (const item of items) {
        const coords = getCityCoords(item.destino_cidade || '', item.destino_estado || '');
        item._dist = haversineKm(userPos.latitude, userPos.longitude, coords.lat, coords.lng);
      }
      items.sort((a: any, b: any) => a._dist - b._dist);
    }
    setSortedRows(items);
  }, [rows, userPos]);

  const { startTracking: startGps } = useGpsTracking({
    motoristaId: 'a0000003-0000-0000-0000-000000000009',
    interval: 30000,
  });

  useEffect(() => { startGps(); }, [startGps]);

  const totalDoDia = sortedRows.length;
  const concluidas = sortedRows.filter((r: any) => r.status === 'coletado' || r.status === 'entregue').length;
  const pendentes = sortedRows.filter((r: any) => r.status === 'pendente' || r.status === 'em_transito').length;
  const progresso = totalDoDia > 0 ? Math.round(concluidas * 100 / totalDoDia) : 0;

  const hoje = sortedRows.filter((r: any) => {
    if (!r.created_at) return true;
    return new Date(r.created_at).toDateString() === new Date().toDateString() || r.status === 'pendente';
  });

  function makeAddress(row: any) {
    const p = row.pedido || {};
    const parts = [p.destino_cidade, p.destino_estado].filter(Boolean);
    return parts.join(', ') || 'Japão';
  }

  // Intercept handlers
  const initiateSingleVerification = () => {
    const faceTemplate = localStorage.getItem('driver_face_template');
    if (!faceTemplate) {
      setErrorMessage('Você precisa cadastrar sua biometria facial e documentos na aba CADASTRO antes de realizar a coleta.');
      return;
    }
    setErrorMessage(null);
    setBatchFinalize(false);
    setShowFaceVerification(true);
  };

  const initiateBatchVerification = () => {
    const faceTemplate = localStorage.getItem('driver_face_template');
    if (!faceTemplate) {
      alert('Você precisa cadastrar sua biometria facial e documentos na aba CADASTRO antes de realizar coletas.');
      return;
    }
    setBatchFinalize(true);
    setShowFaceVerification(true);
  };

  const handleFaceSuccess = (facePhoto: string) => {
    setShowFaceVerification(false);
    setShowSignaturePad(true);
  };

  const handleSignatureSave = (signatureBase64: string) => {
    setShowSignaturePad(false);
    if (batchFinalize) {
      // Complete batch collection
      localStorage.setItem(`batch_signature_${Date.now()}`, signatureBase64);
      setBatchMode(false);
      setBatchCount(0);
      setBatchFinalize(false);
      alert('Coleta em Lote concluída com sucesso com biometria e assinatura!');
    } else {
      // Complete single collection
      localStorage.setItem(`col_sig_${selected.id}`, signatureBase64);
      updateMutation.mutate({ status: 'coletado', assinatura: signatureBase64 });
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="mb-4">
        {/* Stats bar */}
        <div className="bg-[#111827] rounded-xl p-4 border border-white/5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Coletas</h1>
            <span className="text-xs text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-blue-400">{pendentes}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Pendentes</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-green-400">{concluidas}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Concluídas</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-white">{totalDoDia}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Total</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-[#0B1220] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }} />
          </div>
          <p className="text-[10px] text-gray-500 text-right mt-1">{progresso}% concluído</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{hoje.length} tarefa(s) hoje</p>
          <div className="flex items-center gap-2">
            {hoje.filter(r => r.status === 'pendente').length > 1 && (
              <button onClick={() => { setShowScanner(true); setScannedCode(''); setBatchMode(true); setBatchCount(0); }}
                className="h-9 px-3 bg-blue-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:bg-blue-600">
                <ScanLine size={14} /> Coletar em Lote
              </button>
            )}
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['worker', 'coletas'] })}
              className="w-9 h-9 bg-[#111827] rounded-xl flex items-center justify-center border border-white/5">
              <RefreshCw size={16} className={`text-gray-400 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Batch progress bar */}
        {batchMode && batchCount > 0 && (
          <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm font-medium text-green-400">{batchCount} pacote(s) coletado(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={initiateBatchVerification}
                className="h-8 px-3 bg-green-500 hover:bg-green-600 text-black text-xs font-bold rounded-lg flex items-center gap-1 transition-all">
                <PenTool size={12} /> Assinar
              </button>
              <button onClick={() => { setBatchMode(false); setBatchCount(0); }}
                className="text-xs text-gray-400 underline">Cancelar</button>
            </div>
          </div>
        )}

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
              <div key={row.id} onClick={() => { setSelected(row); setShowLabel(true); }}
                className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden active:scale-[0.99] transition-transform cursor-pointer">
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
                    {row._dist > 0 && (
                      <p className="text-[10px] text-blue-400/60 font-mono">
                        🚗 {row._dist < 1 ? `${(row._dist * 1000).toFixed(0)}m` : `${row._dist.toFixed(1)}km`}
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
                          className="flex-[2] h-11 bg-blue-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-blue-600">
                          <Navigation size={15} /> Ir
                        </a>
                        <button onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            setSelected(row);
                            await updateMutation.mutateAsync({ status: 'em_transito' });
                          } catch (err) {
                            alert('Erro ao iniciar coleta: ' + (err as any)?.message);
                          }
                        }}
                          disabled={updateMutation.isPending}
                          className="flex-[1] h-11 bg-[#111827] border border-white/10 rounded-xl text-xs font-medium text-gray-300 flex items-center justify-center gap-1.5 active:bg-white/5 disabled:opacity-50">
                          <ArrowRight size={14} /> Iniciar
                        </button>
                      </>
                    )}
                    {row.status === 'em_transito' && (
                      <>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-[2] h-11 bg-green-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-green-600">
                          <Navigation size={15} /> Ir
                        </a>
                        <button onClick={(e) => { e.stopPropagation(); setSelected(row); setShowScanner(true); }}
                          className="flex-[1] h-11 bg-[#111827] border border-white/10 rounded-xl text-xs font-medium text-gray-300 flex items-center justify-center gap-1.5 active:bg-white/5">
                          <ScanLine size={14} /> Scan
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

      {/* Label Preview Modal */}
      {showLabel && selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={() => setShowLabel(false)}>
          <div className="bg-[#1F2937] rounded-t-3xl p-6 w-full max-w-md border border-white/10 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-1.5 bg-gray-600 rounded-full mx-auto mb-5" />
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl font-black">L</span>
            </div>
            <h2 className="text-xl font-bold text-center font-mono">{selected.pedido?.codigo || selected.id?.slice(0, 8)}</h2>
            <p className="text-xs text-gray-500 text-center mt-1">{selected.id}</p>

            <div className="bg-[#111827] rounded-xl p-4 my-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Destino</p>
                  <p className="text-sm font-medium">{makeAddress(selected)}</p>
                </div>
              </div>
              {selected.pedido?.peso_kg && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Peso</span>
                  <span className="font-medium">{selected.pedido.peso_kg}kg</span>
                </div>
              )}
              {selected.pedido?.valor && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Valor</span>
                  <span className="font-medium">¥{(selected.pedido.valor || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                <span className="text-gray-400">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_CORES[selected.status] || ''}`}>
                  {STATUS_LABEL[selected.status] || selected.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(makeAddress(selected))}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 h-12 bg-blue-500 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 active:bg-blue-600">
                <Navigation size={16} /> Ir
              </a>
              {selected.status === 'em_transito' && (
                <button onClick={() => { setShowLabel(false); setShowScanner(true); }}
                  className="flex-1 h-12 bg-green-500 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 active:bg-green-600">
                  <ScanLine size={16} /> Escanear
                </button>
              )}
            </div>

            <button onClick={() => setShowLabel(false)}
              className="w-full h-12 mt-3 rounded-2xl text-sm text-gray-400 active:bg-white/5">Fechar</button>
          </div>
        </div>
      )}

      {showScanner && (
        <ScannerCamera
          onScan={(code) => {
            setScannedCode(code);
            if (batchMode) {
              const match = sortedRows.find((r: any) => r.pedido?.codigo === code);
              if (match) {
                batchMutation.mutate(match.id);
                setBatchCount(c => c + 1);
                try { navigator.vibrate?.(100); } catch {}
              }
            } else {
              setShowScanner(false);
              setShowAction(true);
            }
          }}
          onClose={() => { setShowScanner(false); setSelected(null); setBatchMode(false); setBatchCount(0); setScannedCode(''); }}
          expectedCode={batchMode ? '' : (selected?.pedido?.codigo || '')}
          batchMode={batchMode}
          scannedCount={batchCount}
          totalCount={sortedRows.filter(r => r.status === 'pendente').length}
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

            {errorMessage && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-semibold mb-4 text-center">
                ⚠️ {errorMessage}
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
              <button onClick={initiateSingleVerification} disabled={updateMutation.isPending || scannedCode !== selected.pedido?.codigo}
                className="w-full h-14 bg-green-500 rounded-2xl text-base font-bold disabled:opacity-50 flex items-center justify-center gap-3 active:bg-green-600">
                {updateMutation.isPending ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirmando...</>
                ) : scannedCode !== selected.pedido?.codigo ? (
                  <><ScanLine size={22} /> Escaneie o código primeiro</>
                ) : (
                  <><UserCheck size={22} /> BIOMETRIA & CONFIRMAÇÃO</>
                )}
              </button>

              <button onClick={() => { setShowScanner(true); setShowAction(false); }}
                className="w-full h-12 border border-white/10 rounded-2xl text-sm font-medium text-blue-400 flex items-center justify-center gap-2 active:bg-white/5">
                <ScanLine size={16} /> Escanear novamente
              </button>

              {makeAddress(selected) && (
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(makeAddress(selected))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full h-12 border border-white/10 rounded-2xl text-sm font-medium text-blue-400 flex items-center justify-center gap-2 active:bg-white/5">
                  <Navigation size={16} /> Abrir no Google Maps
                </a>
              )}

              <button onClick={() => setShowAction(false)}
                className="w-full h-12 rounded-2xl text-sm text-gray-400 active:bg-white/5">Voltar</button>
            </div>
          </div>
        </div>
      )}

      {/* Face Biometric Verification Scan */}
      {showFaceVerification && (
        <BiometricScanner
          mode="face"
          onCapture={handleFaceSuccess}
          onClose={() => setShowFaceVerification(false)}
          title="Verificação de Identidade"
        />
      )}

      {/* Signature Pad screen */}
      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onCancel={() => setShowSignaturePad(false)}
          title={batchFinalize ? "Assinatura do Recebedor (Lote)" : "Assinatura do Recebedor"}
          packageCount={batchFinalize ? batchCount : 1}
        />
      )}
    </div>
  );
}
