import React, { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/modules/shared/lib/gsap'

// Simple 2D noise (hash based) — suficiente para movimento orgânico sem lib externa
function hash(n: number) {
  return Math.sin(n * 127.1 + 311.7) * 43758.5453 % 1
}
function noise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const a = hash(ix + iy * 57)
  const b = hash(ix + 1 + iy * 57)
  const c = hash(ix + (iy + 1) * 57)
  const d = hash(ix + 1 + (iy + 1) * 57)
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  return a * (1 - ux) + b * ux + (c - a) * uy * (1 - ux) + (d - b) * ux * uy
}

type Particle = {
  x: number; y: number; z: number
  ox: number; oy: number
  vx: number; vy: number
  size: number; baseSize: number
  opacity: number; baseOpacity: number
  brightness: number
  life: number; maxLife: number
  layer: number // 0 bg,1 mid,2 logo,3 fg,4 glow
  hue: number
  speed: number
}

export const ParticleField: React.FC<{ logoSrc?: string }> = ({ logoSrc = '/presentation/logo-g.png' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const logoImg = logoRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d', { alpha: true }) as CanvasRenderingContext2D
    if (!ctx) return

    let w = container.clientWidth || window.innerWidth
    let h = container.clientHeight || window.innerHeight * 0.85
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    const resize = () => {
      const cw = container.clientWidth || container.getBoundingClientRect().width || window.innerWidth
      const ch = container.clientHeight || container.getBoundingClientRect().height || 520
      if (cw === 0 || ch === 0) return
      w = cw; h = ch
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const ro = new ResizeObserver(() => { resize(); ScrollTrigger.refresh() })
    ro.observe(container)
    const hero = document.querySelector('.hero-section')
    if (hero) ro.observe(hero)

    // Logo image for sampling (for logo particles layer)
    const logo = new Image()
    logo.crossOrigin = 'anonymous'
    logo.src = logoSrc
    let logoReady = false
    logo.onload = () => { logoReady = true }

    const particles: Particle[] = []
    const total = Math.min(380, Math.floor((w * h) / 2200)) // ~380 em 1920x800, adapta
    const cx = () => w / 2
    const cy = () => h / 2

    const init = () => {
      particles.length = 0
      // Sample logo for logo layer (20% das partículas)
      let logoData: ImageData | null = null
      if (logoReady) {
        const off = document.createElement('canvas')
        off.width = 256; off.height = 256
        const octx = off.getContext('2d', { willReadFrequently: true })!
        octx.drawImage(logo, 0, 0, 256, 256)
        logoData = octx.getImageData(0, 0, 256, 256)
      }
      for (let i = 0; i < total; i++) {
        // Distribuição 70/20/8/2
        const rDist = Math.random()
        let layer: number, size: number, brightness: number
        if (rDist < 0.70) { layer = 0; size = 0.7 + Math.random() * 0.9; brightness = 0.5 + Math.random() * 0.3 }
        else if (rDist < 0.90) { layer = 1; size = 1.4 + Math.random() * 1.1; brightness = 0.65 + Math.random() * 0.25 }
        else if (rDist < 0.98) { layer = 2; size = 2.2 + Math.random() * 1.6; brightness = 0.8 + Math.random() * 0.2 }
        else { layer = 3; size = 3.2 + Math.random() * 2.5; brightness = 1.0 }

        // Z depth 0-1
        const z = Math.random()
        const depthScale = 0.6 + z * 0.8 // próximas maiores/brilhantes
        const finalSize = size * depthScale
        const finalOpacity = (0.35 + z * 0.45) * (layer === 3 ? 0.85 : 1) * brightness

        // Posição: 60% ao redor do logo (atração), 40% dispersas
        let x: number, y: number, ox: number, oy: number
        if (logoData && Math.random() < 0.58) {
          // Amostra ponto do logo (onde alpha>20) para concentração luminosa central
          let tries = 0, lx = 0, ly = 0
          while (tries < 20) {
            lx = Math.floor(Math.random() * 256); ly = Math.floor(Math.random() * 256)
            const a = logoData.data[(ly * 256 + lx) * 4 + 3]
            if (a > 18) break
            tries++
          }
          const scale = Math.min(w, h) * 0.52 / 256
          ox = cx() + (lx - 128) * scale
          oy = cy() + (ly - 128) * scale
          // Dispersa levemente ao redor do logo
          x = ox + (Math.random() - 0.5) * 18
          y = oy + (Math.random() - 0.5) * 18
        } else {
          // Dispersa no campo, mais densa no centro (gradiente radial)
          const ang = Math.random() * Math.PI * 2
          const rad = Math.pow(Math.random(), 1.6) * Math.max(w, h) * 0.62
          x = cx() + Math.cos(ang) * rad
          y = cy() + Math.sin(ang) * rad
          ox = x; oy = y
        }

        particles.push({
          x, y, z, ox, oy,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: finalSize, baseSize: finalSize,
          opacity: finalOpacity, baseOpacity: finalOpacity,
          brightness,
          life: Math.random() * 100,
          maxLife: 80 + Math.random() * 120,
          layer,
          hue: Math.random() < 0.65 ? 195 : 275, // ciano 70% / roxo 30%
          speed: 0.3 + z * 0.9 + layer * 0.15,
        })
      }
    }

    let raf = 0
    let killed = false
    const render = () => {
      if (killed || !ctx) return
      ctx.clearRect(0, 0, w, h)

      const p = progressRef.current // 0→1 scroll
      const t = performance.now() * 0.001

      // Campo de luz atrás do logo (glow radial)
      const glowGrad = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), Math.min(w, h) * 0.42)
      glowGrad.addColorStop(0, `rgba(0,229,255,${0.10 * (1 - p * 0.5)})`)
      glowGrad.addColorStop(0.35, `rgba(112,0,255,${0.06 * (1 - p * 0.4)})`)
      glowGrad.addColorStop(1, 'rgba(2,6,23,0)')
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, w, h)

      // Ordena por z para profundidade (distantes primeiro)
      particles.sort((a, b) => a.z - b.z)

      for (const pt of particles) {
        // Vida
        pt.life += pt.speed * 0.6
        if (pt.life > pt.maxLife) pt.life = 0

        // Noise procedural para movimento orgânico (fumaça/energia)
        const nx = noise(pt.x * 0.003 + t * 0.15, pt.y * 0.003 + t * 0.12) - 0.5
        const ny = noise(pt.y * 0.003 - t * 0.13, pt.x * 0.003 + t * 0.14) - 0.5

        // Atração ao logo quando p <0.4, repulsão/dispersão quando p>0.4
        const dx = cx() - pt.x
        const dy = cy() - pt.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
        const attract = p < 0.4 ? (0.4 - p) * 0.08 : 0
        const repel = p > 0.4 ? (p - 0.4) * 0.09 : 0
        const ax = (dx / dist) * attract
        const ay = (dy / dist) * attract
        const rx = (dx / dist) * -repel
        const ry = (dy / dist) * -repel

        pt.vx = pt.vx * 0.96 + nx * 0.18 + ax + rx
        pt.vy = pt.vy * 0.96 + ny * 0.18 + ay + ry
        pt.x += pt.vx
        pt.y += pt.vy

        // Rotação sutil por camada
        const rot = pt.layer * 0.002 * p

        // Profundidade: tamanho/opacidade por z + scroll
        const depthAlpha = pt.baseOpacity * (0.7 + Math.sin(t * 0.4 + pt.life * 0.02) * 0.15)
        const a = depthAlpha * (1 - p * 0.35) * (pt.layer === 3 ? 0.9 : 1)
        const s = pt.baseSize * (1 + Math.sin(t * 0.5 + pt.x * 0.01) * 0.08) * (1 + pt.layer * 0.08)

        // Cor ciano/branco com variação por hue
        const isCyan = pt.hue === 195
        const col = isCyan ? `rgba(0,229,255,${a})` : `rgba(255,255,255,${a * 0.9})`
        const glowCol = isCyan ? 'rgba(0,229,255,0.9)' : 'rgba(112,0,255,0.7)'

        // Bloom/glow por camada
        const glowInt = pt.layer === 3 ? 14 : pt.layer === 2 ? 10 : pt.layer === 1 ? 6 : 3
        if (glowInt > 3) {
          ctx.shadowColor = glowCol
          ctx.shadowBlur = glowInt * (0.7 + Math.sin(t * 0.3 + pt.life) * 0.2)
        } else {
          ctx.shadowBlur = 0
        }

        // Frente passa na frente do logo (z>0.7)
        ctx.globalAlpha = Math.max(0, Math.min(1, a))
        ctx.fillStyle = col
        ctx.beginPath()
        // Leve rotação por camada
        ctx.ellipse(pt.x, pt.y, s, s * (0.9 + rot * 2), rot, 0, Math.PI * 2)
        ctx.fill()

        // Partículas muito luminosas (2%) com halo extra
        if (pt.layer === 3 && pt.brightness > 0.98) {
          ctx.globalAlpha = a * 0.25
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, s * 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(render)
    }

    const onLoad = () => {
      resize()
      init()
      render()
      // GSAP timeline global (intro → logo reveal → attraction → dispersion)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=220%',
          scrub: 1.1,
          pin: true,
          anticipatePin: 1,
          onUpdate: self => { progressRef.current = self.progress },
        },
      })
      tl.fromTo(container, { opacity: 0.85 }, { opacity: 1, duration: 0.2 }, 0)
      // Logo aparece junto com partículas (via progress)
      const logoEl = container.querySelector('.particle-logo') as HTMLElement | null
      if (logoEl) {
        tl.fromTo(logoEl, { opacity: 0.55, scale: 0.92, filter: 'blur(6px)' }, { opacity: 0.78, scale: 1, filter: 'blur(0px)', duration: 0.6 }, 0)
        tl.to(logoEl, { opacity: 0.32, scale: 1.04, filter: 'blur(2px)', duration: 0.8 }, 0.6)
      }
      // Mouse repulsão sutil
      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        const mx = e.clientX - rect.left, my = e.clientY - rect.top
        for (const pt of particles) {
          const dx = pt.x - mx, dy = pt.y - my
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            const f = (110 - d) / 110
            pt.vx += (dx / d) * f * 0.9
            pt.vy += (dy / d) * f * 0.9
          }
        }
      }
      window.addEventListener('mousemove', onMove)
      // @ts-ignore
      tl._onMove = onMove
    }

    let logoTries = 0
    const tryInit = () => {
      if (logo.complete && logo.naturalWidth > 0) onLoad()
      else if (logoTries++ < 40) setTimeout(tryInit, 80)
      else onLoad()
    }
    tryInit()

    // Fallback se logo falhar
    logo.onerror = () => {
      logoReady = false
      onLoad()
    }

    // Refresh para visível no load
    requestAnimationFrame(() => ScrollTrigger.refresh())
    setTimeout(() => ScrollTrigger.refresh(), 160)

    return () => {
      killed = true
      cancelAnimationFrame(raf)
      try { ro.disconnect() } catch {}
      const tl = (onLoad as unknown as { _onMove?: unknown })._onMove as unknown as (() => void) | undefined
      if (tl) window.removeEventListener('mousemove', tl as unknown as EventListener)
      ScrollTrigger.getAll().forEach(st => { if (st.trigger === container) st.kill() })
    }
  }, [logoSrc])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: 560,
        overflow: 'hidden',
        background: '#020617',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
      {/* Logo integrado — não atrás, mas no meio do campo */}
      <img
        ref={logoRef}
        src={logoSrc}
        alt="DAIG"
        className="particle-logo"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(38vw, 320px)',
          height: 'auto',
          opacity: 0.78,
          filter: 'drop-shadow(0 0 28px rgba(0,229,255,0.35)) blur(0px)',
          pointerEvents: 'none',
          zIndex: 1,
          willChange: 'transform, opacity, filter',
        }}
        loading="eager"
        decoding="async"
      />
      {/* Vignette + bloom base */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(2,6,23,0.72) 100%)', zIndex: 2 }} />
    </div>
  )
}
