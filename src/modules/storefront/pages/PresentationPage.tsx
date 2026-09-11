import React, { useEffect, useRef, useState } from 'react';

// ── DAIG Cinematic Presentation Page ──────────────────────────────────────────
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
    desc: 'Foto → Anúncio completo em 3 segundos. A IA identifica a peça, gera título e descrição em PT e JA automaticamente.',
    accent: '#7C3AED',
  },
  {
    icon: '💬',
    title: 'Chat em Tempo Real',
    desc: 'Negociação direta entre comprador e vendedor. Supabase Realtime. Histórico preservado e integrado ao anúncio.',
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
    desc: 'ERP de Desmanche com WMS, Kanban, QR Code, Ordens de Serviço, estoque e publicação 1-clique no marketplace.',
    accent: '#0D75FF',
  },
  {
    icon: '🇯🇵',
    title: 'Compliance JCT + Invoice',
    desc: 'Emissão de notas fiscais japonesas (Tekikaku Seikyusho), retenção JCT 10% e liquidação Zengin T+4.',
    accent: '#F59E0B',
  },
];

const STATS = [
  { value: '¥2.4B', label: 'Volume processado' },
  { value: '12K+', label: 'Peças catalogadas' },
  { value: '200+', label: 'Marcas JDM' },
  { value: 'T+4', label: 'Liquidação Stripe' },
  { value: '10%', label: 'Comissão DAIG' },
  { value: '3s', label: 'Foto → Anúncio IA' },
];

// ── IntersectionObserver hook ─────────────────────────────────────────────────
function useVisible(ref: React.RefObject<Element>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setV(true); },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return v;
}

