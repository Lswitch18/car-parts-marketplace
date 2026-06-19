import { useEffect, useState } from 'react';
import { MousePointer2, ZoomIn, RotateCcw } from 'lucide-react';

const HINT_KEY = 'armazem3d_gesture_hint_shown';

const GESTURES = [
  {
    icon: RotateCcw,
    color: '#0D75FF',
    label: 'Arrastar',
    hint: 'Girar',
  },
  {
    icon: ZoomIn,
    color: '#00E5FF',
    label: 'Scroll',
    hint: 'Zoom',
  },
  {
    icon: MousePointer2,
    color: '#7000FF',
    label: 'Clicar',
    hint: 'Detalhes',
  },
];

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
        setTimeout(() => setDismissed(true), 400);
      }, 5500);
      return () => clearTimeout(timer);
    } else {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      style={{
        transition: 'opacity 0.4s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="relative text-center mx-4 max-w-xs"
        style={{
          background: 'rgba(10,10,15,0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(13,117,255,0.2)',
          borderRadius: '20px',
          padding: '24px 28px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(13,117,255,0.08)',
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(13,117,255,0.6), transparent)' }}
        />

        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#0D75FF' }}>
          Controles 3D
        </p>

        <div className="flex items-start justify-center gap-5 mb-4">
          {GESTURES.map(({ icon: Icon, color, label, hint }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${color}12`,
                  border: `1px solid ${color}25`,
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: '#fff' }}>{hint}</span>
              <span className="text-[9px]" style={{ color: '#4B5563' }}>{label}</span>
            </div>
          ))}
        </div>

        <div
          className="pt-3 mt-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[11px]" style={{ color: '#6B7280' }}>
            Clique num rack para ver detalhes da zona
          </p>
        </div>
      </div>
    </div>
  );
}
