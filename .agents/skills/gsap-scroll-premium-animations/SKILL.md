---
name: gsap-scroll-premium-animations
description: "Skill avançada para animações premium com GSAP ScrollTrigger, Framer Motion, scroll-driven animations, parallax, stagger reveals, morphing SVGs, counters animados e motion design cinematográfico para páginas SaaS multitenant. Usar quando precisar de páginas com animações impressionantes de nível production."
---

# 🎬 GSAP + Scroll Premium Animations — Production-Grade Motion Design

Skill de animações avançadas para criar experiências visuais cinematográficas no nível de sites premiados (Awwwards / FWA). Focada em **páginas SaaS multitenant**, dashboards com dados reais e componentes de alto impacto visual.

---

## 📦 1. Stack de Animação (Dependências)

### Obrigatórias (já instaladas ou instalar)
```bash
# GSAP (gratuito com plugins ScrollTrigger, Flip, TextPlugin)
npm install gsap @gsap/react

# Framer Motion (já instalado no projeto)
# framer-motion ^12.x — usar para layout animations, AnimatePresence, variants

# Lenis — smooth scroll buttery (substitui locomotive-scroll)
npm install lenis
```

### Regras de Uso
| Biblioteca | Quando Usar |
|---|---|
| **GSAP + ScrollTrigger** | Scroll-driven animations, pin sections, timeline complexas, parallax, scrub, stagger de múltiplos elementos |
| **Framer Motion** | Layout transitions, AnimatePresence (mount/unmount), drag, variants em listas, hover/tap micro-interactions |
| **Lenis** | Smooth scroll global, integração com GSAP ScrollTrigger |
| **CSS nativo** | `@keyframes` simples (pulse, spin, shimmer), `scroll-timeline`, `view-transition-api` |

> ⚠️ **NUNCA** misture GSAP e Framer Motion no **mesmo elemento DOM**. Cada elemento é controlado por **uma** engine.

---

## 🏗️ 2. Arquitetura de Animação no React

### 2.1 — Hook `useGsap` com cleanup correto

```tsx
// src/modules/shared/hooks/useGsapScrollTrigger.ts
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(ScrollTrigger, TextPlugin)

/**
 * Hook para criar animações GSAP com ScrollTrigger e cleanup automático.
 * Cada componente cria um contexto isolado (gsap.context).
 */
export function useGsapScrollTrigger(
  animationFn: (ctx: gsap.Context) => void,
  deps: any[] = []
) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      animationFn(gsap.context(() => {}, containerRef))
    }, containerRef)

    return () => ctx.revert() // cleanup total: remove listeners + reverte transforms
  }, deps)

  return containerRef
}
```

### 2.2 — Provider de Smooth Scroll (Lenis)

```tsx
// src/modules/shared/providers/SmoothScrollProvider.tsx
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })
    lenisRef.current = lenis

    // Sincroniza Lenis com GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf as any)
    }
  }, [])

  return <>{children}</>
}
```

---

## 🎯 3. Padrões de Animação Avançados

### 3.1 — Stagger Reveal de Cards (Scroll-triggered)

```tsx
// Cada card aparece com delay escalonado ao entrar no viewport
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.metric-card', {
      y: 80,
      opacity: 0,
      scale: 0.92,
      duration: 0.8,
      ease: 'power3.out',
      stagger: {
        each: 0.12,
        from: 'start',
      },
      scrollTrigger: {
        trigger: '.metrics-grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })
  }, containerRef)
  return () => ctx.revert()
}, [])
```

### 3.2 — Counter Animado (Número que sobe)

```tsx
// Hook de counter animado para KPIs
export function useAnimatedCounter(
  endValue: number,
  duration: number = 2,
  prefix: string = '¥'
) {
  const ref = useRef<HTMLSpanElement>(null)
  const counterRef = useRef({ value: 0 })

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.to(counterRef.current, {
        value: endValue,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = `${prefix}${Math.round(counterRef.current.value).toLocaleString()}`
          }
        },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 90%',
          toggleActions: 'play none none reset',
        },
      })
    })

    return () => ctx.revert()
  }, [endValue, duration, prefix])

  return ref
}

// Uso:
// const revenueRef = useAnimatedCounter(2450000, 2.5, '¥')
// <span ref={revenueRef} className="text-4xl font-black text-white">¥0</span>
```

