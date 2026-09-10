---
name: gsap-immersive-venue
description: >
  Skill de engenharia de animações premium para sites de casas de show e festivais (inspirado em Rock in Rio, Tomorrowland, Coachella).
  Cobre GSAP ScrollTrigger, SplitText, transições de página, scroll horizontal cinematográfico, parallax, pinning,
  micro-interações, cursor customizado, e integração com Three.js/WebGL — tudo otimizado para React/Vite com Lenis smooth scroll.
---

# GSAP Immersive Venue — Premium Animation Engineering

Skill de referência para transformar sites de casas de show e festivais em experiências imersivas de nível award-winning (Awwwards/FWA), inspirada em **Rock in Rio**, **Tomorrowland**, **Coachella**, **Lollapalooza** e **Berghain**.

---

## Stack Obrigatória

| Lib | Versão Mínima | Propósito |
|-----|---------------|-----------|
| `gsap` | ^3.12 | Motor de animação principal |
| `@gsap/react` | ^2.1 | Hook `useGSAP` para cleanup automático |
| `gsap/ScrollTrigger` | (incluso) | Scroll-driven animations, pin, scrub |
| `gsap/SplitText` | (incluso, free desde 3.12) | Text reveal por char/word/line |
| `gsap/Flip` | (incluso) | Layout transitions (reorder, filter) |
| `gsap/Observer` | (incluso) | Gesture/touch detection |
| `lenis` | ^1.1 | Smooth scroll de luxo (inércia + normalização) |
| `three` | ^0.170 | WebGL 3D scenes (opcional) |

### Instalação

```bash
npm install gsap @gsap/react lenis
```

### Setup Global (main.tsx ou App.tsx)

```tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer);

// Config global de performance
gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ limitCallbacks: true });
```

---

## 1. Lenis Smooth Scroll — A Base de Tudo

Todo site premium de casa de show DEVE usar smooth scroll. O scroll nativo é abrupto e quebra a sensação cinematográfica. Lenis normaliza o scroll com inércia, preservando acessibilidade (scroll do teclado, anchor links).

### Pattern: Lenis + GSAP ScrollTrigger Sync

```tsx
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,           // Duração da inércia (1.0–1.8 é o sweet spot para venue sites)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Ease exponencial suave
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,       // Melhora responsividade em mobile
    });

    lenisRef.current = lenis;

    // Sincroniza Lenis com GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0); // Desativa lag smoothing para sync perfeito

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return lenisRef;
}
```

### Regras do Lenis
- **NUNCA** use `overflow: hidden` no body quando Lenis está ativo — isso mata o scroll.
- Para modais/overlays, pause o Lenis: `lenisRef.current?.stop()` e retome: `lenisRef.current?.start()`.
- Em mobile, teste com `touchMultiplier: 2` para compensar a inércia natural do iOS.

---

## 2. ScrollTrigger — Scroll-Driven Storytelling

O coração da experiência. Cada seção do site deve "contar" uma história conforme o usuário rola.

### 2.1 Pin + Scrub (Seção Cinematográfica)

O usuário rola, a seção fica "grudada" e o conteúdo anima dentro dela. É o efeito mais icônico do Rock in Rio e Tomorrowland.

```tsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function CinematicHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',        // Quando o topo da seção toca o topo da viewport
        end: '+=300%',           // "Rola" 3x a altura da viewport dentro dessa seção
        pin: true,               // Gruda a seção
        scrub: 1,                // Animação segue o scroll com 1s de delay suave
        anticipatePin: 1,        // Previne "jump" visual ao iniciar o pin
        // snap: 1 / 4,          // Descomente para snap em 5 checkpoints
      },
    });

    // Fase 1: Logo entra com scale épico
    tl.from('.hero-logo', {
      scale: 3,
      opacity: 0,
      filter: 'blur(20px)',
      duration: 1,
    });

    // Fase 2: Tagline revela com parallax
    tl.from('.hero-tagline', {
      y: 100,
      opacity: 0,
      duration: 0.8,
    }, '-=0.3'); // Overlap de 0.3s com a animação anterior

    // Fase 3: Video background intensifica
    tl.to('.hero-video-overlay', {
      opacity: 0.3,  // Revela mais do vídeo
      duration: 1,
    }, '-=0.5');

    // Fase 4: CTA emerge
    tl.from('.hero-cta', {
      y: 60,
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'back.out(1.7)',
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative h-screen w-screen overflow-hidden">
      {/* Video background */}
      <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
        <source src="/videos/hero-bg.webm" type="video/webm" />
      </video>
      <div className="hero-video-overlay absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="hero-logo">
          {/* Logo component */}
        </div>
        <h1 className="hero-tagline text-6xl font-black uppercase tracking-wider">
          A Experiência Começa Aqui
        </h1>
        <button className="hero-cta mt-8 px-10 py-4 bg-emerald-500 text-black font-bold rounded-full">
          Garanta seu Ingresso
        </button>
      </div>
    </section>
  );
}
```

