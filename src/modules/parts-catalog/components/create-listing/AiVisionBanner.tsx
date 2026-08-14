import { useEffect, useRef } from 'react';
import { useI18n } from '@/modules/shared/lib/i18n';
import gsap from 'gsap';
import { Sparkles } from 'lucide-react';

interface AiVisionBannerProps {
  onAnalyze: () => void;
  analyzing: boolean;
  progress: number;
}

export function AiVisionBanner({ onAnalyze, analyzing, progress }: AiVisionBannerProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textContainerRef.current) return;

    const ctx = gsap.context(() => {
      // Entrada inicial da seção com fade/zoom
      gsap.from(containerRef.current, {
        opacity: 0,
        y: -30,
        duration: 1,
        ease: 'power3.out',
      });

      // Efeito de texto revelado (Split-text simulation simple)
      const textElements = textContainerRef.current?.children;
      if (textElements) {
        gsap.from(textElements, {
          y: 20,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          delay: 0.2,
          ease: 'power2.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Scanner animation when analyzing
  useEffect(() => {
    if (!scanLineRef.current) return;
    
    let ctx: gsap.Context | null = null;

    if (analyzing) {
      ctx = gsap.context(() => {
        gsap.to(scanLineRef.current, {
          y: '100%',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }

    return () => ctx?.revert();
  }, [analyzing]);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-primary/30 bg-surface shadow-[0_0_40px_rgba(13,117,255,0.1)] mb-8 transition-all"
    >
      {/* Imagem de Fundo (Visão Computacional) */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url('/ai_vision_banner_1786716243259.jpg')` }}
      />

      {/* Linha de Scanner Dinâmica */}
      {analyzing && (
        <div 
          ref={scanLineRef}
          className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#00E5FF] z-10 pointer-events-none"
        />
      )}

      <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
        <div ref={textContainerRef} className="flex-1">
          <div className="inline-flex items-center space-x-2 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('Visão Computacional Ativa')}</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
            {t('Deixe a IA preencher tudo para você!')}
          </h2>
          
          <p className="text-text-secondary text-sm sm:text-base max-w-xl">
            {t('Não perca tempo digitando. Tire uma foto ou envie a imagem da peça, e a nossa Visão Computacional reconhecerá a marca, modelo e código OEM instantaneamente.')}
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={analyzing}
            className="w-full relative group overflow-hidden bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(13,117,255,0.4)] hover:shadow-[0_0_30px_rgba(13,117,255,0.6)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-center space-x-2">
              {analyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('Analisando Peça...')} {progress > 0 && `${progress}%`}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{t('Escanear Peça Agora')}</span>
                </>
              )}
            </div>
          </button>
          
          {analyzing && progress > 0 && (
            <div className="w-full mt-3 bg-surface-hover rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-cyan-400 h-full shadow-[0_0_10px_#00E5FF] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
