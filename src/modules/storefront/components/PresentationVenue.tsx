import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/modules/shared/lib/gsap'
import { DAIG_TOKENS } from '@/modules/shared/lib/designTokens'
import { HitechIcon } from '@/modules/storefront/components/HitechIcon'

type FeatureHiTech = {
  iconKey: 'Store' | 'Bot' | 'MessageCircle' | 'CreditCard' | 'Building2' | 'Landmark'
  title: string
  desc: string
  accent: string
}

export const FEATURES_HITECH: FeatureHiTech[] = [
  { iconKey: 'Store', title: 'Catálogo JDM', desc: 'Motor de busca em tempo real com filtros por marca, modelo, condição e preço. 16+ marcas JDM disponíveis.', accent: '#00E5FF' },
  { iconKey: 'Bot', title: 'IA Generativa de Anúncios', desc: 'Foto → Anúncio completo em 3 segundos. A IA identifica a peça, gera título e descrição em PT e JA.', accent: '#7C3AED' },
  { iconKey: 'MessageCircle', title: 'Chat em Tempo Real', desc: 'Negociação direta entre comprador e vendedor. Supabase Realtime. Histórico preservado.', accent: '#00D97E' },
  { iconKey: 'CreditCard', title: 'Stripe Connect + Escrow', desc: 'Pagamento em custódia JPY. Repasse automático (90%) ao vendedor após confirmação de entrega via Zengin.', accent: '#FF6B35' },
  { iconKey: 'Building2', title: 'SaaS Multi-Tenant ERP', desc: 'ERP de Desmanche com WMS, Kanban, QR Code, Ordens de Serviço, estoque e publicação 1-clique.', accent: '#0D75FF' },
  { iconKey: 'Landmark', title: 'Compliance JCT + Invoice', desc: 'Emissão de notas fiscais japonesas (Tekikaku Seikyusho), retenção JCT 10% e liquidação Zengin T+4.', accent: '#F59E0B' },
]

export const HitechFeatureCard: React.FC<{ feature: FeatureHiTech; className?: string }> = ({ feature, className }) => (
  <div className={`${className ?? ''} glass-ultra`} style={{ padding: '28px 24px', borderRadius: DAIG_TOKENS.radii.card, willChange: 'transform, opacity', position: 'relative', overflow: 'hidden' }}>
    <HitechIcon name={feature.iconKey} />
    <div style={{ marginTop: 16 }}>
      <h3 style={{ color: DAIG_TOKENS.colors.textMain, fontWeight: 700, fontSize: 16, marginBottom: 8, lineHeight: 1.3, fontFamily: DAIG_TOKENS.typography.display }}>
        {feature.title}
      </h3>
      <p style={{ color: DAIG_TOKENS.colors.textMuted, fontSize: 13, lineHeight: 1.65, fontFamily: DAIG_TOKENS.typography.body }}>{feature.desc}</p>
    </div>
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(600px circle at 0% 0%, ${feature.accent}08, transparent 60%)`, pointerEvents: 'none', opacity: 0.6 }} />
  </div>
)

export const HorizontalVenue: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      // Feature cards stagger (vertical fallback) + horizontal venue on desktop
      const mm = gsap.matchMedia()
      // Desktop: horizontal pinned venue
      mm.add('(min-width: 1024px)', () => {
        const track = ref.current?.querySelector('.features-track') as HTMLElement | null
        const venue = ref.current?.querySelector('.features-venue') as HTMLElement | null
        if (!track || !venue) return
        const n = FEATURES_HITECH.length
        // 2 rows × 3 cols bento (desktop) → horizontal 2 panels
        gsap.to(track, {
          xPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: venue,
            pin: true,
            scrub: 1,
            snap: 1,
            start: 'top top',
            end: '+=120%',
            anticipatePin: 1,
          },
        })
      })
      // Stagger reveal
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: '.features-grid, .features-track', start: 'top 78%' },
        y: 40,
        opacity: 0,
        stagger: 0.08,
        ease: 'back.out(1.2)',
        duration: 0.7,
      })
    }, ref)
    return () => ctx.revert()
  }, { scope: ref })

  return (
    <section ref={ref} className="features-venue" style={{ maxWidth: 1200, margin: '0 auto 120px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: DAIG_TOKENS.colors.textMain, letterSpacing: -1.5, fontFamily: DAIG_TOKENS.typography.display }}>
          Tudo que você precisa, <span style={{ color: DAIG_TOKENS.colors.cyan }}>integrado</span>
        </h2>
        <p style={{ color: DAIG_TOKENS.colors.textMuted, fontSize: 14, marginTop: 8 }}>Um ecossistema completo, do desmanche ao depósito bancário</p>
      </div>

      {/* Desktop horizontal venue (2 panels) */}
      <div className="features-track" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 16 }}>
        {FEATURES_HITECH.map(f => (
          <HitechFeatureCard key={f.title} feature={f} className="feature-card" />
        ))}
      </div>

      {/* Mobile fallback hint */}
      <div style={{ display: 'none' }} className="mobile-hint">
        Deslize horizontalmente
      </div>
    </section>
  )
}