### 2.2 Parallax Multi-Layer (Profundidade de Palco)

Cria sensação de profundidade — essencial para simular o feeling de estar numa casa de show.

```tsx
useGSAP(() => {
  // Layer de fundo move lento
  gsap.to('.parallax-bg', {
    y: '-30%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.parallax-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  // Layer do meio move médio
  gsap.to('.parallax-mid', {
    y: '-15%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.parallax-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  // Layer da frente move rápido (ou fica parado)
  gsap.to('.parallax-fg', {
    y: '10%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.parallax-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}, { scope: containerRef });
```

### 2.3 Horizontal Cinema Scroll (Seção Lineup / Agenda)

O scroll vertical é convertido em movimento horizontal — perfeito para mostrar lineup, setores do venue, ou galeria de fotos.

```tsx
useGSAP(() => {
  const panels = gsap.utils.toArray<HTMLElement>('.hscroll-panel');
  const totalWidth = panels.length * window.innerWidth;

  gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: 'none',
    scrollTrigger: {
      trigger: '.hscroll-container',
      pin: true,
      scrub: 1,
      snap: {
        snapTo: 1 / (panels.length - 1),
        duration: { min: 0.2, max: 0.5 },
        ease: 'power1.inOut',
      },
      end: () => `+=${totalWidth}`,
      invalidateOnRefresh: true, // Recalcula em resize
    },
  });
}, { scope: containerRef });
```

**JSX correspondente:**
```tsx
<div className="hscroll-container flex flex-nowrap overflow-hidden">
  <section className="hscroll-panel w-screen h-screen flex-shrink-0">
    {/* Painel 1: Hero do Evento */}
  </section>
  <section className="hscroll-panel w-screen h-screen flex-shrink-0">
    {/* Painel 2: Lineup */}
  </section>
  <section className="hscroll-panel w-screen h-screen flex-shrink-0">
    {/* Painel 3: Mapa do Venue */}
  </section>
  <section className="hscroll-panel w-screen h-screen flex-shrink-0">
    {/* Painel 4: Ingressos */}
  </section>
</div>
```

---

## 3. SplitText — Tipografia Cinematográfica

A diferença entre um site amador e um site de festival premiado está no tratamento do texto. **Todo título grande DEVE ser animado com SplitText.**

### 3.1 Character-by-Character Reveal (Estilo Rock in Rio)

```tsx
useGSAP(() => {
  // Aguarda fonts carregarem para evitar layout shift
  document.fonts.ready.then(() => {
    const split = SplitText.create('.reveal-title', {
      type: 'chars,words',
      charsClass: 'char',
      wordsClass: 'word',
    });

    gsap.from(split.chars, {
      y: 100,
      rotateX: -90,
      opacity: 0,
      stagger: {
        each: 0.03,          // Delay entre cada caractere
        from: 'start',        // De qual ponto começa ('start', 'end', 'center', 'random')
      },
      duration: 0.8,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.reveal-title',
        start: 'top 85%',
        toggleActions: 'play none none reverse', // Reverte ao sair (scroll up)
      },
    });
  });
}, { scope: containerRef });
```

### 3.2 Word Cascade (Estilo Tomorrowland)

```tsx
const split = SplitText.create('.cascade-text', { type: 'words' });

gsap.from(split.words, {
  opacity: 0,
  y: 40,
  filter: 'blur(8px)',
  stagger: {
    each: 0.08,
    from: 'random',  // Efeito de "materialização" aleatória
  },
  duration: 1,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.cascade-text',
    start: 'top 80%',
  },
});
```

