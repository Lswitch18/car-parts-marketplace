/**
 * ═══════════════════════════════════════════════════════════
 *  GSAP ScrollTrigger + Animated Counter Hooks
 *  Uso: páginas SaaS multitenant, dashboards com KPIs
 * ═══════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

// Registrar plugins uma vez no nível do módulo
gsap.registerPlugin(ScrollTrigger, TextPlugin)

// ─── 1. useGsapContext ─────────────────────────────────────
// Cria um gsap.context() com cleanup automático
export function useGsapContext(
  animationFn: (gsapCtx: gsap.Context) => void,
  deps: any[] = []
) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      animationFn(ctx)
    }, containerRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return containerRef
}

// ─── 2. useStaggerReveal ────────────────────────────────────
// Revela múltiplos elementos com delay escalonado ao scrollar
export function useStaggerReveal(
  selector: string,
  options?: {
    y?: number
    scale?: number
    duration?: number
    stagger?: number
    start?: string
  }
) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const {
      y = 60,
      scale = 0.95,
      duration = 0.7,
      stagger = 0.1,
      start = 'top 85%',
    } = options || {}

    const ctx = gsap.context(() => {
      gsap.from(selector, {
        y,
        opacity: 0,
        scale,
        duration,
        ease: 'power3.out',
        stagger: { each: stagger, from: 'start' },
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          toggleActions: 'play none none reverse',
        },
      })
    }, containerRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector])

  return containerRef
}

// ─── 3. useAnimatedCounter ──────────────────────────────────
// Counter que sobe de 0 até o valor alvo quando entra no viewport
export function useAnimatedCounter(
  endValue: number,
  options?: {
    duration?: number
    prefix?: string
    suffix?: string
    decimals?: number
  }
) {
  const ref = useRef<HTMLSpanElement>(null)
  const counterObj = useRef({ value: 0 })

  const {
    duration = 2,
    prefix = '',
    suffix = '',
    decimals = 0,
  } = options || {}

  useEffect(() => {
    if (!ref.current) return
    counterObj.current.value = 0

    const ctx = gsap.context(() => {
      gsap.to(counterObj.current, {
        value: endValue,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) {
            const formatted = decimals > 0
              ? counterObj.current.value.toFixed(decimals)
              : Math.round(counterObj.current.value).toLocaleString()
            ref.current.textContent = `${prefix}${formatted}${suffix}`
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
  }, [endValue, duration, prefix, suffix, decimals])

  return ref
}

// ─── 4. useParallax ─────────────────────────────────────────
// Efeito parallax simples controlado por scroll
export function useParallax(speed: number = -30) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: speed,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    })

    return () => ctx.revert()
  }, [speed])

  return ref
}

// ─── 5. useTextReveal ───────────────────────────────────────
// Revela texto palavra por palavra com máscara de overflow
export function useTextReveal(options?: { stagger?: number; duration?: number }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const text = el.textContent || ''
    const words = text.split(' ')

    el.innerHTML = words
      .map(
        (word) =>
          `<span style="display:inline-block;overflow:hidden;vertical-align:bottom"><span class="gsap-reveal-word" style="display:inline-block">${word}</span></span>`
      )
      .join(' ')

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.gsap-reveal-word'), {
        yPercent: 110,
        opacity: 0,
        duration: options?.duration || 0.7,
        ease: 'power4.out',
        stagger: options?.stagger || 0.04,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => ctx.revert()
  }, [options?.stagger, options?.duration])

  return ref
}

// ─── 6. useScrollProgress ───────────────────────────────────
// Retorna ref + progresso do scroll (0→1) de uma seção
export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          progressRef.current = self.progress
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return { ref, progress: progressRef }
}

// ─── 7. refreshScrollTrigger ────────────────────────────────
// Utility para chamar após dados async carregarem
export function refreshScrollTrigger() {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
}
