import { useEffect, useRef, useState } from 'react';
import { X, Camera, CameraOff, CheckCircle, AlertTriangle } from 'lucide-react';

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
  const [status, setStatus] = useState<'start' | 'scanning' | 'error'>('start');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastScan, setLastScan] = useState('');
  const [lastMatch, setLastMatch] = useState<boolean | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  function beep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1800;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      setTimeout(() => ctx.close(), 300);
    } catch {}
  }

  async function startScanner() {
    setStatus('scanning');
    await new Promise(r => setTimeout(r, 150));
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('scanner-element');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: { exact: 'environment' } },
        { fps: 8, qrbox: { width: 280, height: 160 } },
        (decodedText: string) => {
          beep();
          try { navigator.vibrate?.(80); } catch {}
          setLastScan(decodedText);
          setLastMatch(!expectedCode || decodedText === expectedCode);
          setHistory(h => [decodedText, ...h].slice(0, 20));
          if (!batchMode) {
            scanner.stop().catch(() => {});
            setTimeout(() => onScan(decodedText), 400);
          } else {
            onScan(decodedText);
          }
        },
        () => {},
      );
    } catch (err: any) {
      console.error('[Scanner] Error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Erro ao acessar câmera');
      if (scannerRef.current && err.message?.includes('environment')) {
        try {
          await scannerRef.current.start(
            { facingMode: 'user' },
            { fps: 8, qrbox: { width: 280, height: 160 } },
            (d: string) => { beep(); onScan(d); },
            () => {},
          );
          setErrorMsg('');
        } catch {}
      }
    }
  }

  useEffect(() => {
    return () => { scannerRef.current?.stop().catch(() => {}); };
  }, []);

  function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const val = (e.target as HTMLFormElement).codigo.value.trim();
    if (val) {
      beep();
      try { navigator.vibrate?.(50); } catch {}
      setLastScan(val);
      setHistory(h => [val, ...h].slice(0, 20));
      (e.target as HTMLFormElement).codigo.value = '';
      if (batchMode) {
        onScan(val);
      } else {
        scannerRef.current?.stop().catch(() => {});
        setTimeout(() => onScan(val), 300);
      }
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
            {batchMode ? `📦 ${scannedCount || 0}/${totalCount || '?'}` : 'Aponte para o código'}
          </span>
        </div>

        {/* Scanner start */}
        {status === 'start' && (
          <div className="flex-1 flex items-center justify-center bg-[#0B1220]">
            <button onClick={startScanner}
              className="flex flex-col items-center gap-4 px-10 py-8 rounded-2xl active:scale-95 transition-transform">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Camera size={36} className="text-white" />
              </div>
              <p className="text-white font-bold text-lg">Abrir Câmera</p>
              <p className="text-gray-400 text-xs text-center">Para escanear o código de barras</p>
            </button>
          </div>
        )}

        {/* Scanner active */}
        {status === 'scanning' && (
          <div className="flex-1 relative bg-black">
            <div id="scanner-element" className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-48 border-2 border-blue-400 rounded-2xl opacity-40" />
            </div>

            {/* Último código escaneado */}
            {lastScan && (
              <div className={`absolute top-16 left-4 right-4 z-10 px-4 py-3 rounded-xl shadow-lg ${
                lastMatch === false ? 'bg-red-500/80' : 'bg-green-500/80'
              }`}>
                <div className="flex items-center gap-2">
                  {lastMatch === false
                    ? <AlertTriangle size={18} className="text-white shrink-0" />
                    : <CheckCircle size={18} className="text-white shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium">Código lido:</p>
                    <p className="text-white text-base font-bold font-mono truncate">{lastScan}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex-1 flex items-center justify-center bg-[#0B1220]">
            <div className="text-center px-6">
              <CameraOff size={40} className="mx-auto text-red-400 mb-3" />
              <p className="text-red-400 text-sm font-medium mb-1">Câmera indisponível</p>
              <p className="text-gray-500 text-xs mb-4 max-w-[200px]">{errorMsg}</p>
              <button onClick={startScanner}
                className="h-10 px-5 bg-blue-500 rounded-xl text-sm font-medium mb-2">
                Tentar novamente
              </button>
              <p className="text-xs text-gray-400">Ou digite o código manualmente abaixo</p>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="bg-[#1F2937] p-4">
          {batchMode && history.length > 0 && (
            <div className="mb-3 max-h-24 overflow-y-auto space-y-1">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Registro</p>
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                  <CheckCircle size={10} className="text-green-400 shrink-0" />
                  {h}
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input name="codigo"
              placeholder={batchMode ? "Código do próximo pacote..." : "Ou digite o código..."}
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

          {/* Último código via input */}
          {!batchMode && lastScan && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Último: <span className="text-green-400 font-mono">{lastScan}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
