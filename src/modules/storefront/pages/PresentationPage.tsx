import React, { useEffect, useRef, useState, useCallback } from 'react';

// ── Cinematic Presentation Page ───────────────────────────────────────────────
// 100% React-driven, no external video dependencies.
// Scroll-pinned, full-screen "scenes" with animated mockups of the real DAIG UI.
// ─────────────────────────────────────────────────────────────────────────────

const SCENES = [
  {
    id: 'intro',
    tag: 'DAIG · Digital A.I. Garage',
    headline: 'O Marketplace\nJDM do Japão.',
    sub: 'Conectamos desmanches, oficinas e importadoras diretamente a compradores em todo o mundo — com repasses automáticos via Stripe e gestão por IA.',
    accent: '#00E5FF',
    screen: '/screenshots/home.jpg',
    badge: 'Ecossistema JDM · Japão B2B & B2C',
    stats: [
      { value: '¥ 2.4B', label: 'Volume processado' },
      { value: '12K+', label: 'Peças no catálogo' },
      { value: 'T+4', label: 'Liquidação Stripe' },
    ],
  },
  {
    id: 'catalog',
    tag: 'Catálogo Inteligente',
    headline: 'Encontre a peça\ncerta em segundos.',
    sub: 'Motor de busca com filtro por marca, modelo, condição e faixa de preço. Resultados em tempo real direto do estoque dos desmanches parceiros.',
    accent: '#0D75FF',
    screen: '/screenshots/catalog.jpg',
    badge: 'Catálogo JDM · Busca por IA',
    stats: [
      { value: '200+', label: 'Marcas cadastradas' },
      { value: 'Tempo real', label: 'Atualização de estoque' },
      { value: '1-clique', label: 'Publicar via ERP' },
    ],
  },
  {
    id: 'ai',
    tag: 'IA Generativa',
    headline: 'Foto → Anúncio\nem 3 segundos.',
    sub: 'O vendedor fotografa a peça. Nossa IA identifica modelo, condição, gera título e descrição em japonês e português, e publica diretamente no catálogo.',
    accent: '#7C3AED',
    screen: null,
    badge: 'Motor de IA · GPT-4o Vision',
    stats: [
      { value: '3s', label: 'Da foto ao anúncio' },
      { value: 'PT + JA', label: 'Bilíngue automático' },
      { value: '98%', label: 'Acurácia de identificação' },
    ],
  },
  {
    id: 'chat',
    tag: 'Chat & Negociação',
    headline: 'Vendedor e\ncomprador conectados.',
    sub: 'Chat em tempo real integrado ao anúncio. O comprador tira dúvidas, negocia e finaliza a compra sem sair da plataforma.',
    accent: '#00D97E',
    screen: '/screenshots/messages.jpg',
    badge: 'Mensagens · Real-time',
    stats: [
      { value: 'Real-time', label: 'Supabase Realtime' },
      { value: '100%', label: 'In-app checkout' },
      { value: 'Escrow', label: 'Pagamento protegido' },
    ],
  },
  {
    id: 'checkout',
    tag: 'Pagamento & Repasse',
    headline: 'Stripe Connect\n+ Escrow JPY.',
    sub: 'O pagamento fica em custódia até a confirmação de entrega. Depois, o repasse é automático em ienes (JPY) para a conta bancária do vendedor via Zengin.',
    accent: '#FF6B35',
    screen: null,
    badge: 'Stripe Connect · Zengin JPY',
    stats: [
      { value: '10%', label: 'Comissão DAIG' },
      { value: '90%', label: 'Repasse ao vendedor' },
      { value: 'JCT 10%', label: 'Imposto Japonês' },
    ],
  },
];

// ── Utilities ──────────────────────────────────────────────────────────────────