### 3.3 — Parallax Hero com Pin Section

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // Background parallax
    gsap.to('.hero-bg', {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    })

    // Pin + timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '+=150%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    })

    tl.from('.hero-title', { y: 100, opacity: 0, duration: 1 })
      .from('.hero-subtitle', { y: 60, opacity: 0, duration: 0.8 }, '-=0.4')
      .from('.hero-cta', { scale: 0.8, opacity: 0, duration: 0.6 }, '-=0.3')
      .to('.hero-glow', { scale: 1.5, opacity: 0.8, duration: 1.2 }, '-=0.8')

  }, containerRef)
  return () => ctx.revert()
}, [])
```

### 3.4 — Text Reveal por Linha (Split Text Effect)

```tsx
// Reveal de texto palavra por palavra com mask
function useTextReveal(selector: string) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector)
    elements.forEach((el) => {
      const text = el.textContent || ''
      const words = text.split(' ')
      el.innerHTML = words
        .map((word) => `<span class="inline-block overflow-hidden"><span class="reveal-word inline-block">${word}</span></span>`)
        .join(' ')
    })

    gsap.from(`${selector} .reveal-word`, {
      yPercent: 100,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out',
      stagger: 0.04,
      scrollTrigger: {
        trigger: selector,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })
  }, [])
}
```

### 3.5 — Glow Trail no Mouse (Cursor Follow)

```tsx
useEffect(() => {
  const glow = document.querySelector('.cursor-glow') as HTMLElement
  if (!glow) return

  const onMove = (e: MouseEvent) => {
    gsap.to(glow, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.6,
      ease: 'power2.out',
    })
  }

  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)
}, [])

// No JSX:
// <div className="cursor-glow fixed w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
```

### 3.6 — Horizontal Scroll Section (Scroll Hijack)

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const panels = gsap.utils.toArray<HTMLElement>('.scroll-panel')

    gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: '.horizontal-scroll-container',
        pin: true,
        scrub: 1,
        snap: 1 / (panels.length - 1),
        end: () => `+=${document.querySelector('.horizontal-scroll-container')?.scrollWidth}`,
      },
    })
  }, containerRef)
  return () => ctx.revert()
}, [])
```

---

## 🎨 4. Efeitos Visuais CSS Avançados (sem JS)

### 4.1 — Shimmer Loading (Skeleton Premium)

```css
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(13, 117, 255, 0.04) 0%,
    rgba(13, 117, 255, 0.12) 50%,
    rgba(13, 117, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 4.2 — Neon Glow Pulse

```css
.neon-pulse {
  animation: neonPulse 3s ease-in-out infinite;
}

