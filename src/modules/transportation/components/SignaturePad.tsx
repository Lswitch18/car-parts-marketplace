import { useRef, useState, useEffect } from 'react';
import { Trash2, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (base64Image: string) => void;
  onCancel: () => void;
  title?: string;
  packageCount?: number;
}

export default function SignaturePad({ onSave, onCancel, title, packageCount }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Configure canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.strokeStyle = '#60a5fa'; // Blue-400 stroke
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling when signing on mobile touch
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
      }
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      // Get base64 string
      const base64 = canvas.toDataURL('image/png');
      onSave(base64);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1220]/95 flex flex-col justify-end p-4">
      <div className="bg-[#111827] rounded-3xl border border-white/5 p-5 w-full max-w-md mx-auto space-y-4 shadow-2xl">
        
        {/* Title & Info */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <PenTool size={18} className="text-blue-400" />
            {title || 'Assinatura do Recebedor'}
          </h3>
          {packageCount !== undefined && (
            <p className="text-xs text-blue-400 font-bold bg-blue-500/10 py-1 px-3 rounded-full inline-block">
              Volume: {packageCount} pacote{packageCount !== 1 ? 's' : ''}
            </p>
          )}
          <p className="text-xs text-gray-400">Desenhe sua assinatura na área abaixo:</p>
        </div>

        {/* Canvas drawing area */}
        <div className="relative border border-white/10 rounded-2xl bg-[#0B1220] h-48 overflow-hidden touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair block"
          />
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <span className="text-sm font-semibold tracking-wider uppercase">Assine Aqui</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={clear}
            disabled={isEmpty}
            className="flex-1 h-12 bg-white/5 hover:bg-white/10 active:bg-white/15 disabled:opacity-30 text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 size={16} /> Limpar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 h-12 bg-[#1F2937] hover:bg-[#374151] text-gray-400 rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
          >
            Cancelar
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isEmpty}
          className="w-full h-14 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-black font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
        >
          <Check size={20} /> CONFIRMAR ASSINATURA & COLETAR
        </button>

      </div>
    </div>
  );
}
