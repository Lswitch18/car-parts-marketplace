import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { supabase, getAdminStats } from '@/modules/shared/lib/supabase';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
}

// ── DAIG Cinematic Presentation Page (GSAP V2) ────────────────────────────────
// Landing page de apresentação completa: hero, vídeo de demo embutido,
// e seções de features com screenshots reais do sistema.
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🏪',
    title: 'Catálogo JDM',
    desc: 'Motor de busca em tempo real com filtros por marca, modelo, condição e preço. 16+ marcas JDM disponíveis.',
    accent: '#00E5FF',
  },
  {
    icon: '🤖',
    title: 'IA Generativa de Anúncios',
    desc: 'Foto → Anúncio completo em 3 segundos. A IA identifica a peça, gera título e descrição em PT e JA.',
    accent: '#7C3AED',
  },
  {
    icon: '💬',
    title: 'Chat em Tempo Real',
    desc: 'Negociação direta entre comprador e vendedor. Supabase Realtime. Histórico preservado.',
    accent: '#00D97E',
  },
  {
    icon: '💳',
    title: 'Stripe Connect + Escrow',
    desc: 'Pagamento em custódia JPY. Repasse automático (90%) ao vendedor após confirmação de entrega via Zengin.',
    accent: '#FF6B35',
  },
  {
    icon: '🏢',
    title: 'SaaS Multi-Tenant ERP',
    desc: 'ERP de Desmanche com WMS, Kanban, QR Code, Ordens de Serviço, estoque e publicação 1-clique.',
    accent: '#0D75FF',
  },
  {
    icon: '🇯🇵',
    title: 'Compliance JCT + Invoice',
    desc: 'Emissão de notas fiscais japonesas (Tekikaku Seikyusho), retenção JCT 10% e liquidação Zengin T+4.',
    accent: '#F59E0B',
  },
];

// ── GSAP Interactive Components ───────────────────────────────────────────────



const Interactive3DCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalização (-1 a 1)
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    gsap.to(cardRef.current, {
      rotateY: normX * 8, // Ajustado para ser sutil
      rotateX: -normY * 8,
      transformPerspective: 1200,
      duration: 0.4,
      ease: 'power2.out',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 1,
        x: x - 150,
        y: y - 150,
        duration: 0.15,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.3)',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, { opacity: 0, duration: 0.5 });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: '#0a0d0b',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), 0 0 80px rgba(0,229,255,0.08)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Spotlight Radial Glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          opacity: 0,
          zIndex: 10,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

const MagneticButton: React.FC<{ children: React.ReactNode, href: string, primary?: boolean }> = ({ children, href, primary }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.35;
      const deltaY = (e.clientY - centerY) * 0.35;

      gsap.to(el, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1.2, 0.4)',
        overwrite: 'auto',
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      style={{
        padding: '16px 40px',
        borderRadius: 14,
        background: primary ? 'linear-gradient(135deg,#00E5FF,#0D75FF)' : 'rgba(255,255,255,0.04)',
        color: primary ? '#020617' : 'rgba(255,255,255,0.75)',
        fontWeight: primary ? 800 : 600,
        fontSize: 16,
        textDecoration: 'none',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.14)',
        boxShadow: primary ? '0 0 60px rgba(0,229,255,0.4)' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        willChange: 'transform'
      }}
    >
      {children}
    </a>
  );
};