@keyframes neonPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(13, 117, 255, 0.15), 0 0 60px rgba(13, 117, 255, 0.05); }
  50% { box-shadow: 0 0 30px rgba(13, 117, 255, 0.3), 0 0 80px rgba(13, 117, 255, 0.1); }
}
```

### 4.3 — Gradient Border Animado

```css
.gradient-border {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(135deg, #0D75FF, #00E5FF, #7000FF, #0D75FF);
  background-size: 300% 300%;
  animation: gradientRotate 4s ease infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

@keyframes gradientRotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### 4.4 — Glassmorphism Ultra Premium

```css
.glass-ultra {
  background: rgba(11, 14, 23, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(13, 117, 255, 0.12);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.02) inset,
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(13, 117, 255, 0.05);
}
```

---

## 🏢 5. Padrão Específico: Página SaaS Multitenant

### 5.1 — Estrutura de Seções com ScrollTrigger

```
┌───────────────────────────────────────────────────┐
│ HERO SECTION (pinned, parallax bg)                │
│  ├─ Logo animado + título com text-reveal         │
│  ├─ Subtitle fade-in                              │
│  ├─ CTA com glow pulsante                         │
│  └─ Partículas/grid animado no fundo              │
├───────────────────────────────────────────────────┤
│ KPI METRICS (stagger reveal)                      │
│  ├─ Counter animado ¥ MRR                         │
│  ├─ Counter animado Total Tenants                  │
│  ├─ Counter animado Active Users                   │
│  └─ Counter animado Churn Rate (com cor dinâmica)  │
├───────────────────────────────────────────────────┤
│ TENANTS TABLE / GRID (scroll-triggered stagger)   │
│  ├─ Cards com gradient-border animado             │
│  ├─ Status badge com glow por status              │
│  ├─ Hover → scale + shadow expansion              │
│  └─ Click → Framer Motion layoutId transition     │
├───────────────────────────────────────────────────┤
│ PLANS COMPARISON (horizontal scroll ou tabs)      │
│  ├─ Plan cards com morphing highlight             │
│  ├─ Feature checkmarks com stagger                │
│  └─ Selected plan → glow border animado           │
├───────────────────────────────────────────────────┤
│ REVENUE CHART (scrub-driven reveal)               │
│  ├─ Chart lines desenham no scroll (stroke-dashoffset) │
│  ├─ Tooltips com motion                           │
│  └─ Gradients animados sob as linhas              │
└───────────────────────────────────────────────────┘
```

### 5.2 — AnimatePresence para Modais e Transições de Tab

```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Tab content transition
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {renderTabContent()}
  </motion.div>
</AnimatePresence>

// Modal com backdrop blur
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-4 top-[10%] mx-auto max-w-2xl z-50 glass-ultra rounded-3xl p-8"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 5.3 — Layout Animation para listas de tenants

```tsx
<motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <AnimatePresence>
    {filteredTenants.map((tenant, i) => (
      <motion.div
        key={tenant.id}
        layout
        layoutId={tenant.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
        className="metric-card"
      >
        <TenantCard tenant={tenant} />
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>
```

---

## ⚡ 6. Performance — Regras Obrigatórias

1. **`will-change`**: Adicione `will-change: transform, opacity` **apenas** em elementos que serão animados. Remova após a animação.

2. **GPU-only properties**: Anime apenas `transform` (translate, scale, rotate) e `opacity`. NUNCA anime `width`, `height`, `top`, `left`, `margin`, `padding` — causam reflow.

3. **`ScrollTrigger.refresh()`**: Chame após mudança de layout (ex: abrir accordion, carregar dados async):
   ```tsx
   useEffect(() => {
     if (!loading && data) {
       ScrollTrigger.refresh()
     }
   }, [loading, data])
   ```

4. **Lazy register plugins**: Registre GSAP plugins uma vez no nível do módulo, não dentro de useEffect.

5. **`gsap.context()`**: SEMPRE use `gsap.context()` com `containerRef` para scoping. O `.revert()` no cleanup do useEffect previne memory leaks e conflitos de animação.

6. **Framer Motion `layout` prop**: Use com moderação — cada `layout` element adiciona um MutationObserver. Em listas >50 items, use `layoutScroll` ou paginação.

7. **Reduce Motion**: Respeite `prefers-reduced-motion`:
   ```tsx
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
   if (prefersReducedMotion) {
     gsap.globalTimeline.timeScale(0) // desabilita todas as animações
   }
   ```

---

## 🎨 7. Paleta de Cores do Projeto (referência)

| Token | Hex | Uso |
|---|---|---|
| `--void` | `#06080F` | Fundo principal |
| `--surface` | `#0B0E17` | Cards e superfícies |
| `--neon-blue` | `#0D75FF` | Acento primário |
| `--neon-cyan` | `#00E5FF` | Acento secundário |
| `--neon-purple` | `#7000FF` | Acento terciário (gradientes) |
| `--success` | `#10B981` | Status ativo/sucesso |
| `--warning` | `#F59E0B` | Trial/atenção |
| `--danger` | `#EF4444` | Suspenso/erro |

---

## 🔧 8. Easing Reference

| Nome | GSAP | CSS | Quando usar |
|---|---|---|---|
| Smooth out | `power3.out` | `cubic-bezier(0.33, 1, 0.68, 1)` | Entrada de elementos |
| Bouncy | `back.out(1.7)` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | CTAs, badges |
| Elastic | `elastic.out(1, 0.3)` | — | Notificações, toasts |
| Linear scrub | `none` | `linear` | Scroll-driven (scrub) |
| Snappy | `power4.out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Text reveals |
| Cinematic | `expo.out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero sections |

---

## 📋 9. Checklist Antes de Commitar

- [ ] Todo `gsap.context()` tem `.revert()` no cleanup do `useEffect`
- [ ] Nenhum `ScrollTrigger` órfão (sem cleanup)
- [ ] `prefers-reduced-motion` respeitado
- [ ] Apenas `transform` e `opacity` animados (zero reflow)
- [ ] `ScrollTrigger.refresh()` chamado após carregamento de dados async
- [ ] Animações testadas em mobile (60fps no Chrome DevTools Performance)
- [ ] `AnimatePresence` com `mode="wait"` para transições de tab
- [ ] Nenhum GSAP e Framer Motion no mesmo elemento DOM
- [ ] Textos envolvidos com `t(...)` do `useI18n()`
