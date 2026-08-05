/**
 * ═══════════════════════════════════════════════════════════
 *  Exemplo: Seção Hero com animações GSAP premium
 *  Para uso na página SaaS Multitenant Control Center
 * ═══════════════════════════════════════════════════════════
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Building2, Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'

gsap.registerPlugin(ScrollTrigger)

// ─── Animated Grid Background ──────────────────────────────
function AnimatedGridBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()

    const cols = 20
    const rows = 12
    let time = 0

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const cellW = w / cols
      const cellH = h / rows

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * cellW
          const y = j * cellH
          const dist = Math.sqrt((i - cols / 2) ** 2 + (j - rows / 2) ** 2)
          const wave = Math.sin(dist * 0.3 - time * 0.02) * 0.5 + 0.5
          const alpha = wave * 0.08

          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(13, 117, 255, ${alpha})`
          ctx.fill()
        }
      }

      // Grid lines
      ctx.strokeStyle = 'rgba(13, 117, 255, 0.03)'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath()
        ctx.moveTo(i * cellW, 0)
        ctx.lineTo(i * cellW, h)
        ctx.stroke()
      }
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath()
        ctx.moveTo(0, j * cellH)
        ctx.lineTo(w, j * cellH)
        ctx.stroke()
      }

      time++
      animId = requestAnimationFrame(draw)
    }

    draw()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  )
}

// ─── KPI Counter Card ──────────────────────────────────────
function KpiCard({
  label,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  color,
  delay = 0,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: any
  color: string
  delay?: number
}) {
  const counterRef = useRef<HTMLSpanElement>(null)
  const counterObj = useRef({ val: 0 })

  useEffect(() => {
    if (!counterRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(counterObj.current, {
        val: value,
        duration: 2.5,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = `${prefix}${Math.round(counterObj.current.val).toLocaleString()}${suffix}`
          }
        },
        scrollTrigger: {
          trigger: counterRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reset',
        },
      })
    })

    return () => ctx.revert()
  }, [value, prefix, suffix, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative bg-[#0B0E17]/80 border border-blue-500/10 hover:border-blue-500/30 rounded-2xl p-6 backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(13,117,255,0.1)]"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <span
          ref={counterRef}
          className="block text-3xl font-black text-white tracking-tight mb-1"
        >
          {prefix}0{suffix}
        </span>

        <span className="text-sm text-zinc-500 font-medium">{label}</span>
      </div>
    </motion.div>
  )
}

// ─── Main Hero Section ─────────────────────────────────────
export default function SaasHeroSection() {
  const { t } = useI18n()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

    const ctx = gsap.context(() => {
      // Title animation
      const titleTl = gsap.timeline({ delay: 0.3 })

      titleTl
        .from('.hero-badge', {
          y: -20,
          opacity: 0,
          scale: 0.9,
          duration: 0.6,
          ease: 'back.out(1.7)',
        })
        .from('.hero-title-line', {
          y: 80,
          opacity: 0,
          skewY: 3,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.15,
        }, '-=0.2')
        .from('.hero-subtitle', {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
        }, '-=0.4')
        .from('.hero-cta-group', {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
        }, '-=0.3')
        .from('.hero-glow', {
          scale: 0.5,
          opacity: 0,
          duration: 1.5,
          ease: 'power2.out',
        }, '-=1')

      // Parallax on scroll
      gsap.to('.hero-bg-gradient', {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-[#06080F]">
      {/* Background layers */}
      <div className="hero-bg-gradient absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent" />
        <div className="hero-glow absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <AnimatedGridBg />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Badge */}
        <div className="hero-badge flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 w-fit mb-8">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider">
            {t('SaaS Control Center')}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
          <span className="hero-title-line block">
            {t('Gestão')}
            <span className="bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] bg-clip-text text-transparent"> {t('Multitenant')}</span>
          </span>
          <span className="hero-title-line block text-zinc-400">
            {t('para seu SaaS')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-lg text-zinc-500 max-w-xl mb-10 leading-relaxed">
          {t('Monitore tenants, MRR, churn e assinaturas em tempo real. Controle total da sua plataforma.')}
        </p>

        {/* CTA */}
        <div className="hero-cta-group flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-[#0D75FF] to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-[0_0_30px_rgba(13,117,255,0.3)] hover:shadow-[0_0_50px_rgba(13,117,255,0.4)] transition-shadow"
          >
            <Building2 className="w-5 h-5" />
            {t('Ver Tenants')}
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-8 py-4 rounded-xl font-bold text-sm transition-all"
          >
            {t('Relatórios')}
          </motion.button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
          <KpiCard
            label={t('MRR Total')}
            value={247000}
            prefix="¥"
            icon={TrendingUp}
            color="bg-blue-500/10 text-blue-400"
            delay={0}
          />
          <KpiCard
            label={t('Tenants Ativos')}
            value={18}
            icon={Building2}
            color="bg-emerald-500/10 text-emerald-400"
            delay={0.1}
          />
          <KpiCard
            label={t('Usuários')}
            value={342}
            icon={Sparkles}
            color="bg-purple-500/10 text-purple-400"
            delay={0.2}
          />
          <KpiCard
            label={t('Taxa de Churn')}
            value={2.1}
            suffix="%"
            icon={TrendingUp}
            color="bg-amber-500/10 text-amber-400"
            delay={0.3}
          />
        </div>
      </div>
    </div>
  )
}