// ── Video Player ───────────────────────────────────────────────────────────────
const DemoVideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false); // Video audio
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);
  
  // TTS Voiceover state
  const [voiceLang, setVoiceLang] = useState<'pt-BR' | 'ja-JP' | 'off'>('pt-BR');
  
  // Web Speech API Narrator
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleCueChange = (e: Event) => {
      if (voiceLang === 'off') return;
      
      const track = e.target as TextTrack;
      if (!track.activeCues || track.activeCues.length === 0) return;
      
      // Get the current subtitle text
      const cue = track.activeCues[0] as VTTCue;
      const text = cue.text;
      
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      // Speak the new subtitle
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang;
      utterance.rate = 1.05; // slightly faster to fit the video timing
      
      // Try to find a good native voice
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes(voiceLang.split('-')[0]));
      if (voice) utterance.voice = voice;
      
      window.speechSynthesis.speak(utterance);
    };

    // Attach listener to all text tracks
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].addEventListener('cuechange', handleCueChange);
    }
    
    return () => {
      window.speechSynthesis.cancel();
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].removeEventListener('cuechange', handleCueChange);
      }
    };
  }, [voiceLang]);
  
  // Stop TTS when video is paused
  useEffect(() => {
    if (!playing) window.speechSynthesis.cancel();
  }, [playing]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
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
    { label: 'Cadastro', pct: 0 },
    { label: 'Dashboard', pct: 15 },
    { label: 'Catálogo', pct: 26 },
    { label: 'Produto', pct: 40 },
    { label: 'Upload IA', pct: 55 },
    { label: 'Chat', pct: 70 },
    { label: 'Stripe T+4', pct: 85 },
  ];

  return (
    <div
      style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#000', boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), 0 0 80px rgba(0,229,255,0.08)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
          <source src="/videos/daig-full-demo.webm" type="video/webm" />
          <source src="/videos/daig-full-demo.mp4" type="video/mp4" />
          <track kind="subtitles" srcLang="pt" src="/videos/demo-pt.vtt" label="Português" default={voiceLang === 'pt-BR'} />
          <track kind="subtitles" srcLang="ja" src="/videos/demo-ja.vtt" label="日本語" default={voiceLang === 'ja-JP'} />
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

        {/* Controls overlay (shows on hover or pause) */}
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
            {/* Chapter markers */}
            {chapters.map(ch => (
              <div key={ch.label} title={ch.label} style={{
                position: 'absolute', top: -2, left: `${ch.pct}%`,
                width: 3, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 1,
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Locutor IA Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '2px 4px', fontSize: 10, fontWeight: 600 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', padding: '0 6px' }}>Narrador IA:</div>
              <button onClick={(e) => { e.stopPropagation(); setVoiceLang('pt-BR'); }} style={{ background: voiceLang === 'pt-BR' ? '#00E5FF' : 'transparent', color: voiceLang === 'pt-BR' ? '#000' : 'white', border: 'none', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>PT</button>
              <button onClick={(e) => { e.stopPropagation(); setVoiceLang('ja-JP'); }} style={{ background: voiceLang === 'ja-JP' ? '#00E5FF' : 'transparent', color: voiceLang === 'ja-JP' ? '#000' : 'white', border: 'none', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>JP</button>
              <button onClick={(e) => { e.stopPropagation(); setVoiceLang('off'); window.speechSynthesis.cancel(); }} style={{ background: voiceLang === 'off' ? 'rgba(255,255,255,0.2)' : 'transparent', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>Off</button>
            </div>
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
  );
};

// ── Feature Card ──────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{ feature: typeof FEATURES[0]; index: number; visible: boolean }> = ({ feature, index, visible }) => (
  <div style={{
    padding: '28px 24px',
    background: 'rgba(255,255,255,0.025)',
    border: `1px solid ${feature.accent}18`,
    borderRadius: 18,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.08}s`,
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

// ── Stat Bar ──────────────────────────────────────────────────────────────────
const StatBar: React.FC<{ stats: typeof STATS; visible: boolean }> = ({ stats, visible }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
    {stats.map((s, i) => (
      <div
        key={s.label}
        style={{
          padding: '20px 16px',
          background: 'rgba(255,255,255,0.025)',
          textAlign: 'center',
          borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: `all 0.5s ease ${i * 0.07}s`,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: '#00E5FF', letterSpacing: -0.5 }}>{s.value}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
      </div>
    ))}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PresentationPage() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null!);
  const videoRef = useRef<HTMLDivElement>(null!);
  const featuresRef = useRef<HTMLDivElement>(null!);
  const ctaRef = useRef<HTMLDivElement>(null!);

  const statsVisible = useVisible(statsRef);
  const videoVisible = useVisible(videoRef);
  const featuresVisible = useVisible(featuresRef);
  const ctaVisible = useVisible(ctaRef);

  useEffect(() => { setTimeout(() => setHeroLoaded(true), 80); }, []);

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes gridScroll { 0%{background-position:0 0} 100%{background-position:60px 60px} }
        @keyframes glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
      `}</style>

      <div style={{ background: '#020617', color: 'white', fontFamily: '"Inter",system-ui,sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
          
          {/* Animated background */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,229,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px', animation: 'gridScroll 8s linear infinite', maskImage: 'radial-gradient(ellipse at 50% 50%,black 0%,transparent 70%)' }} />
            <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '60vw', maxWidth: 1000, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,229,255,0.05) 0%,transparent 65%)', animation: 'glow 5s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)', animation: 'glow 7s ease-in-out infinite reverse' }} />
          </div>

          {/* Logo badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 100, background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.2)', marginBottom: 28, opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(-12px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 10px #00E5FF', animation: 'glow 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Digital A.I. Garage · DAIG.jp</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(56px,9vw,108px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: -4, marginBottom: 24, opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s' }}>
            O Marketplace
            <span style={{ display: 'block', background: 'linear-gradient(135deg,#00E5FF 0%,#0D75FF 45%,#7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              JDM do Japão
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(15px,1.8vw,20px)', color: 'rgba(255,255,255,0.5)', maxWidth: 580, lineHeight: 1.65, marginBottom: 44, opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.9s ease 0.2s' }}>
            Conectamos desmanches, oficinas e importadoras do Japão diretamente a compradores — com gestão por IA, pagamentos em JPY via Stripe Connect e repasses automáticos.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', opacity: heroLoaded ? 1 : 0, transition: 'opacity 1s ease 0.35s' }}>
            <a href="#demo-video" style={{ padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#00E5FF,#0D75FF)', color: '#020617', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 0 40px rgba(0,229,255,0.35)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#020617"><path d="M5 3l14 9-14 9V3z"/></svg>
              Ver Demo Completa
            </a>
            <a href="/register" style={{ padding: '14px 32px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: 15, textDecoration: 'none', background: 'rgba(255,255,255,0.04)' }}>
              Criar Conta Grátis →
            </a>
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
        <div ref={statsRef} style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '0 24px' }}>
          <StatBar stats={STATS} visible={statsVisible} />
        </div>

        {/* ── DEMO VIDEO ───────────────────────────────────────────── */}
        <section id="demo-video" ref={videoRef} style={{ maxWidth: 1100, margin: '0 auto 120px', padding: '0 24px', opacity: videoVisible ? 1 : 0, transform: videoVisible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}>
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
        <section ref={featuresRef} style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'white', letterSpacing: -1.5, opacity: featuresVisible ? 1 : 0, transform: featuresVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
              Tudo que você precisa, integrado
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 12, opacity: featuresVisible ? 1 : 0, transition: 'all 0.7s ease 0.1s' }}>
              Um ecossistema completo, do desmanche ao depósito bancário
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} visible={featuresVisible} />
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section ref={ctaRef} style={{ textAlign: 'center', padding: '80px 24px 120px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%,rgba(0,229,255,0.05) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ opacity: ctaVisible ? 1 : 0, transform: ctaVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>DAIG · daig.jp · 2026</div>
            <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, marginBottom: 20 }}>
              Pronto para<br />escalar no Japão?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, maxWidth: 420, margin: '0 auto 40px' }}>
              Crie sua conta, publique sua primeira peça em minutos e comece a receber em JPY.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register" style={{ padding: '16px 40px', borderRadius: 14, background: 'linear-gradient(135deg,#00E5FF,#0D75FF)', color: '#020617', fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 0 60px rgba(0,229,255,0.4)' }}>
                Criar Conta Grátis
              </a>
              <a href="/catalog" style={{ padding: '16px 40px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 16, textDecoration: 'none', background: 'rgba(255,255,255,0.04)' }}>
                Explorar Catálogo
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
