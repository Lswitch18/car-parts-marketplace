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
  const scannerRef = useRef<any>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'start' | 'scanning' | 'error'>('start');
  const [errorMsg, setErrorMsg] = useState('');
  const [permAsk, setPermAsk] = useState(false);

  async function startScanner() {
    setPermAsk(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('scanner-element');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 180 } },
        (decodedText: string) => {
          try { navigator.vibrate?.(80); } catch {}
          scanner.stop().catch(() => {});
          onScan(decodedText);
        },
        () => {},
      );
      setStatus('scanning');
    } catch (err: any) {
      console.error('[Scanner] Error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Erro ao acessar câmera');
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const val = (e.target as HTMLFormElement).codigo.value.trim();
    if (val) {
      try { navigator.vibrate?.(50); } catch {}
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
      onScan(val);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 flex flex-col">
        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <button onClick={() => { scannerRef.current?.stop().catch(() => {}); onClose(); }}
            className="w-10 h-10 bg-black/50 rounded-xl flex items-center justify-center">
            <X size={20} className="text-white" />
          </button>
          <span className="text-sm font-medium text-white bg-black/50 px-4 py-2 rounded-full">
            {batchMode
              ? `📦 ${scannedCount || 0}/${totalCount || '?'}`
              : 'Aponte para o código'}
          </span>
        </div>

        {/* Scanner viewfinder */}
        {status === 'start' && !permAsk && (
          <div className="flex-1 flex items-center justify-center bg-[#0B1220]">
            <button onClick={startScanner}
              className="flex flex-col items-center gap-4 px-10 py-8 rounded-2xl active:scale-95 transition-transform">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Camera size={36} className="text-white" />
              </div>
              <p className="text-white font-bold text-lg">Abrir Câmera</p>
              <p className="text-gray-400 text-xs text-center">Para escanear o código de barras<br/>da etiqueta do pacote</p>
            </button>
          </div>
        )}

        {/* Permission loading */}
        {permAsk && status === 'start' && (
          <div className="flex-1 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white text-sm">Solicitando permissão da câmera...</p>
              <p className="text-gray-500 text-xs mt-2">Aceite a permissão no navegador</p>
            </div>
          </div>
        )}

        {/* Active scanner */}
        {status === 'scanning' && (
          <div className="flex-1 relative bg-black">
            <div ref={divRef} id="scanner-element" className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-48 border-2 border-blue-400 rounded-2xl opacity-50" />
            </div>
            <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/40">
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex-1 flex items-center justify-center bg-[#0B1220]">
            <div className="text-center px-6">
              <CameraOff size={40} className="mx-auto text-red-400 mb-3" />
              <p className="text-red-400 text-sm font-medium mb-1">Câmera indisponível</p>
              <p className="text-gray-500 text-xs mb-4">{errorMsg}</p>
              <button onClick={startScanner}
                className="h-10 px-5 bg-blue-500 rounded-xl text-sm font-medium">
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className={`bg-[#1F2937] ${batchMode ? 'p-4' : 'p-5 rounded-t-3xl'}`}>
          {batchMode && (scannedCount || 0) > 0 && (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-medium text-green-400">✅ {scannedCount} coletado(s)</span>
              <button onClick={() => { scannerRef.current?.stop().catch(() => {}); onClose(); }}
                className="px-4 h-8 bg-blue-500 rounded-lg text-xs font-medium">Finalizar</button>
            </div>
          )}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input name="codigo"
              placeholder={batchMode ? "Código do pacote..." : "Ou digite o código manualmente..."}
              className="flex-1 h-12 bg-[#111827] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500"
              autoComplete="off" />
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
