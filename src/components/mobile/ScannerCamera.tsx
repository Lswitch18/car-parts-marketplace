import { useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'idle' | 'camera' | 'input'>('idle');

  async function startCamera() {
    try {
      setMode('camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err: any) {
      console.warn('[Scanner] Camera error, falling back to file input:', err.message);
      setMode('input');
      inputRef.current?.click();
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function handleCode(code: string) {
    try { navigator.vibrate?.(50); } catch {}
    stopCamera();
    onScan(code);
  }

  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const val = (e.target as HTMLFormElement).codigo.value.trim();
    if (val) { handleCode(val); (e.target as HTMLFormElement).codigo.value = ''; }
  }

  function handleFileCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setMode('input');
      // User took a photo, now just show manual input
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 flex flex-col">
        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <button onClick={() => { stopCamera(); onClose(); }}
            className="w-10 h-10 bg-black/50 rounded-xl flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          <span className="text-sm font-medium text-white bg-black/50 px-4 py-2 rounded-full">
            {batchMode ? `📦 ${scannedCount || 0}/${totalCount || '?'}` : 'Escanear código'}
          </span>
        </div>

        {/* Camera preview */}
        {mode === 'camera' && (
          <video ref={videoRef} autoPlay playsInline muted
            className="flex-1 w-full object-cover"
            onClick={() => { stopCamera(); setMode('input'); }} />
        )}

        {/* Camera frame overlay */}
        {mode === 'camera' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-48 border-2 border-blue-400 rounded-2xl opacity-60" />
            <p className="absolute bottom-24 text-xs text-white/50">Toque na tela para digitar</p>
          </div>
        )}

        {/* Camera start button */}
        {mode === 'idle' && (
          <div className="flex-1 flex items-center justify-center bg-[#0B1220]">
            <button onClick={startCamera}
              className="flex flex-col items-center gap-4 px-10 py-8 rounded-2xl active:scale-95 transition-transform">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Camera size={36} className="text-white" />
              </div>
              <p className="text-white font-bold text-lg">Abrir Câmera</p>
              <p className="text-gray-400 text-xs text-center">Toque para escanear o código<br/>da etiqueta do pacote</p>
            </button>
          </div>
        )}

        {/* Hidden file input for Android native camera fallback */}
        <input ref={inputRef} type="file" accept="image/*" capture="environment"
          onChange={handleFileCapture} className="hidden" />

        {/* Bottom input area */}
        <div className={`bg-[#1F2937] ${batchMode ? 'p-4' : 'p-5 rounded-t-3xl'}`}>
          {batchMode && (scannedCount || 0) > 0 && (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-medium text-green-400">✅ {scannedCount} coletado(s)</span>
              <button onClick={() => { stopCamera(); onClose(); }}
                className="px-4 h-8 bg-blue-500 rounded-lg text-xs font-medium">Finalizar</button>
            </div>
          )}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input name="codigo"
              placeholder={batchMode ? "Código do pacote..." : "Ou digite o código..."}
              className="flex-1 h-12 bg-[#111827] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500"
              autoComplete="off" autoFocus />
            <button type="submit"
              className="h-12 px-5 bg-blue-500 rounded-xl text-sm font-semibold whitespace-nowrap">
              OK
            </button>
          </form>
          {!batchMode && expectedCode && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Esperado: <span className="text-blue-400 font-mono">{expectedCode}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
