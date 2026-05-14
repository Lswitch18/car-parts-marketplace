import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

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

  useEffect(() => {
    let active = true;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn('[Scanner] Camera error:', err);
      }
    }
    start();
    return () => { active = false; stopCamera(); };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function handleManualInput(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).codigo as HTMLInputElement;
    const code = input.value.trim();
    if (code) { stopCamera(); onScan(code); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={batchMode ? undefined : onClose}>
      <div className="relative flex-1 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <button onClick={onClose} className="w-10 h-10 bg-black/50 rounded-xl flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          <span className="text-sm font-medium text-white bg-black/50 px-4 py-2 rounded-full">
            {batchMode ? `Escaneie o pacote ${(scannedCount || 0) + 1} de ${totalCount || '?'}` : 'Escaneie o código'}
          </span>
        </div>

        <video ref={videoRef} autoPlay playsInline muted
          className="flex-1 w-full object-cover" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-blue-400 rounded-2xl opacity-60" />
        </div>

        <div className={`bg-[#1F2937] ${batchMode ? 'p-4' : 'p-5 rounded-t-3xl'}`}>
          {batchMode && (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-medium text-green-400">
                ✅ {scannedCount || 0} escaneado(s)
              </span>
              <button onClick={onClose}
                className="px-4 h-8 bg-blue-500 rounded-lg text-xs font-medium">
                Finalizar lote
              </button>
            </div>
          )}
          <form onSubmit={handleManualInput} className="flex gap-2">
            <input name="codigo" placeholder={batchMode ? "Digite o próximo código..." : "Ou digite o código manualmente..."}
              className="flex-1 h-12 bg-[#111827] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500"
              autoComplete="off" autoFocus />
            <button type="submit"
              className="h-12 px-5 bg-blue-500 rounded-xl text-sm font-semibold whitespace-nowrap">
              OK
            </button>
          </form>
          {expectedCode && !batchMode && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Código esperado: <span className="text-blue-400 font-mono">{expectedCode}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
