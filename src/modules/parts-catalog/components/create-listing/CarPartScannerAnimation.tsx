import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';

export function TurboIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
      <path d="M12 8v8M8 12h8" />
      <path d="M16 4.5l-4 3.5M4.5 8l3.5 4M8 19.5l4-3.5M19.5 16l-3.5-4" />
    </svg>
  );
}

export function EngineIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 10h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" />
      <path d="M7 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      <path d="M12 4v6" />
      <path d="M3 14h18" />
      <path d="M6 18v2" />
      <path d="M18 18v2" />
      <path d="M9 10v8" />
      <path d="M15 10v8" />
    </svg>
  );
}

interface Props {
  progress: number;
  message: string;
}

export function CarPartScannerAnimation({ progress, message }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Anima o laser de escaneamento subindo e descendo
      gsap.to('.scanner-laser', {
        y: 100,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      // Rotação leve na peça
      gsap.to('.scanned-part', {
        rotateY: 15,
        rotateX: 10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      
      // Pulsação no background
      gsap.to('.grid-bg', {
        opacity: 0.8,
        scale: 1.05,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full relative overflow-hidden bg-[#06080F] border border-[#00E5FF]/40 rounded-xl p-6 flex items-center justify-between"
      ref={containerRef}
      style={{ perspective: '1000px' }}
    >
      {/* Grid de fundo hi-tech */}
      <div 
        className="grid-bg absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Container de Escaneamento 3D */}
      <div className="relative z-10 w-32 h-32 flex items-center justify-center transform-style-3d">
        <div className="absolute inset-0 bg-[#00E5FF]/5 rounded-full blur-xl" />
        <div className="scanned-part text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.8)] relative z-10">
          {progress > 50 ? <TurboIcon className="w-20 h-20" /> : <EngineIcon className="w-20 h-20" />}
        </div>
        
        {/* Laser animado */}
        <div className="scanner-laser absolute top-0 left-0 w-full h-[2px] bg-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,1)] z-20">
          <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#00E5FF]/40 to-transparent pointer-events-none" />
        </div>
        
        {/* Caixa de mira (crosshairs) */}
        <div className="absolute inset-0 border border-[#0D75FF]/30 rounded-lg">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00E5FF] -translate-x-1 -translate-y-1" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00E5FF] translate-x-1 -translate-y-1" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00E5FF] -translate-x-1 translate-y-1" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00E5FF] translate-x-1 translate-y-1" />
        </div>
      </div>

      {/* Progresso e Mensagem */}
      <div className="flex-1 ml-8 relative z-10">
        <div className="flex justify-between items-end mb-3">
          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#0D75FF] tracking-wide">
            {message}
          </div>
          <div className="text-3xl font-black text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)] font-mono">
            {Math.round(progress)}%
          </div>
        </div>
        
        <div className="h-2.5 w-full bg-[#06080F] border border-[#0D75FF]/30 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(0,229,255,1)]"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        
        <div className="mt-3 flex gap-2">
          {['Visual Computing', 'Model Matching', 'Pricing Matrix'].map((tag, i) => (
            <span key={tag} className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 border rounded bg-[#0D75FF]/10 transition-colors ${progress > i * 33 ? 'border-[#00E5FF]/50 text-[#00E5FF]' : 'border-[#0D75FF]/20 text-[#0D75FF]/50'}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
