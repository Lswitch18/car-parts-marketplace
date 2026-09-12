import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/modules/shared/lib/gsap'

export function useAnimatedCounter(endValue: number, duration = 2, prefix = '', suffix = '') {
  const ref = useRef<HTMLSpanElement>(null)
  const objRef = useRef({ value: 0 })

  useEffect(() => {
    if (!ref.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      if (ref.current) ref.current.textContent = `${prefix}${Math.round(endValue).toLocaleString('ja-JP')}${suffix}`
      return
    }
    const el = ref.current
    const ctx = gsap.context(() => {
      gsap.to(objRef.current, {
        value: endValue,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) el.textContent = `${prefix}${Math.round(objRef.current.value).toLocaleString('ja-JP')}${suffix}`
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          toggleActions: 'play none none reset',
        },
      })
    })
    return () => ctx.revert()
  }, [endValue, duration, prefix, suffix])

  return ref
}

export function useAnimatedCurrency(endValue: number, duration = 2.2) {
  return useAnimatedCounter(endValue, duration, '¥')
}
