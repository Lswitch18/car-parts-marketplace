import { useEffect, useRef, useState } from 'react';
import { X, Camera, CameraOff } from 'lucide-react';

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
  expectedCode?: string;
  batchMode?: boolean;
  scannedCount?: number;
  totalCount?: number;
}

export default function ScannerCamera({ onScan, onClose, expectedCode, batchMode, scannedCount, totalCount }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  async function startCamera() {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraStarted(true);
    } catch (err: any) {
      console.warn('[Scanner] Camera error:', err);
      setCameraError(err.message || 'Erro ao acessar câmera');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraStarted(false);
  }

  function feedback() {
    try { navigator.vibrate?.(100); } catch {}
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      gain.gain.value = 0.15;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  function handleManualInput(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).codigo as HTMLInputElement;
    const code = input.value.trim();
    if (code) { feedback(); onScan(code); input.value = ''; input.focus(); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={batchMode ? undefined : onClose}>
      <div className="relative flex-1 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <button onClick={onClose} className="w-10 h-10 bg-black/50 rounded-xl flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          <span className="text-sm font-medium text-white bg-black/50 px-4 py-2 rounded-full">
            {batchMode
              ? `📦 ${scannedCount || 0}/${totalCount || '?'} escaneados`
              : 'Escaneie o código'}
          </span>
        </div>

        {/* Camera or start button */}
        {!cameraStarted && !cameraError && (
          <div className="flex-1 flex items-center justify-center bg-black"
            onClick={startCamera}>
            <button onClick={startCamera}
              className="flex flex-col items-center gap-4 bg-[#1F2937] px-8 py-6 rounded-2xl border border-white/10 active:scale-95 transition-transform">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Camera size={32} className="text-white" />
              </div>
              <p className="text-white font-semibold text-base">Toque para abrir câmera</p>
              <p className="text-gray-400 text-xs">Permissão necessária para escanear</p>
            </button>
          </div>
        )}

        {cameraError && (
          <div className="flex-1 flex items-center justify-center bg-black">
            <div className="text-center px-6">
              <CameraOff size={40} className="mx-auto text-red-400 mb-3" />
              <p className="text-red-400 text-sm font-medium mb-1">Câmera indisponível</p>
              <p className="text-gray-500 text-xs mb-4">{cameraError}</p>
              <button onClick={startCamera}
                className="h-10 px-5 bg-blue-500 rounded-xl text-sm font-medium">
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {cameraStarted && (
          <video ref={videoRef} autoPlay playsInline muted
            className="flex-1 w-full object-cover" />
        )}

        {cameraStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-blue-400 rounded-2xl opacity-60" />
          </div>
        )}

        <div className={`bg-[#1F2937] ${batchMode ? 'p-4' : 'p-5 rounded-t-3xl'}`}>
          {batchMode && scannedCount && scannedCount > 0 && (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-medium text-green-400">
                ✅ {scannedCount} coletado(s)
              </span>
              <button onClick={onClose}
                className="px-4 h-8 bg-blue-500 rounded-lg text-xs font-medium">
                Finalizar
              </button>
            </div>
          )}
          <form onSubmit={handleManualInput} className="flex gap-2">
            <input name="codigo" placeholder={batchMode ? "Digite o código..." : "Ou digite manualmente..."}
              className="flex-1 h-12 bg-[#111827] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500"
              autoComplete="off" autoFocus />
            <button type="submit"
              className="h-12 px-5 bg-blue-500 rounded-xl text-sm font-semibold whitespace-nowrap">
              OK
            </button>
          </form>
          {!batchMode && expectedCode && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Código esperado: <span className="text-blue-400 font-mono">{expectedCode}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
