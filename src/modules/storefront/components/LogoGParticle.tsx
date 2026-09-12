import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Particle = {
  ox: number; oy: number
  x: number; y: number
  tx: number; ty: number
  r: number
  color: string
  alpha: number
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function hexToRgb(hex: string) {
  const h = hex.replace('#','')
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) }
}
const C1 = hexToRgb('#00E5FF')
const C2 = hexToRgb('#7000FF')

export const LogoGParticle: React.FC<{ src?: string; className?: string; style?: React.CSSProperties }> = ({
  src = '/presentation/logo-g.png',
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const progressRef = useRef(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // fallback to static img handled via CSS

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let w = container.clientWidth
    let h = container.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      if (!container || !canvas) return
      w = container.clientWidth
      h = container.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    let particles: Particle[] = []
    let killed = false

    const initParticles = () => {
      // Offscreen canvas to sample alpha
      const off = document.createElement('canvas')
      const s = 512
      off.width = s
      off.height = s
      const octx = off.getContext('2d', { willReadFrequently: true })!
      octx.clearRect(0,0,s,s)
      // Draw image centered
      const iw = s, ih = s
      octx.drawImage(img, 0, 0, iw, ih)
      const data = octx.getImageData(0,0,s,s).data
      const step = 4 // sampling step
      const newParticles: Particle[] = []
      for (let y = 0; y < s; y += step) {
        for (let x = 0; x < s; x += step) {
          const idx = (y * s + x) * 4
          const a = data[idx + 3]
          if (a > 20) {
            // Map from 512x512 offscreen to container size
            // Keep aspect, center in container
            const scale = Math.min(w, h) * 0.85 / s
            const ox = w/2 + (x - s/2) * scale
            const oy = h/2 + (y - s/2) * scale
            // Random dispersed target
            const ang = Math.random() * Math.PI * 2
            const dist = 300 + Math.random() * 600
            const tx = ox + Math.cos(ang) * dist
            const ty = oy + Math.sin(ang) * dist
            // Color gradient by y (top cyan, bottom purple)
            const t = y / s
            const r = Math.round(lerp(C1.r, C2.r, t))
            const g = Math.round(lerp(C1.g, C2.g, t))
            const b = Math.round(lerp(C1.b, C2.b, t))
            const color = `rgb(${r},${g},${b})`
            newParticles.push({
              ox, oy, x: ox, y: oy, tx, ty,
              r: step * 0.7 + Math.random()*0.6,
              color,
              alpha: 0.85 + Math.random()*0.15,
            })
          }
        }
      }
      particles = newParticles
      particlesRef.current = particles
    }

    const render = () => {
      if (killed || !ctx) return
      ctx.clearRect(0,0,w,h)
      const p = progressRef.current
      // eased progress for more dramatic at end
      const ep = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2,2)/2
      for (const pt of particles) {
        // lerp position
        const x = lerp(pt.ox, pt.tx, ep)
        const y = lerp(pt.oy, pt.ty, ep)
        const a = 1 - ep * 0.95 // fade to 0.05
        const r = pt.r * (1 - ep*0.3)
        ctx.globalAlpha = a * pt.alpha
        ctx.fillStyle = pt.color
        ctx.shadowColor = pt.color
        ctx.shadowBlur = 8 * (1 - ep*0.5)
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI*2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(render)
    }

    const onLoad = () => {
      initParticles()
      render()
      // ScrollTrigger drives progress
      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=140%',
        scrub: 1.2,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: self => {
          progressRef.current = self.progress
        },
      })
      // Mouse subtle deviation
      let mx = 0, my = 0
      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        my = ((e.clientY - rect.top) / rect.height - 0.5) * 2
        // Nudge dispersed particles slightly
        const p = progressRef.current
        if (p > 0.15 && p < 0.85) {
          for (const pt of particles) {
            // only affect particles that are already dispersed a bit
            pt.tx += mx * 0.4
            pt.ty += my * 0.4
          }
        }
      }
      window.addEventListener('mousemove', onMove)

      const onResize = () => {
        resize()
        // re-init to keep centered (simple)
        initParticles()
      }
      window.addEventListener('resize', onResize)

      return () => {
        st.kill()
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('resize', onResize)
      }
    }

    if (img.complete) onLoad()
    else img.onload = onLoad

    img.onerror = () => {
      // fallback: draw G as text
      const off = document.createElement('canvas')
      off.width = 512; off.height = 512
      const octx = off.getContext('2d')!
      octx.fillStyle = 'white'
      octx.font = '700 380px Sora, sans-serif'
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      octx.fillText('G', 256, 256)
      img.src = off.toDataURL()
      // retry
      setTimeout(onLoad, 100)
    }

    return () => {
      killed = true
      cancelAnimationFrame(rafRef.current)
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === container) st.kill()
      })
    }
  }, [src])

  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    return (
      <div ref={containerRef} className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={src} alt="G" style={{ width: '70%', height: '70%', objectFit: 'contain', filter: 'drop-shadow(0 0 24px rgba(0,229,255,0.5))' }} />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 420,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(112,0,255,0.08), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,229,255,0.06), transparent 55%)',
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      {/* Subtle vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(2,6,23,0.55) 100%)' }} />
    </div>
  )
}
