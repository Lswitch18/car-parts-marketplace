import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/modules/shared/lib/gsap'
import { ShieldCheck, CreditCard, Landmark, FileCheck2, Lock, CheckCircle2 } from 'lucide-react'

const PaymentSteps = [
  { step: '01', label: 'Pagamento Seguro', sub: 'Processado com criptografia via Stripe', color: '#00E5FF' },
  { step: '02', label: 'Envio Rastreável', sub: 'Vendedor despacha com código de rastreio', color: '#7C3AED' },
  { step: '03', label: 'Entrega Confirmada', sub: 'Comprador valida o recebimento da peça', color: '#10B981' },
  { step: '04', label: 'Repasse Liberado', sub: 'Depósito em conta bancária japonesa (JPY)', color: '#F59E0B' },
]

export const InvestorMoatSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.moat-card', {
        y: 40, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.moat-grid', start: 'top 82%' }
      })
      gsap.from('.step-card', {
        y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: '.step-track', start: 'top 85%' }
      })
      gsap.fromTo('.step-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: '.step-track', start: 'top 80%' } }
      )
    }, ref)
    return () => ctx.revert()
  }, { scope: ref })

  return (
    <section ref={ref} style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 24px', position: 'relative', zIndex: 2 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'white', letterSpacing: -1.2, lineHeight: 1.15 }}>
          Pagamentos e Repasses com Tecnologia <span style={{ color: '#00E5FF' }}>Stripe</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 640, margin: '14px auto 0', lineHeight: 1.6 }}>
          Transações protegidas de ponta a ponta, custódia segura até a entrega e repasses diretos para contas bancárias no Japão.
        </p>
      </div>

      {/* 4 Pilares de Confiança e Segurança */}
      <div className="moat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16, marginBottom: 28 }}>
        <div className="moat-card glass-ultra" style={{ padding: 24, borderRadius: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <CreditCard size={20} color="#00E5FF" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 6 }}>Infraestrutura Global</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Processamento criptografado de ponta a ponta com suporte a múltiplos cartões e carteiras digitais.
          </div>
        </div>

        <div className="moat-card glass-ultra" style={{ padding: 24, borderRadius: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <ShieldCheck size={20} color="#A78BFA" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 6 }}>Custódia Segura</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            O valor fica retido com segurança até que o comprador confirme o recebimento e integridade da peça.
          </div>
        </div>

        <div className="moat-card glass-ultra" style={{ padding: 24, borderRadius: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Landmark size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 6 }}>Repasses em JPY</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Transferências automáticas e previsíveis diretamente para a conta bancária do vendedor no Japão.
          </div>
        </div>

        <div className="moat-card glass-ultra" style={{ padding: 24, borderRadius: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <FileCheck2 size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 6 }}>Faturas & Compliance</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Emissão de faturas oficiais compatíveis com o sistema tributário japonês (Tekikaku Seikyusho).
          </div>
        </div>
      </div>

      {/* Fluxo de Transação Segura */}
      <div className="step-track" style={{ position: 'relative', padding: '24px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div className="step-line" style={{ position: 'absolute', top: 48, left: 32, right: 32, height: 2, background: 'linear-gradient(90deg,#00E5FF,#7C3AED,#10B981,#F59E0B)', transformOrigin: 'left', opacity: 0.5 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, position: 'relative' }}>
          {PaymentSteps.map(s => (
            <div key={s.step} className="step-card" style={{ textAlign: 'center', padding: '10px 8px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: s.color, margin: '0 auto 12px', boxShadow: `0 0 14px ${s.color}90`, border: '2px solid rgba(255,255,255,0.9)' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.05em' }}>PASSO {s.step}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4, lineHeight: 1.4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Badges de Confiança */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}>
            <Lock size={12} color="#00E5FF" />
            <span>Criptografia de Nível Bancário</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}>
            <CheckCircle2 size={12} color="#10B981" />
            <span>Repasses Automatizados via Stripe Connect</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}>
            <ShieldCheck size={12} color="#F59E0B" />
            <span>Garantia de Entrega e Suporte</span>
          </div>
        </div>
      </div>
    </section>
  )
}
