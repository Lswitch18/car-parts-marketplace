import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/modules/shared/lib/gsap'
import { useAnimatedCounter } from '@/modules/storefront/hooks/useAnimatedCounter'

const ZenginSteps = [
  { day: 'T+0', label: 'Checkout', sub: 'Stripe Connect\n¥90 transfer', color: '#00E5FF' },
  { day: 'T+1–4', label: 'Liquidação', sub: 'delay_days:4\nJPY', color: '#7C3AED' },
  { day: 'T+4', label: 'Available', sub: 'Saldo liberado', color: '#10B981' },
  { day: 'T+5', label: 'Banco', sub: 'Zengin depositado', color: '#F59E0B' },
]

export const InvestorMoatSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const gmvRef = useAnimatedCounter(8750000, 2.2, '¥')
  const takeRef = useAnimatedCounter(10, 1.6, '', '%')
  const profitRef = useAnimatedCounter(6, 1.6, '¥', ' / ¥100')

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.moat-card', {
        y: 50, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.moat-grid', start: 'top 82%' }
      })
      gsap.from('.zengin-step', {
        y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: '.zengin-track', start: 'top 85%' }
      })
      // linha Zengin desenha
      gsap.fromTo('.zengin-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: '.zengin-track', start: 'top 80%' } }
      )
    }, ref)
    return () => ctx.revert()
  }, { scope: ref })

  return (
    <section ref={ref} style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.22)', marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', boxShadow: '0 0 8px #7C3AED' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Moat Financeiro & Técnico</span>
        </div>
        <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'white', letterSpacing: -1.2, lineHeight: 1.1 }}>
          Unit economics <span style={{ color: '#00E5FF' }}>comprovado</span> no Zengin
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, maxWidth: 640, margin: '12px auto 0' }}>
          Take rate 10% · Stripe 3.6% · <b style={{ color: 'rgba(255,255,255,0.85)' }}>Lucro líquido ¥6 a cada ¥100</b> · Liquidação T+4 auditada em conta bancária japonesa
        </p>
      </div>

      {/* Cards de valuation */}
      <div className="moat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginBottom: 28 }}>
        <div className="moat-card glass-ultra" style={{ padding: 22, borderRadius: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>GMV Simulado</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}><span ref={gmvRef}>¥0</span></div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Pipeline Stripe Connect 90% repasse</div>
          <div className="neon-pulse" style={{ position: 'absolute', right: 14, top: 14, width: 10, height: 10, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 12px #00E5FF' }} />
        </div>
        <div className="moat-card glass-ultra" style={{ padding: 22, borderRadius: 18 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Take Rate</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}><span ref={takeRef}>0%</span> <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>fixo</span></div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Modelo híbrido marketplace + SaaS ERP</div>
        </div>
        <div className="moat-card glass-ultra" style={{ padding: 22, borderRadius: 18 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Lucro Líquido</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981' }}><span ref={profitRef}>¥0</span></div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Após taxa cartão 3.6%</div>
        </div>
        <div className="moat-card glass-ultra gradient-border" style={{ padding: 22, borderRadius: 18 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Liquidação</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>T+4</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Stripe Japan · delay_days:4 · Zengin Network</div>
        </div>
      </div>

      {/* Timeline Zengin */}
      <div className="zengin-track" style={{ position: 'relative', padding: '18px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div className="zengin-line" style={{ position: 'absolute', top: 46, left: 24, right: 24, height: 2, background: 'linear-gradient(90deg,#00E5FF,#7C3AED,#10B981,#F59E0B)', transformOrigin: 'left', opacity: 0.6 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, position: 'relative' }}>
          {ZenginSteps.map(s => (
            <div key={s.day} className="zengin-step" style={{ textAlign: 'center', padding: 12 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: s.color, margin: '0 auto 12px', boxShadow: `0 0 14px ${s.color}90`, border: '2px solid rgba(255,255,255,0.9)' }} />
              <div style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>{s.day}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', whiteSpace: 'pre-line', marginTop: 4, lineHeight: 1.4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.18)', color: 'rgba(255,255,255,0.6)' }}>stripe.transfers.create → tr_…</span>
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 100, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: 'rgba(255,255,255,0.6)' }}>saldo: pending → available</span>
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)', color: 'rgba(255,255,255,0.6)' }}>Depósito físico T+5</span>
        </div>
      </div>

      {/* Compliance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, marginTop: 14 }}>
        {[
          { k: 'JCT 10%', v: 'Recibo com taxa discriminada', c: '#00E5FF' },
          { k: 'Tekikaku Seikyusho', v: 'Fatura Invoice PJ (KK/GK)', c: '#7C3AED' },
          { k: 'Kobutsu-sho / Kaitai-gyo', v: 'Verificação de licença no onboarding', c: '#F59E0B' },
        ].map(x => (
          <div key={x.k} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${x.c}18`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: x.c, flexShrink: 0 }} />
            <div><div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{x.k}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{x.v}</div></div>
          </div>
        ))}
      </div>
    </section>
  )
}
