import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, ShieldCheck, User } from 'lucide-react';

interface BiometricScannerProps {
  mode: 'face' | 'document';
  onCapture: (base64Image: string) => void;
  onClose: () => void;
  title?: string;
}

export default function BiometricScanner({ mode, onCapture, onClose, title }: BiometricScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'complete'>('idle');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setScanState('idle');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode === 'face' ? 'user' : 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasCamera(true);
      }
    } catch (err: any) {
      console.error('Erro ao acessar a câmera:', err);
      setError('Câmera não localizada ou permissão negada. Por favor, forneça acesso para continuar.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    setScanState('scanning');
    
    // Simulate biometric check scanning delay
    setTimeout(() => {
      try {
        const video = videoRef.current!;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setScanState('complete');
          setTimeout(() => {
            stopCamera();
            onCapture(base64);
          }, 800);
        }
      } catch (err) {
        setError('Erro ao capturar imagem.');
        setScanState('idle');
      }
    }, 2000); // 2 seconds scan animation
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1220] flex flex-col justify-between p-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {mode === 'face' ? <User size={18} className="text-primary-light" /> : <ShieldCheck size={18} className="text-primary-light" />}
          {title || (mode === 'face' ? 'Biometria Facial' : 'Escanear Documento')}
        </h2>
        <button onClick={() => { stopCamera(); onClose(); }} className="text-text-secondary hover:text-white p-2">
          <X size={20} />
        </button>
      </div>

      {/* Main Camera Area */}
      <div className="flex-1 flex items-center justify-center my-6 relative overflow-hidden rounded-3xl bg-black/60 border border-border">
        {hasCamera && !error ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover absolute inset-0"
            />

            {/* Scanning Laser Line */}
            {scanState === 'scanning' && (
              <div className="absolute inset-x-0 h-1 bg-green-400 shadow-[0_0_12px_#4ade80] z-20 animate-scan-line" style={{
                animationDuration: '2s',
                animationIterationCount: 'infinite'
              }} />
            )}

            {/* Mode Overlays */}
            {mode === 'face' ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {/* Oval face guide */}
                <div className="w-[240px] h-[320px] rounded-[120px/160px] border-2 border-dashed border-primary shadow-[0_0_0_9999px_rgba(11,18,32,0.7)] flex flex-col items-center justify-center">
                  <div className="text-[10px] text-primary-light font-bold bg-[#0B1220]/80 px-3 py-1 rounded-full uppercase tracking-wider mt-4">
                    Posicione o Rosto
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {/* Rectangle document guide */}
                <div className="w-[300px] h-[200px] rounded-2xl border-2 border-dashed border-primary shadow-[0_0_0_9999px_rgba(11,18,32,0.7)] flex flex-col items-center justify-center">
                  <div className="text-[10px] text-primary-light font-bold bg-[#0B1220]/80 px-3 py-1 rounded-full uppercase tracking-wider">
                    Enquadre o Documento
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-center p-6 space-y-4">
            {error ? (
              <>
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={startCamera}
                  className="h-10 px-4 bg-primary text-black font-semibold rounded-xl text-xs flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Tentar Câmera Novamente
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-xs text-text-secondary">Iniciando câmera...</p>
              </div>
            )}
          </div>
        )}

        {scanState === 'scanning' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <span className="text-xs font-black text-green-400 bg-black/80 px-4 py-2 rounded-full uppercase tracking-widest animate-pulse">
              Analisando Biometria...
            </span>
          </div>
        )}

        {scanState === 'complete' && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-20">
            <span className="text-xs font-black text-white bg-green-500 px-4 py-2 rounded-full uppercase tracking-widest">
              Sucesso!
            </span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center p-2">
        {hasCamera && scanState === 'idle' && (
          <button
            onClick={capturePhoto}
            className="w-16 h-16 bg-white active:bg-slate-200 rounded-full flex items-center justify-center shadow-lg border-4 border-[#0B1220]"
          >
            <Camera size={24} className="text-black" />
          </button>
        )}
      </div>
    </div>
  );
}
