import { useEffect, useState } from 'react';
import { Move, ZoomIn, Fingerprint } from 'lucide-react';

const HINT_KEY = 'armazem3d_gesture_hint_shown';

export default function GestureHint() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem(HINT_KEY);
    if (!shown) {
      setVisible(true);
      localStorage.setItem(HINT_KEY, '1');
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setDismissed(true), 300);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-black/75 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/10 text-center shadow-2xl mx-4 max-w-xs">
        <div className="flex items-center justify-center gap-5 mb-3">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Move size={22} className="text-blue-400" />
            </div>
            <span className="text-[10px] text-blue-300/70 font-medium">Arrastar</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center">
              <ZoomIn size={22} className="text-green-400" />
            </div>
            <span className="text-[10px] text-green-300/70 font-medium">Pinça</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Fingerprint size={22} className="text-purple-400" />
            </div>
            <span className="text-[10px] text-purple-300/70 font-medium">Tocar</span>
          </div>
        </div>
        <p className="text-sm text-gray-200 font-medium">Arraste para girar o armazém</p>
        <p className="text-xs text-gray-500 mt-1">Toque num rack para ver detalhes</p>
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-[10px] text-gray-600">Toque fora para fechar</p>
        </div>
      </div>
    </div>
  );
}