### 3.3 Line-by-Line Scrub (Texto que "preenche" com o scroll)

```tsx
const split = SplitText.create('.scrub-text', { type: 'lines' });

gsap.from(split.lines, {
  opacity: 0.15,
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.scrub-text',
    start: 'top 70%',
    end: 'bottom 40%',
    scrub: true,  // Cada linha "acende" conforme o scroll
  },
});
```

---

## 4. Page Transitions — Transições entre Seções/Views

Para sites SPA (como o StageGarden com React), transitions entre views criam continuidade visual.

### 4.1 Overlay Curtain Transition (Cortina de Palco)

```tsx
import { useRef, useCallback } from 'react';
import gsap from 'gsap';

export function usePageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);

  const transitionTo = useCallback(async (callback: () => void) => {
    if (!overlayRef.current) return;

    const tl = gsap.timeline();

    // 1. Cortina desce cobrindo tudo
    tl.to(overlayRef.current, {
      scaleY: 1,
      transformOrigin: 'top',
      duration: 0.6,
      ease: 'power4.inOut',
    });

    // 2. Executa a troca de conteúdo no meio da transição
    tl.call(callback);

    // 3. Cortina sobe revelando o novo conteúdo
    tl.to(overlayRef.current, {
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 0.6,
      ease: 'power4.inOut',
      delay: 0.1,
    });

    return tl;
  }, []);

  const TransitionOverlay = () => (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-emerald-500 pointer-events-none"
      style={{ transform: 'scaleY(0)', transformOrigin: 'top' }}
    />
  );

  return { transitionTo, TransitionOverlay };
}
```

### 4.2 Clip-Path Reveal (Estilo Festival Premium)

```tsx
const transitionWithClip = async (callback: () => void) => {
  const tl = gsap.timeline();

  // Círculo se expande do centro
  tl.fromTo('.transition-clip', {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 1,
  }, {
    clipPath: 'circle(150% at 50% 50%)',
    duration: 1,
    ease: 'power2.inOut',
  });

  tl.call(callback, [], 0.5); // Troca no meio

  // Novo conteúdo entra
  tl.fromTo('.new-content', {
    opacity: 0,
    y: 30,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
  });
};
```

### 4.3 Stagger Cards Transition (Estilo Lineup Reveal)

Quando o usuário navega para a seção de programação/lineup, cada card do artista entra em sequência:

```tsx
useGSAP(() => {
  const cards = gsap.utils.toArray('.artist-card');

  gsap.from(cards, {
    y: 120,
    opacity: 0,
    scale: 0.85,
    rotateY: 15,
    stagger: {
      each: 0.1,
      from: 'start',
      grid: 'auto',
      ease: 'power2.inOut',
    },
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.lineup-grid',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
  });
}, { scope: containerRef });
```

---

## 5. Micro-Interações de Venue

### 5.1 Magnetic Buttons (Botões que "puxam" o mouse)

```tsx
export function useMagneticButton(ref: React.RefObject<HTMLElement>, strength = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [ref, strength]);
}
```

### 5.2 Custom Cursor (Cursor de Festival)

```tsx
export function CustomCursor() {
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

    // Expand cursor on hover over interactive elements
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
      <div ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-emerald-400 rounded-full pointer-events-none z-[10000] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
      />
      <div ref={followerRef}
        className="fixed top-0 left-0 w-10 h-10 border border-emerald-400/50 rounded-full pointer-events-none z-[10000] mix-blend-difference -translate-x-1/2 -translate-y-1/2"
      />
    </>
  );
}
```

### 5.3 Glow Trail on Hover (Trilha neon nos cards)

```tsx
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  gsap.to(e.currentTarget, {
    '--glow-x': `${x}px`,
    '--glow-y': `${y}px`,
    duration: 0.3,
  });
};

// CSS do card:
// background: radial-gradient(circle 200px at var(--glow-x) var(--glow-y), rgba(0,255,136,0.15), transparent);
```

---

## 6. Entrance Animations (Elementos Entrando na Viewport)

### 6.1 Batch ScrollTrigger (Performance para muitos elementos)

