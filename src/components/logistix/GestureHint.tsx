import { useEffect, useState } from 'react';
import { Move, ZoomIn } from 'lucide-react';

const HINT_KEY = 'armazem3d_gesture_hint_shown';

export default function GestureHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem(HINT_KEY);
    if (!shown) {
      setVisible(true);
      localStorage.setItem(HINT_KEY, '1');
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
      <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="flex flex-col items-center gap-1">
            <Move size={24} className="text-blue-400" />
            <span className="text-[10px] text-gray-400">Arraste</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ZoomIn size={24} className="text-green-400" />
            <span className="text-[10px] text-gray-400">Pinça</span>
          </div>
        </div>
        <p className="text-sm text-gray-300">Arraste para girar · Pinça para zoom</p>
        <p className="text-[11px] text-gray-500 mt-1">Toque num rack para ver detalhes</p>
      </div>
    </div>
  );
}
