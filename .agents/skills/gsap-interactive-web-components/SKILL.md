---
name: gsap-interactive-web-components
description: >
  Skill avançada de engenharia e design para criação de Web Components Interativos e Efeitos Cinematográficos com GSAP (ScrollTrigger, SplitText, Observer, Flip, Draggable).
  Abrange botões magnéticos, cards com tilt 3D, transições de texto morphing, partículas acústicas, transições de tela com clip-path/curtain, cursores personalizados e animações de alta performance com @gsap/react.
---

# GSAP Interactive Web Components & Effects

Guia mestre de engenharia frontend para criação de componentes web interativos, micro-interações táteis e efeitos visuais com **GSAP 3**, **@gsap/react** e **TypeScript**, focados em experiências imersivas modernas (padrão Awwwards / FWA / Webby).

---

## 1. Stack & Fundamentos

| Tecnologia | Finalidade |
| :--- | :--- |
| `gsap` (^3.12) | Core do motor de animação com precisão subpixel |
| `@gsap/react` (^2.1) | Hook `useGSAP` com escopo isolado e cleanup automático |
| `gsap/ScrollTrigger` | Gatilhos de rolagem, pinning e interpolação contínua (scrub) |
| `gsap/SplitText` | Divisão e manipulação de tipografia por caracteres/palavras/linhas |
| `gsap/Observer` | Detecção ultra-rápida de gestos (wheel, touch, pointer, scroll) |
| `gsap/Flip` | Transições de layout FLIP (First, Last, Invert, Play) |
| `gsap/Draggable` | Arrastar elementos com inércia física e snapping |

### Inicialização Segura no App (`main.tsx` ou `App.tsx`)
```tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Observer } from 'gsap/Observer';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(ScrollTrigger, SplitText, Observer, Flip, Draggable);
gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ limitCallbacks: true });
```

---

## 2. Componentes Interativos

### 2.1 Botão Magnético Tátil (`useMagneticElement`)
Faz o botão "atrair" fisicamente o cursor do mouse e retornar com elasticidade suave ao sair.

```tsx
import { useEffect, RefObject } from 'react';
import gsap from 'gsap';

export function useMagnetic(ref: RefObject<HTMLElement>, strength = 0.35) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

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
  }, [ref, strength]);
}
```

---

### 2.2 Card com Tilt 3D e Spotlight Reflexivo
Reage ao movimento do cursor com perspectiva 3D realista e iluminação radial dinâmica.

```tsx
import React, { useRef } from 'react';
import gsap from 'gsap';

export const Interactive3DCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      rotateY: normX * 12,
      rotateX: -normY * 12,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 1,
        x: x - 100,
        y: y - 100,
        duration: 0.1,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)',
    });

    if (glowRef.current) {
      gsap.to(glowRef.current, { opacity: 0, duration: 0.4 });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: '#0a0d0b',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Spotlight Radial Glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
          opacity: 0,
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};
```

---

### 2.3 Tipografia Morphing & Vetor SVG Incorporado (Efeito Raio/Ícone)
Alterna palavras com desfoque cinético, substituindo caracteres-chave por glifos SVG estáticos ou animados (ex: `V⚡VA`).

```tsx
import React, { useState, useEffect } from 'react';

export const MorphingNeonText: React.FC = () => {
  const [activeWord, setActiveWord] = useState<'DIMENSÃO' | 'IMERSÃO'>('DIMENSÃO');
  const [isMorphing, setIsMorphing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsMorphing(true);
      setTimeout(() => {
        setActiveWord((prev) => (prev === 'DIMENSÃO' ? 'IMERSÃO' : 'DIMENSÃO'));
        setIsMorphing(false);
      }, 350);
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className="text-neon-secret"
      onClick={() => {
        setIsMorphing(true);
        setTimeout(() => {
          setActiveWord((prev) => (prev === 'DIMENSÃO' ? 'IMERSÃO' : 'DIMENSÃO'));
          setIsMorphing(false);
        }, 250);
      }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.28em', cursor: 'pointer' }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: isMorphing ? 0 : 1,
          transform: isMorphing ? 'translateY(12px) scale(0.92)' : 'translateY(0px) scale(1)',
          filter: isMorphing ? 'blur(8px)' : 'blur(0px)',
        }}
      >
        <span>{activeWord}</span>
      </span>

      {/* V⚡VA com Glifo Vetorial SVG */}
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span>V</span>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            display: 'inline-block',
            width: '0.92em',
            height: '1.65em',
            verticalAlign: '-0.28em',
            margin: '0 0.05em',
            filter: 'drop-shadow(0 0 14px #00ff88) drop-shadow(0 0 25px rgba(0,255,136,0.6))',
          }}
        >
          <polygon points="14,1 4,13 11,13 9,23 20,9 13,9" />
        </svg>
        <span>VA</span>
      </span>
    </span>
  );
};
```

---

## 3. Efeitos de Scroll Cinematográfico

### 3.1 Pinned Horizontal Carousel com Interpolação Contínua
Converte o scroll vertical em rolagem horizontal sem travamentos ou quebras de layout.

```tsx
useGSAP(() => {
  const track = trackRef.current;
  const section = sectionRef.current;
  if (!track || !section) return;

  const getMaxScrollX = () => -(track.scrollWidth - window.innerWidth + 80);

  gsap.to(track, {
    x: getMaxScrollX,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.abs(getMaxScrollX())}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}, { scope: sectionRef });
```

---

### 3.2 Parallax Multi-Layer com Camada de Silhueta de Multidão
Cria a sensação de perspectiva tridimensional com o público emergindo e ondulando na base.

```tsx
useGSAP(() => {
  if (!heroRef.current) return;
  const crowd = heroRef.current.querySelector<HTMLElement>('.hero-crowd-img');
  
  if (crowd) {
    const crowdTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    });

    // Subida de 15% combinada com ondulação acústica senoidal (wave sway)
    crowdTl
      .fromTo(
        crowd,
        { yPercent: 15, xPercent: 0, rotateZ: 0, scale: 1, opacity: 0.5 },
        { yPercent: 9, xPercent: -1.6, rotateZ: -1.2, scale: 1.02, opacity: 0.7, ease: 'sine.inOut', duration: 1 }
      )
      .to(crowd, {
        yPercent: 4,
        xPercent: 1.8,
        rotateZ: 1.2,
        scale: 1.04,
        opacity: 0.88,
        ease: 'sine.inOut',
        duration: 1,
      })
      .to(crowd, {
        yPercent: 0,
        xPercent: 0,
        rotateZ: 0,
        scale: 1.02,
        opacity: 1,
        ease: 'sine.out',
        duration: 1,
      });
  }
}, { scope: heroRef });
```

---

## 4. Regras Obrigatórias de Performance e Segurança

1. **Apenas Propriedades Aceleradas por GPU:**
   - Animamos exclusivamente `transform` (`x`, `y`, `scale`, `rotation`, `yPercent`) e `opacity`.
   - **NUNCA** anime `top`, `left`, `width`, `height`, `margin` ou `padding` dentro de loops ou ScrollTriggers.

2. **Gerenciamento de Ciclo de Vida:**
   - Sempre utilize o hook `useGSAP` com `{ scope: containerRef }`.
   - Elementos dinâmicos ou redimensionáveis devem conter `invalidateOnRefresh: true` no ScrollTrigger.

3. **Segurança (Zero Injeção XSS):**
   - Nunca utilize `dangerouslySetInnerHTML`.
   - O `SplitText` deve manipular elementos do DOM React nativos e caracteres de texto puro devidamente escapados.
