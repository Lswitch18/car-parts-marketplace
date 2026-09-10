import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

// --- 1. Lenis Smooth Scroll Hook ---
function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return lenisRef;
}

// --- 2. Custom Cursor ---
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.6, ease: 'power2.out' });
    };

    const expandOnHover = () => {
      gsap.to(follower, { scale: 2.5, opacity: 0.5, duration: 0.3 });
    };
    const shrinkOnLeave = () => {
      gsap.to(follower, { scale: 1, opacity: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', moveCursor);
    document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
      el.addEventListener('mouseenter', expandOnHover);
      el.addEventListener('mouseleave', shrinkOnLeave);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-blue-400 rounded-full pointer-events-none z-[10000] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-10 h-10 border border-blue-400/50 rounded-full pointer-events-none z-[10000] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
      />
    </>
  );
}

// --- 3. Main Page Component ---
export default function PresentationPage() {
  useSmoothScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<'pt' | 'ja'>('pt');

  const content = {
    pt: {
      tagline: 'A Experiência Começa Aqui',
      cta: 'Iniciar Demonstração Automática',
      module1: 'Módulo 1: Listagem Automática com IA',
      desc1: 'Nosso Auto-Editor com IA remove silêncios e pausas automaticamente. A visão computacional analisa suas peças automotivas e as cataloga perfeitamente.',
      bullets1: ['Corte automatizado de silêncios', 'Integração via CLI', 'Visão Computacional Avançada'],
      module2: 'Módulo 2: Ecossistema SaaS Multi-Tenant',
      desc2: 'Cada loja opera em seu próprio ambiente isolado, protegido por RLS no Supabase, garantindo segurança corporativa e pagamentos Stripe integrados no Japão.',
    },
    ja: {
      tagline: '体験はここから始まる',
      cta: '自動デモを開始',
      module1: 'モジュール 1: AIによる自動出品',
      desc1: 'Auto-Editor AIが沈黙やポーズを自動的にカットします。コンピュータビジョンが自動車部品を分析し、完璧にカタログ化します。',
      bullets1: ['AIによる無音部分の自動カット', 'CLI経由のシームレスな統合', '高度なコンピュータビジョン'],
      module2: 'モジュール 2: マルチテナントSaaSエコシステム',
      desc2: '各店舗はSupabaseのRLSによって保護された独自の隔離環境で運用され、企業レベルのセキュリティと日本のStripe決済が統合されています。',
    }
  };

  const t = content[lang];

  useGSAP(() => {
    // Hero Pin & Reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '+=250%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    tl.from('.hero-logo', { scale: 3, opacity: 0, filter: 'blur(20px)', duration: 1 });
    tl.from('.hero-tagline', { y: 100, opacity: 0, duration: 0.8 }, '-=0.3');
    tl.to('.hero-video-overlay', { opacity: 0.75, duration: 1 }, '-=0.5'); // Slightly darker overlay for better visibility of the video
    tl.from('.hero-cta', { y: 60, opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.7)' });

    // Text Reveals
    gsap.from('.reveal-title', {
      y: 80,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.module-1-section',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    });

    gsap.from('.cascade-text', {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.cascade-text',
        start: 'top 80%',
      },
    });

    // Bullets stagger
    ScrollTrigger.batch('.bullet-item', {
      onEnter: (batch) => gsap.from(batch, { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' }),
      start: 'top 85%',
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-[#020617] text-white min-h-screen overflow-hidden font-outfit relative">
      <CustomCursor />
      
      {/* Film Grain & Vignette */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.04] bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E')]"></div>
      <div className="fixed inset-0 z-40 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>

      {/* Header Controls */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-black/50 backdrop-blur-md border-b border-blue-500/10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DAIG" className="w-10 h-10 rounded-full" />
          <h1 className="text-xl font-black tracking-widest uppercase">DAIG</h1>
        </div>
        <select 
          className="bg-blue-950/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-full text-sm font-bold outline-none cursor-pointer hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
          value={lang}
          onChange={(e) => setLang(e.target.value as 'pt' | 'ja')}
        >
          <option value="pt">🇧🇷 Português</option>
          <option value="ja">🇯🇵 日本語</option>
        </select>
      </header>

      {/* Cinematic Hero */}
      <section className="hero-section relative h-screen w-screen overflow-hidden flex items-center justify-center">
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay muted loop playsInline
        >
          <source src="/videos/daig-full-demo.webm" type="video/webm" />
        </video>
        <div className="hero-video-overlay absolute inset-0 bg-black/80" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          <div className="hero-logo mb-6">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-500">
              DAIG
            </h1>
          </div>
          <h2 className="hero-tagline text-3xl md:text-5xl font-black uppercase tracking-wider mb-10">
            {t.tagline}
          </h2>
          <button 
            data-cursor-hover 
            className="hero-cta px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(96,165,250,0.6)] hover:scale-105 transition-all duration-300"
            onClick={() => {
              window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' });
            }}
          >
            {t.cta}
          </button>
        </div>
      </section>

      {/* Module 1: AI Features */}
      <section className="module-1-section relative min-h-screen flex items-center py-32 px-6 md:px-20 bg-[#020617]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <div className="text-blue-500 font-mono text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
              {t.module1}
            </div>
            <h3 className="reveal-title text-5xl md:text-6xl font-black leading-tight mb-8">
              Computer Vision & Smart Interface
            </h3>
            <p className="cascade-text text-xl text-gray-400 leading-relaxed mb-10">
              {t.desc1}
            </p>
            <ul className="space-y-4">
              {t.bullets1.map((bullet, idx) => (
                <li key={idx} className="bullet-item flex items-center gap-4 text-lg font-medium text-gray-200">
                  <span className="text-blue-500 font-black text-xl">✦</span> {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative z-10 w-full aspect-square rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)] group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-black/80 z-10 mix-blend-overlay group-hover:opacity-50 transition-opacity duration-700"></div>
            <img src="/presentation_frames_clean/frame_001.jpg" alt="DAIG AI Vision" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out" onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1617195737496-bc30194e3a19?auto=format&fit=crop&q=80&w=800'} />
          </div>
        </div>
      </section>

      {/* Module 2: SaaS Multi-tenant */}
      <section className="relative min-h-screen flex items-center py-32 px-6 md:px-20 bg-gradient-to-b from-[#020617] to-[#04091a]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 w-full aspect-video rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)] group md:order-1 order-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-black/80 z-10 mix-blend-overlay group-hover:opacity-50 transition-opacity duration-700"></div>
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" alt="SaaS Dashboard" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out" />
          </div>
          
          <div className="z-10 md:order-2 order-1">
            <div className="text-blue-500 font-mono text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
              {t.module2}
            </div>
            <h3 className="text-5xl md:text-6xl font-black leading-tight mb-8">
              B2B Marketplace & ERP
            </h3>
            <p className="text-xl text-gray-400 leading-relaxed mb-10">
              {t.desc2}
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 border-t border-white/5 text-center text-gray-500 font-mono text-xs tracking-widest relative z-10">
        DAIG PLATFORM 2026 • JDM AUTOMOTIVE COMPUTER VISION & MULTI-TENANT SAAS ECOSYSTEM
      </footer>
    </div>
  );
}
