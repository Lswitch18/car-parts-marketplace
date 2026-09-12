import React, { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/modules/shared/lib/gsap'

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
  const [isInView, setIsInView] = React.useState(false)
  const [isHighQuality, setIsHighQuality] = React.useState(false)

  // Lazy loading: só inicia canvas quando entra na viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          // Pré-carrega HQ após entrar na viewport
          setTimeout(() => setIsHighQuality(true), 300)
          io.disconnect()
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let w = container.clientWidth || window.innerWidth
    let h = container.clientHeight || window.innerHeight * 0.7
    if (w === 0 || h === 0) {
      const rect = container.getBoundingClientRect()
      w = rect.width || window.innerWidth * 0.7
      h = rect.height || window.innerHeight * 0.7
    }
    // Performático: cap dpr 1.5 e desativa em low-power
    const isLowPower = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      if (!container || !canvas) return
      const cw = container.clientWidth || container.getBoundingClientRect().width
      const ch = container.clientHeight || container.getBoundingClientRect().height
      if (cw === 0 || ch === 0) return
      w = cw; h = ch
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    // Observe container size (hero flex + pin spacer)
    const ro = new ResizeObserver(() => {
      resize()
      initParticles()
      ScrollTrigger.refresh()
    })
    ro.observe(container)
    // Also observe hero section for pin spacer changes
    const hero = document.querySelector('.hero-section')
    if (hero) ro.observe(hero)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    let particles: Particle[] = []
    let killed = false

    const initParticles = () => {
      if (w === 0 || h === 0) { resize(); if (w===0||h===0) return }
      const off = document.createElement('canvas')
      const s = 1024 // alta qualidade: usa logo-g.png 1024 nativo
      off.width = s
      off.height = s
      const octx = off.getContext('2d', { willReadFrequently: true })!
      octx.clearRect(0,0,s,s)
      octx.drawImage(img, 0, 0, s, s)
      const data = octx.getImageData(0,0,s,s).data
      const step = 2 // alta qualidade: 1024/2=512 → ~18K partículas nítidas, gear dente perfeito
      const cx = s/2, cy = s/2
      const newParticles: Particle[] = []
      for (let y = 0; y < s; y += step) {
        for (let x = 0; x < s; x += step) {
          const idx = (y * s + x) * 4
          const a = data[idx + 3]
          if (a > 16) {
            const scale = Math.min(w, h) * 0.984 / s // 20% maior (0.82*1.2)
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
            // Gear 12 dentes, half 9° tip / 10° base — espaçamento maior (gap 12° na ponta)
            if (distNorm >= 165 && distNorm <= 265) {
              const half = distNorm >= 210 ? 7 : 9
              for (let k=0;k<12;k++) {
                const center = k*30
                let diff = Math.abs(ang - center)
                if (diff > 180) diff = 360 - diff
                if (diff < half) { isTooth = true; toothIdx = k; break }
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

    let startTime = performance.now()
    const render = () => {
      if (killed || !ctx) return
      ctx.clearRect(0,0,w,h)
      const p = progressRef.current
      // Idle antes do scroll: rotação lenta + respiração + float
      const t = (performance.now() - startTime) * 0.001
      const idleAmp = (1 - Math.min(p*8, 1)) // some rápido quando começa a scrollar
      const idleRot = Math.sin(t*0.35) * 0.035 * idleAmp // ±2deg
      const idleScale = 1 + Math.sin(t*0.45) * 0.012 * idleAmp
      const idleFloatY = Math.sin(t*0.6) * 4 * idleAmp
      // Aplica idle global antes de desenhar partículas
      ctx.save()
      ctx.translate(w/2, h/2 + idleFloatY)
      ctx.rotate(idleRot)
      ctx.scale(idleScale, idleScale)
      ctx.translate(-w/2, -h/2)
      // Gear rotation 0-55% = 360deg, then dispersion
      const rotProgress = Math.min(p / 0.55, 1)
      const dispProgress = p < 0.32 ? 0 : (p - 0.32) / 0.68
      const epDisp = dispProgress < 0.5 ? 2*dispProgress*dispProgress : 1 - Math.pow(-2*dispProgress+2,2)/2

      for (const pt of particles) {
        let x: number, y: number, a: number, scale: number
        // Ondulação inicial (antes do scroll) — wave radial por ângulo
        const waveAmp = 7 * idleAmp
        const wave = Math.sin(pt.baseAng*3 + t*1.7) * waveAmp * (pt.gearPart === 'g' ? 0.6 : 1)
        const waveX = Math.cos(pt.baseAng) * wave
        const waveY = Math.sin(pt.baseAng) * wave
        if (pt.gearPart === 'g') {
          x = lerp(pt.ox, pt.tx, epDisp) + waveX * (1 - epDisp)
          y = lerp(pt.oy, pt.ty, epDisp) + waveY * (1 - epDisp)
          a = 1 - epDisp * 0.96
          scale = 1 - epDisp*0.35
        } else {
          // Gira 720° (2 voltas) antes de desfragmentar — mais teatral e visível
          const rotAng = pt.baseAng + rotProgress * Math.PI * 4
          const cx = w/2, cy = h/2
          const rotX = cx + Math.cos(rotAng) * pt.rad + waveX * (1 - epDisp)
          const rotY = cy + Math.sin(rotAng) * pt.rad + waveY * (1 - epDisp)
          const d = epDisp
          const outX = cx + Math.cos(rotAng) * (pt.rad + d*600) + waveX * (1 - d)
          const outY = cy + Math.sin(rotAng) * (pt.rad + d*520) + waveY * (1 - d)
          if (p < 0.55) { x = rotX; y = rotY; a = 1; scale = 1 }
          else {
            const tt = (p - 0.55)/0.45
            const et = tt < 0.5 ? 2*tt*tt : 1 - Math.pow(-2*tt+2,2)/2
            x = lerp(rotX, outX, et)
            y = lerp(rotY, outY, et)
            a = 1 - et*0.97
            scale = 1 - et*0.4
          }
        }
        const r = pt.r * scale
        ctx.globalAlpha = Math.max(0, a) * pt.alpha
        ctx.fillStyle = pt.color
        // Alta qualidade: glow mais intenso, sem guard low-power
        ctx.shadowColor = pt.color
        ctx.shadowBlur = pt.gearPart === 'tooth' ? 12 * (1 - epDisp*0.5) : 8 * (1 - epDisp*0.4)
        ctx.beginPath()
        ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI*2)
        ctx.fill()
      }
        ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      ctx.restore()
      rafRef.current = requestAnimationFrame(render)
    }

    const onLoad = () => {
      // Garante medida correta antes de amostrar (visível no load)
      resize()
      initParticles()
      // Se ainda 0 partículas (w/h 0), tenta novamente no próximo frame
      if (particles.length === 0) {
        requestAnimationFrame(() => { resize(); initParticles(); ScrollTrigger.refresh() })
      }
      render()
      // Refresh para pin-spacer medir correto (visível sem precisar scrollar)
      requestAnimationFrame(() => ScrollTrigger.refresh())
      setTimeout(() => ScrollTrigger.refresh(), 120)
      const heroEl2 = document.querySelector('.hero-section') as HTMLElement | null
      const st = ScrollTrigger.create({
        trigger: heroEl2 || container,
        start: 'top top',
        end: '+=130%',
        scrub: 1,
        pin: heroEl2 || container,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: self => { progressRef.current = self.progress },
        onRefresh: self => { progressRef.current = self.progress },
      })
      progressRef.current = 0
      ScrollTrigger.refresh()
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
      try { ro.disconnect() } catch {}
      ScrollTrigger.getAll().forEach(st => { if (st.trigger === container) st.kill() })
    }
  }, [src, isInView])

  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    return (
      <div ref={containerRef} className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={src} alt="G" style={{ width: '70%', height: '70%', objectFit: 'contain', filter: 'drop-shadow(0 0 24px rgba(0,229,255,0.5))' }} />
      </div>
    )
  }

  // Pré-render: mostra imagem estática até entrar na viewport (lazy)
  if (!isInView) {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/presentation/logo-g-pre.png"
          alt="G"
          width={512}
          height={512}
          loading="lazy"
          decoding="async"
          style={{ width: '78%', height: '78%', objectFit: 'contain', filter: 'drop-shadow(0 0 22px rgba(0,229,255,0.45)) blur(0px)', opacity: 0.92 }}
        />
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
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(2,6,23,0.55) 100%)' }} />
    </div>
  )
}