Ao invés de criar 1 ScrollTrigger por elemento, use `ScrollTrigger.batch`:

```tsx
useGSAP(() => {
  ScrollTrigger.batch('.fade-in-element', {
    onEnter: (batch) => {
      gsap.from(batch, {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
    onLeaveBack: (batch) => {
      gsap.to(batch, { opacity: 0, y: 50, stagger: 0.05 });
    },
    start: 'top 85%',
  });
}, { scope: containerRef });
```

### 6.2 Counter Animation (Números do Venue)

```tsx
useGSAP(() => {
  gsap.from('.counter-value', {
    textContent: 0,
    duration: 2,
    ease: 'power1.inOut',
    snap: { textContent: 1 }, // Arredonda para inteiros
    scrollTrigger: {
      trigger: '.stats-section',
      start: 'top 70%',
      toggleActions: 'play none none none',
    },
  });
}, { scope: containerRef });
```

---

## 7. Three.js + GSAP (3D Synced com Scroll)

Para venues com visualização 3D (mapa de setores, palco interativo):

```tsx
useGSAP(() => {
  // Sync câmera do Three.js com scroll
  gsap.to(cameraRef.current.position, {
    x: 5,
    y: 2,
    z: -3,
    scrollTrigger: {
      trigger: '.venue-3d-section',
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 1,
    },
    ease: 'none',
  });

  // Rotaciona o modelo do palco
  gsap.to(stageModelRef.current.rotation, {
    y: Math.PI * 0.5,
    scrollTrigger: {
      trigger: '.venue-3d-section',
      start: 'top top',
      end: '+=200%',
      scrub: true,
    },
  });
}, { scope: containerRef, dependencies: [cameraRef, stageModelRef] });
```

---

## 8. Referências de Design — Sites Premiados

### Rock in Rio
- **Padrão:** Hero full-screen com vídeo + contagem regressiva animada
- **Scroll:** Seções que "revelam" conteúdo com pin+scrub, tipografia bold animada
- **Paleta:** Preto profundo, tons vibrantes de rosa/roxo/laranja, dourado
- **Tipo:** Display ultra-bold (900+) para headlines, mono para dados

### Tomorrowland
- **Padrão:** Mundo fantasia com parallax multi-camada (floresta, castelo, palco)
- **Scroll:** Storytelling contínuo, cada scroll revela nova "camada" do mundo
- **Paleta:** Azul royal, dourado, cyan, com gradientes místicos
- **Tipo:** Serif elegante para títulos, sans para corpo

### Coachella
- **Padrão:** Minimalista editorial, grid de lineup com hover expansivo
- **Scroll:** Limpo, sem excesso — snap sections com transições suaves
- **Paleta:** Areia/deserto, laranja queimado, branco, preto
- **Tipo:** Sans-serif geometric, spacing generoso

### Berghain / Underground Venues
- **Padrão:** Brutalismo digital, preto total, tipografia raw
- **Scroll:** Mínimo — impacto imediato, glitch effects, noise textures
- **Paleta:** Preto #000, branco #fff, cinza industrial
- **Tipo:** Monospace ou sans-serif condensada

---

## 9. Regras de Performance (OBRIGATÓRIAS)

1. **`will-change`:** Use `will-change: transform` apenas em elementos que realmente serão animados. Remove após a animação: `gsap.set(el, { clearProps: 'will-change' })`.

2. **Animate somente `transform` e `opacity`:** Nunca anime `width`, `height`, `top`, `left`, `margin`, `padding` — causa reflow/repaint e destrói FPS.

3. **`useGSAP` sempre:** Nunca use `useEffect` para animações GSAP. O hook `useGSAP` faz cleanup automático, evitando memory leaks de ScrollTrigger.

4. **`invalidateOnRefresh: true`:** Em qualquer ScrollTrigger que usa valores calculados (window.innerWidth, offsetHeight), sempre adicione `invalidateOnRefresh: true` para recalcular em resize.

5. **Mobile first:** Toda animação complexa (parallax multi-layer, 3D) deve ter fallback simplificado para mobile:
   ```tsx
   ScrollTrigger.matchMedia({
     '(min-width: 768px)': () => {
       // Animações desktop completas
     },
     '(max-width: 767px)': () => {
       // Versão simplificada (sem parallax 3D, menos layers)
     },
   });
   ```

