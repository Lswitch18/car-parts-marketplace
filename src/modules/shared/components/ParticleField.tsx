import { useRef, useEffect, useCallback } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number
  alpha: number; life: number; maxLife: number; color: string
}

const COLORS = ['#0D75FF', '#00E5FF', '#7000FF', '#4d9cff', '#00D97E']
const PARTICLE_COUNT = 80
const CONNECTION_DIST = 120

export default function ParticleField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)

  const initParticle = useCallback((w: number, h: number): Particle => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5 - 0.15,
    size: Math.random() * 2.5 + 1,
    alpha: Math.random() * 0.5 + 0.2,
    life: 0,
    maxLife: Math.random() * 300 + 200,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.clientWidth
    let h = canvas.clientHeight
    canvas.width = w
    canvas.height = h

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => initParticle(w, h))

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    const handleResize = () => {
      w = canvas!.clientWidth
      h = canvas!.clientHeight
      canvas!.width = w
      canvas!.height = h
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('resize', handleResize)

    const animate = () => {
      ctx!.clearRect(0, 0, w, h)
      const particles = particlesRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.life++

        if (p.life > p.maxLife) {
          Object.assign(p, initParticle(w, h))
          p.life = 0
        }

        // Mouse repulsion
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 0.8
          p.vx += (dx / dist) * force * 0.03
          p.vy += (dy / dist) * force * 0.03
        }

        // Damping
        p.vx *= 0.99
        p.vy *= 0.99

        p.x += p.vx
        p.y += p.vy

        // Wrap
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20

        // Draw particle
        const lifeRatio = p.life / p.maxLife
        const fadeAlpha = p.alpha * (1 - lifeRatio)
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = fadeAlpha * 0.7
        ctx!.fill()

        // Glow
        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        grad.addColorStop(0, p.color + '30')
        grad.addColorStop(1, 'transparent')
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx!.fillStyle = grad
        ctx!.globalAlpha = fadeAlpha * 0.3
        ctx!.fill()

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const cdx = p.x - q.x
          const cdy = p.y - q.y
          const cd = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cd < CONNECTION_DIST) {
            const a = (1 - cd / CONNECTION_DIST) * 0.12
            ctx!.beginPath()
            ctx!.moveTo(p.x, p.y)
            ctx!.lineTo(q.x, q.y)
            ctx!.strokeStyle = '#0D75FF'
            ctx!.globalAlpha = a
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }

      ctx!.globalAlpha = 1
      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', handleResize)
    }
  }, [initParticle])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
      aria-hidden
    />
  )
}
