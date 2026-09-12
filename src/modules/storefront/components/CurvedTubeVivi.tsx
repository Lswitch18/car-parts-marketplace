import React, { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/modules/shared/lib/gsap'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

const ViviDot: React.FC<{ index: number; scrollYProgress: MotionValue<number> }> = ({ index, scrollYProgress }) => {
  const offset = (index * 0.05) % 1
  const offsetDistance = useTransform(scrollYProgress, [0, 1], [`${offset * 100}%`, `${(offset + 1.2) * 100}%`])
  return (
    <motion.circle
      r={5 + (index % 3) * 1.5}
      fill={index % 2 === 0 ? '#00E5FF' : '#FFFFFF'}
      stroke="rgba(0,229,255,0.25)"
      strokeWidth={1}
      style={{
        offsetPath: 'path("M 80 0 C 180 80, 320 180, 200 300 C 80 420, 320 520, 200 640 C 80 760, 180 800, 200 800")',
        offsetDistance: offsetDistance as unknown as string,
        filter: 'drop-shadow(0 0 6px currentColor)',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
    />
  )
}

export const CurvedTubeVivi: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [count, setCount] = useState(0)
  const [vivis, setVivis] = useState<number[]>(() => Array.from({ length: 20 }, (_, i) => i))
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])

  // GSAP for tube draw (professional pin + scrub)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return
    const tube = svg.querySelector('#tubeStroke') as SVGPathElement
    if (!tube) return
    const path = svg.querySelector('#tubePath') as SVGPathElement
    if (!path) return
    const len = path.getTotalLength()
    gsap.set(tube, { strokeDasharray: len, strokeDashoffset: len })
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1.2,
      },
    })
    tl.to(tube, { strokeDashoffset: 0, duration: 1, ease: 'none' })
    // Glow pulse (GSAP)
    gsap.to(tube, {
      filter: 'drop-shadow(0 0 14px rgba(0,229,255,0.7))',
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(st => { if (st.trigger === container) st.kill() })
    }
  }, [])

  // Infinite vivis: quando um passa do fim, recicla e incrementa contador
  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => {
      // Conta vivis passando por 50%
      const total = 20
      const progressPerDot = 1 / total
      const activeIdx = Math.floor(v / progressPerDot) % total
      // Simula contagem infinita: a cada 5% de scroll, um novo vivi
      const newCount = Math.floor(v * 40)
      if (newCount !== count) setCount(newCount)
    })
    return () => unsub()
  }, [scrollYProgress, count])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '140vh',
        minHeight: 700,
        overflow: 'visible',
        background: 'transparent',
        zIndex: 1,
      }}
    >
      {/* Counter com Framer Motion */}
      <motion.div
        className="vivi-counter"
        style={{ position: 'sticky', top: 24, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', pointerEvents: 'none' }}
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 100, background: 'rgba(6,8,15,0.85)', border: '1px solid rgba(0,229,255,0.2)', backdropFilter: 'blur(12px)' }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>{count} VIVIS</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>curva infinita</span>
        </div>
      </motion.div>

      <svg ref={svgRef} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="tubeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.95} />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.95} />
          </linearGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation={4} result="c" />
            <feMerge><feMergeNode in="c" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path id="tubeBg" d="M 80 0 C 180 80, 320 180, 200 300 C 80 420, 320 520, 200 640 C 80 760, 180 800, 200 800" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={22} strokeLinecap="round" />
        <motion.path
          id="tubeStroke"
          d="M 80 0 C 180 80, 320 180, 200 300 C 80 420, 320 520, 200 640 C 80 760, 180 800, 200 800"
          fill="none"
          stroke="url(#tubeGrad2)"
          strokeWidth={10}
          strokeLinecap="round"
          filter="url(#glow2)"
          style={{ pathLength }}
          opacity={0.95}
        />
        <path id="tubePath" d="M 80 0 C 180 80, 320 180, 200 300 C 80 420, 320 520, 200 640 C 80 760, 180 800, 200 800" fill="none" stroke="none" />

        {/* Vivis infinitos — Framer Motion por scroll (GSAP + Motion) */}
        {vivis.map(i => (
          <ViviDot key={i} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </svg>
    </div>
  )
}