6. **Lazy load de seções:** Não crie 20 ScrollTriggers no mount. Use `Observer` ou `IntersectionObserver` para criar ScrollTriggers apenas quando a seção está próxima.

7. **`scrub` numérico vs boolean:** Use `scrub: 1` (com delay de 1s) para suavidade. `scrub: true` é imediato e pode parecer "nervoso".

8. **Markers em dev:** Sempre use `markers: true` em desenvolvimento para visualizar os pontos de trigger. Remova em produção.

9. **`gsap.ticker.fps()`:** Em mobile, considere limitar para 30fps se houver muitas animações simultâneas:
   ```tsx
   if (window.innerWidth < 768) gsap.ticker.fps(30);
   ```

10. **Não anime dentro de `onScroll`:** Use `ScrollTrigger` e `scrub`. Event listeners de scroll causam jank.

---

## 10. CSS Foundations (Variáveis e Classes Utilitárias)

```css
:root {
  /* Timing premium */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);
  --duration-fast: 0.3s;
  --duration-normal: 0.6s;
  --duration-slow: 1.2s;

  /* Glow effects */
  --glow-emerald: 0 0 40px rgba(0, 255, 136, 0.3), 0 0 80px rgba(0, 255, 136, 0.1);
  --glow-intense: 0 0 60px rgba(0, 255, 136, 0.5), 0 0 120px rgba(0, 255, 136, 0.2);

  /* Grain overlay */
  --noise-opacity: 0.04;
}

/* Film grain overlay — dá textura de festival/show ao vivo */
.noise-overlay::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  opacity: var(--noise-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
}

/* Vignette escura nas bordas — simula iluminação de palco */
.vignette::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9997;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%);
}

/* Scanlines sutis — textura de telão LED */
.scanlines::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9996;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
}
```

---

## 11. Checklist de Implementação

Ao implementar melhorias no site de casa de show, siga esta ordem:

- [ ] **1. Lenis smooth scroll** — Instalar e integrar com ScrollTrigger
- [ ] **2. Hero section** — Pin + scrub com video background, logo reveal, CTA emerge
- [ ] **3. SplitText nos títulos** — Char reveal nos H1, word reveal nos H2, line scrub nos parágrafos
- [ ] **4. Horizontal scroll** — Seção lineup/agenda com snap entre painéis
- [ ] **5. Parallax layers** — Background, midground, foreground com velocidades diferentes
- [ ] **6. Stagger entrance** — Cards de eventos/artistas com ScrollTrigger.batch
- [ ] **7. Magnetic buttons** — CTAs principais com efeito magnético
- [ ] **8. Page transitions** — Cortina ou clip-path entre views (público ↔ admin)
- [ ] **9. Counter animations** — Números de lotação, watts, eventos realizados
- [ ] **10. Noise + vignette** — Texturas de overlay para feeling de show ao vivo
- [ ] **11. Custom cursor** — Cursor com follower e expand on hover (desktop only)
- [ ] **12. Mobile fallbacks** — Simplificar tudo via `ScrollTrigger.matchMedia`

---

## 12. Anti-Patterns (NUNCA FAÇA)

| ❌ Anti-Pattern | ✅ Correto |
|---|---|
| `useEffect` para animações GSAP | `useGSAP` do `@gsap/react` |
| `element.style.transform = ...` no scroll listener | `gsap.to()` com `ScrollTrigger` |
| `position: fixed` manual para pin | `ScrollTrigger({ pin: true })` |
| `setTimeout` para sequenciar animações | `gsap.timeline()` com offsets |
| Animate `width`/`height`/`top`/`left` | Animate `transform` e `opacity` |
| CSS `scroll-behavior: smooth` com Lenis | Desative — Lenis faz o smooth scroll |
| Criar ScrollTrigger dentro de `.map()` | `ScrollTrigger.batch()` para listas |
| Esquecer cleanup | `useGSAP` cuida sozinho (ou `gsap.context()`) |
| `overflow: hidden` no body com Lenis | Lenis controla o overflow |
| Animações 3D complexas em mobile | `ScrollTrigger.matchMedia` com fallback 2D |