// ── Video Player ───────────────────────────────────────────────────────────────
const DemoVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false); // Video audio
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);
  
  const [uiLang, setUiLang] = useState<'pt' | 'ja'>('pt');
  
  // Efeito Stagger Reveal com GSAP SplitText
  useGSAP(() => {
    if (titleRef.current) {
      const split = new SplitText(titleRef.current, { type: 'chars, words' });
      gsap.from(split.chars, {
        duration: 0.8,
        y: 40,
        opacity: 0,
        rotationX: -90,
        stagger: 0.02,
        ease: 'back.out(1.7)',
        transformOrigin: '50% 50% -20',
      });
    }
  }, []);

  // Sync High-Quality Neural Audio with Video
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;
    
    const syncAudio = () => {
      // Keep audio time in sync with video time
      if (Math.abs(audio.currentTime - video.currentTime) > 0.2) {
        audio.currentTime = video.currentTime;
      }
      
      if (!playing && !audio.paused) {
        audio.pause();
      }
    };
    
    video.addEventListener('timeupdate', syncAudio);
    video.addEventListener('seeked', syncAudio);
    
    return () => {
      video.removeEventListener('timeupdate', syncAudio);
      video.removeEventListener('seeked', syncAudio);
    };
  }, [playing, voiceLang]);
  // Update Audio and Video source when language changes
  useEffect(() => {
    if (audioRef.current && videoRef.current) {
      const wasPlaying = !videoRef.current.paused;
      const cTime = videoRef.current.currentTime;
      
      videoRef.current.src = uiLang === 'pt' ? '/videos/daig-full-demo-v2-pt.webm' : '/videos/daig-full-demo-v2-ja.webm';
      audioRef.current.src = uiLang === 'pt' ? '/videos/demo-pt.mp3?v=3' : '/videos/demo-ja.mp3?v=3';
      
      videoRef.current.load();
      videoRef.current.currentTime = cTime;
      audioRef.current.currentTime = cTime;
      
      if (wasPlaying || playing) {
          videoRef.current.play().catch(e => console.error(e));
          audioRef.current.play().catch(e => console.error(e));
      }
    }
  }, [uiLang]);

  const toggle = () => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v) return;
    
    if (v.paused) { 
        v.play(); 
        if (a) {
            a.play().catch(e => console.error("Audio manual play exception:", e));
        }
        setPlaying(true); 
    }
    else { 
        v.pause(); 
        if (a) a.pause();
        setPlaying(false); 
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const onLoaded = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const chapters = [
    { label: 'Revolução 360°', pct: 0 },
    { label: 'Cadastro & Google', pct: 8.1 },
    { label: 'Plataforma Unificada', pct: 19.5 },
    { label: 'Catálogo JDM', pct: 27.4 },
    { label: 'Especificações 3D', pct: 40.9 },
    { label: 'IA para Vendedores', pct: 52.8 },
    { label: 'Chat com Tradução', pct: 71.4 },
    { label: 'Pagamento Escrow', pct: 87.5 },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Cabeçalho do Player com Toggle UI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 ref={titleRef} style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', perspective: 1000 }}>
            Live Platform <span style={{ color: '#00E5FF', textShadow: '0 0 15px rgba(0,229,255,0.5)' }}>Demo</span>
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Versão {uiLang === 'pt' ? 'Português' : 'Japonês'} (V2) • Audio Neural Sync</p>
        </div>
        
        {/* Toggle de Idioma Minimalista (Estilo Apple) */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => setUiLang('pt')}
            style={{ padding: '8px 24px', borderRadius: 16, border: 'none', background: uiLang === 'pt' ? 'rgba(0,229,255,0.15)' : 'transparent', color: uiLang === 'pt' ? '#00E5FF' : 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
            PT
          </button>
          <button 
            onClick={() => setUiLang('ja')}
            style={{ padding: '8px 24px', borderRadius: 16, border: 'none', background: uiLang === 'ja' ? 'rgba(0,229,255,0.15)' : 'transparent', color: uiLang === 'ja' ? '#00E5FF' : 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
            JA
          </button>
        </div>
      </div>

      <Interactive3DCard>
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* ÁUDIO FIX INSERIDO NO DOM */}
          <audio ref={audioRef} preload="auto" style={{ display: 'none' }} />

          {/* Browser chrome bar */}
          <div style={{ background: '#111', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['#FF5F56', '#FFBD2E', '#27C93F'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <div style={{ flex: 1, margin: '0 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>🔒</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>daig.jp</span>
            </div>
            <div style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)', fontSize: 10, color: '#00E5FF', fontWeight: 700, letterSpacing: '0.1em' }}>
              DEMO AO VIVO
            </div>
          </div>

          {/* Video */}
          <div style={{ position: 'relative', aspectRatio: '16/9', cursor: 'pointer' }} onClick={toggle}>
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoaded}
              onEnded={() => setPlaying(false)}
              playsInline
              preload="metadata"
              poster="/screenshots/home.jpg"
              muted={muted}
            >
              <source src="/videos/daig-full-demo-v2-pt.webm" type="video/webm" />
              <source src="/videos/daig-full-demo-v2-pt.mp4" type="video/mp4" />
              <track kind="subtitles" srcLang="pt" src="/videos/demo-pt.vtt?v=3" label="Português" default={uiLang === 'pt'} />
              <track kind="subtitles" srcLang="ja" src="/videos/demo-ja.vtt?v=3" label="日本語" default={uiLang === 'ja'} />
            </video>

          {/* Play overlay */}
          {!playing && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(2,6,23,0.6)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(2px)',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(0,229,255,0.15)',
                border: '2px solid rgba(0,229,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(0,229,255,0.4)',
                transition: 'transform 0.2s',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 3l14 9-14 9V3z" fill="white" />
                </svg>
              </div>
              <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
                Assistir Demo Completa · {fmt(duration)}
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
            padding: '40px 16px 12px',
            opacity: hovered || !playing ? 1 : 0,
            transition: 'opacity 0.3s',
            pointerEvents: hovered || !playing ? 'all' : 'none',
          }}>
            {/* Progress bar */}
            <div
              style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, cursor: 'pointer', marginBottom: 10, position: 'relative' }}
              onClick={e => { e.stopPropagation(); seek(e); }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress}%`, background: '#00E5FF', borderRadius: 2 }} />
              {chapters.map(ch => (
                <div key={ch.label} title={ch.label} style={{
                  position: 'absolute', top: -2, left: `${ch.pct}%`,
                  width: 3, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 1,
                }} />
              ))}
            </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={e => { e.stopPropagation(); toggle(); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  {playing ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
                  )}
                </button>
                <button onClick={e => { e.stopPropagation(); setMuted(m => { if (videoRef.current) videoRef.current.muted = !m; return !m; }); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  {muted
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="white" strokeWidth="2"/><line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="white" strokeWidth="2"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                  }
                </button>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginLeft: 'auto' }}>
                {fmt((progress / 100) * duration)} / {fmt(duration)}
              </span>
            </div>

              {/* Chapter labels */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {chapters.map((ch, i) => (
                  <button
                    key={ch.label}
                    onClick={e => { e.stopPropagation(); if (videoRef.current) { videoRef.current.currentTime = (ch.pct / 100) * videoRef.current.duration; if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true); } } }}
                    style={{
                      padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 600,
                      background: progress >= ch.pct && progress < (chapters[i + 1]?.pct ?? 101) ? 'rgba(0,229,255,0.25)' : 'rgba(255,255,255,0.08)',
                      border: progress >= ch.pct && progress < (chapters[i + 1]?.pct ?? 101) ? '1px solid rgba(0,229,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: progress >= ch.pct && progress < (chapters[i + 1]?.pct ?? 101) ? '#00E5FF' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                    }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Interactive3DCard>
    </div>
  );
};

// ── Feature Card ──────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{ feature: typeof FEATURES[0]; className?: string }> = ({ feature, className }) => (
  <div className={className} style={{
    padding: '28px 24px',
    background: 'rgba(255,255,255,0.025)',
    border: `1px solid ${feature.accent}18`,
    borderRadius: 18,
    willChange: 'transform, opacity'
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: `${feature.accent}12`,
      border: `1px solid ${feature.accent}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, marginBottom: 16,
    }}>
      {feature.icon}
    </div>
    <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 8, lineHeight: 1.3 }}>
      {feature.title}
    </h3>
    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.65 }}>
      {feature.desc}
    </p>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PresentationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  const [stats, setStats] = useState([
    { value: '...', label: 'Valor Negociado' },
    { value: '...', label: 'Lojas & Clientes' },
    { value: '...', label: 'Peças Disponíveis' },
    { value: '...', label: 'Vendas Concluídas' },
  ]);

  useEffect(() => {
    async function loadStats() {
      try {
        const adminStats = await getAdminStats();
        const { count: partsCount } = await supabase.from('parts').select('id', { count: 'exact', head: true });
        
        setStats([
          { value: `¥${(adminStats.totalGMV).toLocaleString()}`, label: 'Valor Negociado' },
          { value: `${adminStats.totalUsers}`, label: 'Lojas & Clientes' },
          { value: `${partsCount || 0}`, label: 'Peças Disponíveis' },
          { value: `${adminStats.totalTransactions}`, label: 'Vendas Concluídas' },
        ]);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    }
    loadStats();
  }, []);
  
  // GSAP Animations
  useGSAP(() => {
    // 1. Hero Title SplitText Animation
    if (heroTitleRef.current) {
        const split = new SplitText(heroTitleRef.current, { type: 'words,chars' });
        gsap.from(split.chars, {
            duration: 0.8,
            y: 40,
            opacity: 0,
            scale: 0.9,
            stagger: 0.02,
            ease: 'back.out(1.4)',
            delay: 0.1
        });
    }

    // 2. Stats Bar Stagger
    gsap.from('.stat-box', {
      scrollTrigger: {
        trigger: '.stats-container',
        start: 'top 85%',
      },
      y: 30,
      opacity: 0,
      stagger: 0.08,
      ease: 'power3.out',
      duration: 0.8
    });

    // 3. Demo Video Reveal
    gsap.from('.video-section', {
      scrollTrigger: {
        trigger: '.video-section',
        start: 'top 80%',
      },
      y: 60,
      opacity: 0,
      ease: 'expo.out',
      duration: 1.2
    });

    // 4. Features Grid Stagger Parallax
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 75%',
      },
      y: 50,
      opacity: 0,
      stagger: 0.1,
      ease: 'back.out(1.2)',
      duration: 0.8
    });

    // 5. Final CTA
    gsap.from('.cta-section > div', {
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      ease: 'power3.out',
      duration: 1
    });
    
  }, { scope: containerRef });

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes gridScroll { 0%{background-position:0 0} 100%{background-position:60px 60px} }
        @keyframes glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
      `}</style>

      <div ref={containerRef} style={{ background: '#020617', color: 'white', fontFamily: '"Inter",system-ui,sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
          
          {/* Animated background */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px', animation: 'gridScroll 8s linear infinite', maskImage: 'radial-gradient(ellipse at 50% 50%,black 0%,transparent 70%)' }} />
            <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '60vw', maxWidth: 1000, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,229,255,0.05) 0%,transparent 65%)', animation: 'glow 5s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)', animation: 'glow 7s ease-in-out infinite reverse' }} />
          </div>

          {/* Logo badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 100, background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.2)', marginBottom: 28 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 10px #00E5FF', animation: 'glow 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Digital A.I. Garage · DAIG.jp</span>
          </div>

          {/* Title with SplitText and Logo */}
          <h1 ref={heroTitleRef} style={{ fontSize: 'clamp(40px,7vw,84px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -2, marginBottom: 24, maxWidth: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.25em' }}>
            <span>Sua garagem digital está aqui</span>
            <img src="/logo.png" alt="DAIG" style={{ height: '0.9em', filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.4))' }} />
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(15px,1.8vw,20px)', color: 'rgba(255,255,255,0.5)', maxWidth: 620, lineHeight: 1.65, marginBottom: 44 }}>
            Conectamos desmanches, oficinas e importadoras do Japão diretamente a compradores — com gestão por IA, pagamentos em JPY via Stripe Connect e repasses automáticos.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', zIndex: 10 }}>
            <MagneticButton href="#demo-video" primary>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#020617"><path d="M5 3l14 9-14 9V3z"/></svg>
              Ver Demo Completa
            </MagneticButton>
            <MagneticButton href="/register">
              Criar Conta Grátis →
            </MagneticButton>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 28, left: '50%', animation: 'scrollBounce 2.5s ease-in-out infinite', opacity: 0.5 }}>
            <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
              <rect x="1" y="1" width="18" height="28" rx="9" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5"/>
              <rect x="8.5" y="5" width="3" height="7" rx="1.5" fill="rgba(0,229,255,0.7)"/>
            </svg>
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────── */}
        <div className="stats-container" style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="stat-box"
                style={{
                  padding: '20px 16px',
                  background: 'rgba(255,255,255,0.025)',
                  textAlign: 'center',
                  borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: '#00E5FF', letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DEMO VIDEO ───────────────────────────────────────────── */}
        <section id="demo-video" className="video-section" style={{ maxWidth: 1100, margin: '0 auto 120px', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF', animation: 'glow 2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Demo da Plataforma</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: 'white', letterSpacing: -1.5, lineHeight: 1.15, marginBottom: 12 }}>
              Veja tudo funcionando
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
              Dashboard → Catálogo → Produto → Upload com IA → Chat → Checkout Stripe
            </p>
          </div>
          
          <DemoVideoPlayer />

        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────── */}
        <section className="features-grid" style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'white', letterSpacing: -1.5 }}>
              Tudo que você precisa, integrado
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 12 }}>
              Um ecossistema completo, do desmanche ao depósito bancário
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} feature={f} className="feature-card" />
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section className="cta-section" style={{ textAlign: 'center', padding: '80px 24px 120px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%,rgba(0,229,255,0.05) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>DAIG · daig.jp · 2026</div>
            <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, marginBottom: 20 }}>
              Pronto para<br />escalar no Japão?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, maxWidth: 420, margin: '0 auto 40px' }}>
              Crie sua conta, publique sua primeira peça em minutos e comece a receber em JPY.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', zIndex: 10, position: 'relative' }}>
              <MagneticButton href="/register" primary>
                Criar Conta Grátis
              </MagneticButton>
              <MagneticButton href="/catalog">
                Explorar Catálogo
              </MagneticButton>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
