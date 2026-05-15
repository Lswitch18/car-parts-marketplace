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
  const [flash, setFlash] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  function beep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 2200;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      setTimeout(() => ctx.close(), 400);
    } catch {}
  }

  function flashGreen() {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
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
        { fps: 10, qrbox: { width: 300, height: 200 } },
        (decodedText: string) => {
          beep();
          flashGreen();
          try { navigator.vibrate?.(100); } catch {}
          setLastScan(decodedText);
          setLastMatch(!expectedCode || decodedText === expectedCode);
          setHistory(h => [decodedText, ...h].slice(0, 30));
          if (!batchMode) {
            scanner.stop().catch(() => {});
            setTimeout(() => onScan(decodedText), 500);
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
            { fps: 10, qrbox: { width: 300, height: 200 } },
            (d: string) => { beep(); flashGreen(); onScan(d); },
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
      flashGreen();
      try { navigator.vibrate?.(50); } catch {}
      setLastScan(val);
      setHistory(h => [val, ...h].slice(0, 30));
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
        {/* Green flash overlay */}
        {flash && <div className="absolute inset-0 z-20 bg-green-400/30 pointer-events-none" />}

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

        {/* Start button */}
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

            {/* Scan frame - red border */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="relative w-[320px] h-[220px]">
                {/* Red border corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-xl" />

                {/* Blue laser scanning line */}
                <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-scan-line" />
              </div>
            </div>

            {/* Scanned code badge */}
            {lastScan && (
              <div className={`absolute top-16 left-4 right-4 z-10 px-4 py-3 rounded-xl shadow-lg transition-all ${
                flash ? 'scale-105' : ''
              } ${lastMatch === false ? 'bg-red-500/80' : 'bg-green-500/80'}`}>
                <div className="flex items-center gap-2">
                  {lastMatch === false
                    ? <AlertTriangle size={18} className="text-white shrink-0" />
                    : <CheckCircle size={18} className="text-white shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium">
                      {lastMatch === false ? 'Código não confere!' : 'Código lido com sucesso!'}
                    </p>
                    <p className="text-white text-base font-bold font-mono truncate">{lastScan}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hint text */}
            <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/30 pointer-events-none z-10">
              Aproxime o código de barras da moldura vermelha
            </p>
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
              <p className="text-xs text-gray-400">Ou digite o código manualmente</p>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="bg-[#1F2937] p-4">
          {batchMode && history.length > 0 && (
            <div className="mb-3 max-h-20 overflow-y-auto space-y-0.5">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">📋 Registro</p>
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                  <CheckCircle size={10} className="text-green-400 shrink-0" />
                  <span className="truncate">{h}</span>
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
          {!batchMode && lastScan && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Último: <span className="text-green-400 font-mono">{lastScan}</span>
            </p>
          )}
        </div>
      </div>

      {/* Scan line animation keyframes */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 2px); }
        }
        .animate-scan-line {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
