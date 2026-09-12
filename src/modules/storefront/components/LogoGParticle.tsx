import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type GearPart = 'tooth' | 'ring' | 'g'

type Particle = {
  ox: number; oy: number
  x: number; y: number
  tx: number; ty: number
  baseAng: number
  rad: number
  dist: number
  gearPart: GearPart
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
const METAL_TOP = hexToRgb('#FFFFFF')
const METAL_MID1 = hexToRgb('#C8D4E8')
const METAL_MID2 = hexToRgb('#90A0B8')

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
  const baseTxRef = useRef<Map<Particle, {x:number,y:number}>>(new Map())

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

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
      const off = document.createElement('canvas')
      const s = 512
      off.width = s
      off.height = s
      const octx = off.getContext('2d', { willReadFrequently: true })!
      octx.clearRect(0,0,s,s)
      octx.drawImage(img, 0, 0, s, s)
      const data = octx.getImageData(0,0,s,s).data
      const step = 3 // gear teeth need finer 12x13 rect
      const cx = s/2, cy = s/2
      const newParticles: Particle[] = []
      for (let y = 0; y < s; y += step) {
        for (let x = 0; x < s; x += step) {
          const idx = (y * s + x) * 4
          const a = data[idx + 3]
          if (a > 18) {
            const scale = Math.min(w, h) * 0.82 / s
            const ox = w/2 + (x - cx) * scale
            const oy = h/2 + (y - cy) * scale
            const dx = x - cx, dy = y - cy
            const dist = Math.sqrt(dx*dx + dy*dy)
            let ang = Math.atan2(dy, dx) * 180 / Math.PI
            if (ang < 0) ang += 360
            // Classify gear part — 12 dentes involute, eficiente
            let gearPart: GearPart = 'g'
            let toothIdx = -1
            let isTooth = false
            const distNorm = dist // 0-~256 for 512
            // Gear com 12 dentes a cada 30°, half width 11° para dente largo (não lâmina)
            if (distNorm >= 165 && distNorm <= 265) {
              for (let k=0;k<12;k++) {
                const center = k*30
                let diff = Math.abs(ang - center)
                if (diff > 180) diff = 360 - diff
                if (diff < 11) { isTooth = true; toothIdx = k; break }
              }
            }
            if (isTooth && distNorm >= 195) gearPart = 'tooth'
            else if (distNorm >= 125 && distNorm < 205) gearPart = 'ring'
            else gearPart = 'g'

            const baseAng = Math.atan2(dy, dx)
            // Dispersed target: dente como cluster sólido (mesmo vetor por dente)
            let tx: number, ty: number
            if (gearPart === 'g') {
              const randAng = Math.random() * Math.PI * 2
              const d = 360 + Math.random()*520
              tx = ox + Math.cos(randAng)*d
              ty = oy + Math.sin(randAng)*d
            } else if (gearPart === 'tooth' && toothIdx >=0) {
              // Dente como cluster sólido: mantém forma do dente ao dispersar
              const PITCH_R = 195
              const toothCenterAng = toothIdx*30 * Math.PI/180
              const toothOut = 560 + (toothIdx%3)*40 // variação por dente
              const toothCx = 256 + Math.cos(toothCenterAng)*PITCH_R
              const toothCy = 256 + Math.sin(toothCenterAng)*PITCH_R
              const relX = (x - toothCx) * scale
              const relY = (y - toothCy) * scale
              const cxDisp = w/2 + Math.cos(toothCenterAng) * (PITCH_R*scale + toothOut)
              const cyDisp = h/2 + Math.sin(toothCenterAng) * (PITCH_R*scale + toothOut)
              tx = cxDisp + relX
              ty = cyDisp + relY
            } else {
              // Anel: dispersão radial simples, mantém ângulo original
              const out = 520 + Math.random()*120
              tx = w/2 + Math.cos(baseAng) * (dist*scale + out)
              ty = h/2 + Math.sin(baseAng) * (dist*scale + out)
            }

            // Color by type + y
            let color: string
            if (gearPart === 'g') {
              const t = y / s
              const r = Math.round(lerp(C1.r, C2.r, t))
              const g = Math.round(lerp(C1.g, C2.g, t))
              const b = Math.round(lerp(C1.b, C2.b, t))
              color = `rgb(${r},${g},${b})`
            } else {
              // Metallic for gear
              const t = (dist - 130) / (265-130)
              let rr, gg, bb
              if (t < 0.33) { rr = lerp(METAL_TOP.r, METAL_MID1.r, t/0.33); gg = lerp(METAL_TOP.g, METAL_MID1.g, t/0.33); bb = lerp(METAL_TOP.b, METAL_MID1.b, t/0.33) }
              else if (t < 0.66) { rr = lerp(METAL_MID1.r, METAL_MID2.r, (t-0.33)/0.33); gg = lerp(METAL_MID1.g, METAL_MID2.g, (t-0.33)/0.33); bb = lerp(METAL_MID1.b, METAL_MID2.b, (t-0.33)/0.33) }
              else { rr = lerp(METAL_MID2.r, METAL_TOP.r, (t-0.66)/0.34); gg = lerp(METAL_MID2.g, METAL_TOP.g, (t-0.66)/0.34); bb = lerp(METAL_MID2.b, METAL_TOP.b, (t-0.66)/0.34) }
              color = `rgb(${Math.round(rr)},${Math.round(gg)},${Math.round(bb)})`
            }

            const p: Particle = {
              ox, oy, x: ox, y: oy, tx, ty,
              baseAng, rad: dist*scale, dist,
              gearPart,
              r: step * 0.65 + Math.random()*0.5,
              color,
              alpha: gearPart === 'tooth' ? 0.95 : 0.88 + Math.random()*0.12,
            }
            newParticles.push(p)
          }
        }
      }
      particles = newParticles
      particlesRef.current = particles
      // Store base targets for mouse nudge (avoid accumulate)
      const m = new Map<Particle, {x:number,y:number}>()
      for (const p of particles) m.set(p, {x: p.tx, y: p.ty})
      baseTxRef.current = m
    }

    const render = () => {
      if (killed || !ctx) return
      ctx.clearRect(0,0,w,h)
      const p = progressRef.current
      // Gear rotation 0-55% = 360deg, then dispersion
      const rotProgress = Math.min(p / 0.55, 1)
      const dispProgress = p < 0.32 ? 0 : (p - 0.32) / 0.68
      const epDisp = dispProgress < 0.5 ? 2*dispProgress*dispProgress : 1 - Math.pow(-2*dispProgress+2,2)/2

      for (const pt of particles) {
        let x: number, y: number, a: number, scale: number
        if (pt.gearPart === 'g') {
          x = lerp(pt.ox, pt.tx, epDisp)
          y = lerp(pt.oy, pt.ty, epDisp)
          a = 1 - epDisp * 0.96
          scale = 1 - epDisp*0.35
        } else {
          // Rotate around center then disperse
          const rotAng = pt.baseAng + rotProgress * Math.PI * 2
          const cx = w/2, cy = h/2
          const rotX = cx + Math.cos(rotAng) * pt.rad
          const rotY = cy + Math.sin(rotAng) * pt.rad
          // After rotation, continue outward
          const d = epDisp
          // For teeth/ring, dispersal is radial outward from center, keep rotation
          const outX = cx + Math.cos(rotAng) * (pt.rad + d*600)
          const outY = cy + Math.sin(rotAng) * (pt.rad + d*520)
          // Blend: before 55% stay rotated, after blend to out
          if (p < 0.55) { x = rotX; y = rotY; a = 1; scale = 1 }
          else {
            const t = (p - 0.55)/0.45
            const et = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2
            x = lerp(rotX, outX, et)
            y = lerp(rotY, outY, et)
            a = 1 - et*0.97
            scale = 1 - et*0.4
          }
        }
        const r = pt.r * scale
        ctx.globalAlpha = Math.max(0, a) * pt.alpha
        ctx.fillStyle = pt.color
        ctx.shadowColor = pt.color
        ctx.shadowBlur = pt.gearPart === 'tooth' ? 10 * (1 - epDisp*0.6) : 8 * (1 - epDisp*0.5)
        ctx.beginPath()
        ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI*2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(render)
    }

    const onLoad = () => {
      initParticles()
      render()
      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=200%',
        scrub: 1.1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: self => { progressRef.current = self.progress },
      })
      // Mouse nudge (no accumulate)
      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2
        const p = progressRef.current
        if (p > 0.18 && p < 0.88) {
          for (const pt of particles) {
            const base = baseTxRef.current.get(pt)
            if (!base) continue
            pt.tx = base.x + mx * 14
            pt.ty = base.y + my * 14
          }
        }
      }
      window.addEventListener('mousemove', onMove)
      const onResize = () => {
        resize()
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
      const off = document.createElement('canvas')
      off.width = 512; off.height = 512
      const octx = off.getContext('2d')!
      octx.fillStyle = 'white'
      octx.font = '700 380px Sora, sans-serif'
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      octx.fillText('G', 256, 256)
      img.src = off.toDataURL()
      setTimeout(onLoad, 100)
    }

    return () => {
      killed = true
      cancelAnimationFrame(rafRef.current)
      ScrollTrigger.getAll().forEach(st => { if (st.trigger === container) st.kill() })
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
        minHeight: 520,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(112,0,255,0.09), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,229,255,0.07), transparent 55%)',
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(2,6,23,0.55) 100%)' }} />
    </div>
  )
}