function useIntersection(ref: React.RefObject<Element>, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function useCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const MacbookMockup: React.FC<{ src: string | null; accent: string; visible: boolean }> = ({ src, accent, visible }) => (
  <div style={{
    width: '100%', maxWidth: 680,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
    transition: 'all 0.85s cubic-bezier(0.16,1,0.3,1)',
    transitionDelay: '0.15s',
    filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.7))',
    position: 'relative',
  }}>
    {/* Laptop frame */}
    <div style={{ position: 'relative', paddingBottom: '4%' }}>
      {/* Screen */}
      <div style={{
        background: '#111',
        borderRadius: '16px 16px 0 0',
        border: '2px solid rgba(255,255,255,0.12)',
        borderBottom: 'none',
        overflow: 'hidden',
        aspectRatio: '16/10',
        boxShadow: `0 0 0 1px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3), 0 0 60px ${accent}22`,
        position: 'relative',
      }}>
        {/* Browser chrome */}
        <div style={{ background: '#1a1a1f', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {['#FF5F56','#FFBD2E','#27C93F'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
          <div style={{ flex: 1, margin: '0 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 18, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>daig.jp</span>
          </div>
        </div>
        {/* Content */}
        {src ? (
          <img src={src} alt="DAIG screen" style={{ width: '100%', height: 'calc(100% - 34px)', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        ) : (
          <AiScreenPlaceholder accent={accent} />
        )}
        {/* Glow overlay */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${accent}08 0%, transparent 60%)`, pointerEvents: 'none' }} />
      </div>
      {/* Base / hinge */}
      <div style={{ background: 'linear-gradient(180deg, #2a2a30 0%, #1a1a1f 100%)', height: 12, borderRadius: '0 0 4px 4px', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none' }} />
      <div style={{ background: 'linear-gradient(180deg, #1a1a1f 0%, #111 100%)', height: 28, borderRadius: '0 0 14px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none' }} />
    </div>
    {/* Reflection */}
    <div style={{ position: 'absolute', bottom: -40, left: '10%', right: '10%', height: 40, background: `linear-gradient(180deg, ${accent}15 0%, transparent 100%)`, filter: 'blur(12px)', borderRadius: '50%' }} />
  </div>
);

const AiScreenPlaceholder: React.FC<{ accent: string }> = ({ accent }) => (
  <div style={{ width: '100%', height: 'calc(100% - 34px)', background: 'linear-gradient(135deg, #050515 0%, #0a0a20 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32 }}>
    <div style={{ width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}22, transparent)`, border: `2px solid ${accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>DAIG Vision AI</div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Identificando peça via foto…</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 320 }}>
      {['Motor SR20DET', 'Turbina GReddy', '¥ 280.000', 'Condição: Boa'].map((t, i) => (
        <div key={i} style={{ background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: 8, padding: '8px 12px', fontSize: 11, color: i < 2 ? 'rgba(255,255,255,0.8)' : accent }}>
          {t}
        </div>
      ))}
    </div>
  </div>
);

const StatCard: React.FC<{ value: string; label: string; accent: string; active: boolean; index: number }> = ({ value, label, accent, active, index }) => {
  const isNumeric = /^\d/.test(value.replace(/[¥+%,]/g, ''));
  const numericPart = isNumeric ? parseInt(value.replace(/[^\d]/g, '')) : 0;
  const prefix = value.replace(/\d.*/, '');
  const suffix = value.replace(/^[¥\d.,]+/, '');
  const count = useCounter(numericPart, active && isNumeric);

  return (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${accent}20`,
      borderRadius: 14,
      opacity: active ? 1 : 0,
      transform: active ? 'translateY(0)' : 'translateY(20px)',
      transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.3 + index * 0.1}s`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent, fontFamily: 'system-ui', letterSpacing: -0.5, lineHeight: 1 }}>
        {isNumeric ? `${prefix}${count.toLocaleString()}${suffix}` : value}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
};

// ── Scene ─────────────────────────────────────────────────────────────────────

const Scene: React.FC<{ scene: typeof SCENES[0]; index: number }> = ({ scene, index }) => {
  const ref = useRef<HTMLDivElement>(null!);
  const visible = useIntersection(ref, 0.4);
  const isEven = index % 2 === 0;

  return (
    <section ref={ref} style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '80px clamp(24px, 6vw, 80px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        [isEven ? 'right' : 'left']: '-10%',
        top: '20%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${scene.accent}08 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isEven ? '1fr 1fr' : '1fr 1fr',
        gap: 'clamp(40px, 6vw, 80px)',
        alignItems: 'center',
      }}>
        {/* Text side */}
        <div style={{ order: isEven ? 1 : 2 }}>
          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 100,
            background: `${scene.accent}12`,
            border: `1px solid ${scene.accent}30`,
            marginBottom: 20,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.6s ease 0s',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: scene.accent, boxShadow: `0 0 8px ${scene.accent}` }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: scene.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{scene.tag}</span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: 'clamp(36px, 4.5vw, 60px)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            letterSpacing: -1.5,
            marginBottom: 20,
            whiteSpace: 'pre-line',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}>
            {scene.headline}
          </h2>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(14px, 1.6vw, 17px)',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7,
            maxWidth: 480,
            marginBottom: 36,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.7s ease 0.2s',
          }}>
            {scene.sub}
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {scene.stats.map((s, i) => (
              <StatCard key={i} value={s.value} label={s.label} accent={scene.accent} active={visible} index={i} />
            ))}
          </div>
        </div>

        {/* Screen side */}
        <div style={{ order: isEven ? 2 : 1, display: 'flex', justifyContent: 'center' }}>
          <MacbookMockup src={scene.screen} accent={scene.accent} visible={visible} />
        </div>
      </div>
    </section>
  );
};

// ── Hero ──────────────────────────────────────────────────────────────────────

const Hero: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '80px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: '70vw', height: '70vw', maxWidth: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 60%)',
          animation: 'breathe 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '5%',
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,117,255,0.08) 0%, transparent 70%)',
          animation: 'breathe 8s ease-in-out infinite reverse',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        }} />
      </div>

      {/* Logo badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '10px 20px', borderRadius: 100,
        background: 'rgba(0,229,255,0.08)',
        border: '1px solid rgba(0,229,255,0.2)',
        marginBottom: 32,
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(-16px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="#00E5FF" strokeWidth="1.5"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ color: '#00E5FF', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Digital A.I. Garage</span>
      </div>

      {/* Main title */}
      <h1 style={{
        fontSize: 'clamp(52px, 8vw, 100px)',
        fontWeight: 900,
        lineHeight: 0.95,
        letterSpacing: -3,
        color: 'white',
        marginBottom: 24,
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s',
      }}>
        DAIG
        <span style={{
          display: 'block',
          background: 'linear-gradient(135deg, #00E5FF 0%, #0D75FF 50%, #7C3AED 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Marketplace
        </span>
      </h1>

      <p style={{
        fontSize: 'clamp(16px, 2vw, 22px)',
        color: 'rgba(255,255,255,0.5)',
        maxWidth: 560,
        lineHeight: 1.6,
        marginBottom: 48,
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.9s ease 0.25s',
      }}>
        O ecossistema completo de autopeças JDM do Japão — para desmanches, oficinas e compradores.
      </p>

      {/* CTA */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.9s ease 0.35s',
      }}>
        <a href="#scenes" style={{
          padding: '14px 32px', borderRadius: 12,
          background: 'linear-gradient(135deg, #00E5FF, #0D75FF)',
          color: '#020617', fontWeight: 700, fontSize: 15,
          textDecoration: 'none',
          boxShadow: '0 0 40px rgba(0,229,255,0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(0,229,255,0.5)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px rgba(0,229,255,0.3)'; }}
        >
          Ver a Plataforma →
        </a>
        <a href="/" style={{
          padding: '14px 32px', borderRadius: 12,
          background: 'transparent',
          color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 15,
          textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.12)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,229,255,0.4)'; (e.currentTarget as HTMLAnchorElement).style.color = '#00E5FF'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'; }}
        >
          Acessar a Plataforma
        </a>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        opacity: loaded ? 0.5 : 0,
        transition: 'opacity 1s ease 1s',
        animation: 'scrollBounce 2.5s ease-in-out infinite',
      }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
          <rect x="6.5" y="4" width="3" height="6" rx="1.5" fill="rgba(0,229,255,0.8)" style={{ animation: 'scrollDot 2.5s ease-in-out infinite' }}/>
        </svg>
      </div>
    </section>
  );
};

// ── Footer CTA ────────────────────────────────────────────────────────────────

const ClosingCTA: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null!);
  const visible = useIntersection(ref, 0.3);

  return (
    <section ref={ref} style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '80px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
          DAIG · 2026
        </div>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: -2, marginBottom: 20 }}>
          Pronto para<br />começar?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, marginBottom: 40, maxWidth: 440, margin: '0 auto 40px' }}>
          Crie sua conta gratuitamente e publique sua primeira peça em menos de 3 minutos.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/register" style={{
            padding: '16px 40px', borderRadius: 14,
            background: 'linear-gradient(135deg, #00E5FF, #0D75FF)',
            color: '#020617', fontWeight: 800, fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 0 60px rgba(0,229,255,0.4)',
          }}>
            Criar Conta Grátis
          </a>
          <a href="/catalog" style={{
            padding: '16px 40px', borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 16,
            textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)',
          }}>
            Ver Catálogo
          </a>
        </div>
      </div>
    </section>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PresentationPage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes breathe {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.7; }
          50% { transform: translateX(-50%) scale(1.08); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 0.8; }
          50% { box-shadow: 0 0 20px 4px currentColor; opacity: 1; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
      `}</style>

      <div style={{
        background: '#020617',
        color: 'white',
        fontFamily: '"Inter", "Roboto", system-ui, sans-serif',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}>
        <Hero />

        <div id="scenes">
          {SCENES.map((scene, i) => (
            <Scene key={scene.id} scene={scene} index={i} />
          ))}
        </div>

        <ClosingCTA />
      </div>
    </>
  );
}
