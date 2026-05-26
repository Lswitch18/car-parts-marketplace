import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Search, Shield, Truck, Star, Wrench, Zap, CheckCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { BRANDS } from '../lib/constants'
import { useI18n } from '../lib/i18n'

/* ── Intersection Observer scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    // Observe the container and all .reveal children inside it
    el.querySelectorAll('.reveal, .reveal-fade, .reveal-scale').forEach((child) =>
      obs.observe(child)
    )
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const { t } = useI18n()
  const heroRef = useReveal()
  const productsRef = useReveal()
  const trustRef = useReveal()
  const ctaRef = useReveal()

  const { data: products } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parts')
        .select('*, brands(name), categories(name), profiles(full_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8)
      if (error) throw error
      return data || []
    },
  })

  const conditionLabel = (c: string) => {
    if (c === 'new') return { label: 'Novo', color: '#00D97E' }
    if (c === 'used') return { label: 'Usado', color: '#FFB800' }
    return { label: 'Reformado', color: '#0D75FF' }
  }

  return (
    <div className="bg-background min-h-screen text-text">
      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" ref={heroRef}>
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />

        {/* Radial ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-5%',
              width: '55%',
              height: '70%',
              background: 'radial-gradient(ellipse, rgba(13,117,255,0.18) 0%, transparent 65%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-5%',
              right: '-5%',
              width: '45%',
              height: '60%',
              background: 'radial-gradient(ellipse, rgba(112,0,255,0.12) 0%, transparent 65%)',
            }}
          />
        </div>

        {/* Horizontal separator line glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(13,117,255,0.5) 40%, rgba(13,117,255,0.5) 60%, transparent 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="reveal reveal-delay-1 inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(13,117,255,0.1)',
                border: '1px solid rgba(13,117,255,0.3)',
              }}
            >
              <Zap className="w-4 h-4 text-daig-cyan" />
              <span
                className="text-sm font-semibold tracking-wide"
                style={{ color: '#00E5FF' }}
              >
                {t('DAIG — A plataforma definitiva para compra e venda')}
              </span>
            </div>

            {/* H1 */}
            <h1 className="reveal reveal-delay-2 font-display font-bold text-text leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', letterSpacing: '-0.03em' }}
            >
              {t('Encontre as melhores')}{' '}
              <span className="neon-text">{t('peças')}</span>
              <br />
              {t('para seu carro')}
            </h1>

            {/* Description */}
            <p
              className="reveal reveal-delay-3 text-lg leading-relaxed mb-10 max-w-xl"
              style={{ color: '#8892A4' }}
            >
              {t('O maior marketplace de peças automotivas do Japão')}
              <br />
              {t('Qualidade garantida, entrega rápida e segurança total')}
            </p>

            {/* CTA Buttons */}
            <div className="reveal reveal-delay-4 flex flex-col sm:flex-row gap-4 mb-14">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 font-semibold text-base px-8 py-4 rounded-xl text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #0D75FF 0%, #0050c2 100%)',
                  boxShadow: '0 0 24px rgba(13,117,255,0.5), 0 4px 16px rgba(0,0,0,0.4)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow =
                    '0 0 36px rgba(13,117,255,0.7), 0 8px 24px rgba(0,0,0,0.5)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.transform = ''
                  ;(e.currentTarget as HTMLElement).style.boxShadow =
                    '0 0 24px rgba(13,117,255,0.5), 0 4px 16px rgba(0,0,0,0.4)'
                }}
              >
                <Search className="w-5 h-5" />
                {t('Explorar Catálogo')}
              </Link>

              <Link
                to="/create-listing"
                className="inline-flex items-center justify-center gap-2 font-semibold text-base px-8 py-4 rounded-xl text-white transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(13,117,255,0.35)',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(13,117,255,0.12)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,117,255,0.6)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(13,117,255,0.35)'
                  ;(e.currentTarget as HTMLElement).style.transform = ''
                }}
              >
                {t('Vender Peças')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Stats */}
            <div className="reveal reveal-delay-5 flex items-center gap-10">
              {[
                { value: '5.000+', label: t('Peças à venda') },
                { value: '500+', label: t('Vendedores') },
                { value: '98%', label: t('Satisfação') },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p
                    className="font-display font-bold text-3xl mb-1"
                    style={{
                      background: 'linear-gradient(180deg, #FFFFFF 0%, #8BB8FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════════ */}
      {products && products.length > 0 && (
        <section
          className="py-24"
          style={{ background: 'var(--bg-card)', borderTop: '1px solid rgba(255,255,255,0.04)' }}
          ref={productsRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="reveal flex items-end justify-between mb-12">
              <div>
                <p
                  className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
                  style={{ color: '#0D75FF' }}
                >
                  Catálogo
                </p>
                <h2 className="font-display text-3xl font-bold text-white">
                  Últimas Novidades
                </h2>
                <p className="mt-2" style={{ color: '#6B7280' }}>
                  As peças mais recentes adicionadas ao catálogo
                </p>
              </div>
              <Link
                to="/catalog"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold transition-all group"
                style={{ color: '#0D75FF' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#00E5FF')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#0D75FF')}
              >
                Ver todas
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product, i) => {
                const cond = conditionLabel(product.condition)
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className={`reveal reveal-delay-${Math.min(i + 1, 6)} group block rounded-2xl overflow-hidden transition-all duration-300`}
                    style={{
                      background: 'var(--bg-void)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(13,117,255,0.4)'
                      el.style.transform = 'translateY(-4px)'
                      el.style.boxShadow = '0 20px 48px rgba(13,117,255,0.15), 0 8px 24px rgba(0,0,0,0.5)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(255,255,255,0.05)'
                      el.style.transform = ''
                      el.style.boxShadow = ''
                    }}
                  >
                    {/* Image */}
                    <div
                      className="aspect-square relative overflow-hidden"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                          style={{ transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.transform = 'scale(1.08)')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: '#374151' }}>
                          <Wrench className="w-10 h-10" />
                        </div>
                      )}

                      {/* Condition badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: `${cond.color}22`,
                            color: cond.color,
                            border: `1px solid ${cond.color}55`,
                            backdropFilter: 'blur(6px)',
                          }}
                        >
                          {cond.label}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-xs mb-1 truncate" style={{ color: '#4B5563' }}>
                        {product.brand} {product.model}
                      </p>
                      <h3
                        className="font-semibold text-sm mb-3 truncate transition-colors duration-200"
                        style={{ color: '#E5E7EB' }}
                      >
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p
                          className="font-display font-bold text-lg"
                          style={{ color: '#00E5FF' }}
                        >
                          ¥ {product.price.toLocaleString('ja-JP')}
                        </p>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'rgba(13,117,255,0.2)', color: '#0D75FF' }}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Mobile "ver todas" */}
            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: '#0D75FF' }}
              >
                Ver todas as peças <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          TRUST CARDS
      ════════════════════════════════════════ */}
      <section className="py-24 bg-background" ref={trustRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="reveal text-center mb-14">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
              style={{ color: '#0D75FF' }}
            >
              Por que escolher a DAIG
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              Compre com confiança
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                color: '#7000FF',
                colorBg: 'rgba(112,0,255,0.12)',
                colorBorder: 'rgba(112,0,255,0.25)',
                title: 'Compra Segura',
                desc: 'Proteção total para suas compras com garantia de entrega e devolução sem complicação.',
                check: 'Pagamento protegido',
                delay: 1,
              },
              {
                icon: Truck,
                color: '#00E5FF',
                colorBg: 'rgba(0,229,255,0.10)',
                colorBorder: 'rgba(0,229,255,0.25)',
                title: 'Entrega Rápida',
                desc: t('Envio para todo Japão com rastreamento em tempo real e estimativa precisa.'),
                check: 'Rastreio em tempo real',
                delay: 2,
              },
              {
                icon: Star,
                color: '#0D75FF',
                colorBg: 'rgba(13,117,255,0.12)',
                colorBorder: 'rgba(13,117,255,0.25)',
                title: 'Qualidade Garantida',
                desc: 'Peças originais e de procedência com verificação de autenticidade em cada anúncio.',
                check: 'Peças verificadas',
                delay: 3,
              },
            ].map(({ icon: Icon, color, colorBg, colorBorder, title, desc, check, delay }) => (
              <div
                key={title}
                className={`reveal reveal-delay-${delay} group relative rounded-2xl p-8 overflow-hidden transition-all duration-300`}
                style={{
                  background: colorBg,
                  border: `1px solid ${colorBorder}`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-4px)'
                  el.style.boxShadow = `0 20px 48px ${color}22`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = ''
                  el.style.boxShadow = ''
                }}
              >
                {/* Top glow bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color}88, transparent)`,
                  }}
                />

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `${color}18`, border: `1px solid ${color}33` }}
                >
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>

                <h3 className="font-display text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#8892A4' }}>
                  {desc}
                </p>

                {/* Check feature */}
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color }} />
                  <span className="text-xs font-medium" style={{ color }}>
                    {check}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA — Glassmorphism
      ════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" ref={ctaRef}>
        {/* Background layers */}
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(13,117,255,0.18) 0%, rgba(112,0,255,0.10) 50%, transparent 100%)',
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(13,117,255,0.5) 40%, rgba(112,0,255,0.4) 60%, transparent 100%)',
          }}
        />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          {/* Glass card */}
          <div
            className="reveal rounded-3xl p-12"
            style={{
              background: 'rgba(10,10,15,0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(13,117,255,0.2)',
              boxShadow:
                '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Top accent */}
            <div className="flex justify-center mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(13,117,255,0.15)',
                  border: '1px solid rgba(13,117,255,0.3)',
                }}
              >
                <Zap className="w-6 h-6 text-daig-blue" />
              </div>
            </div>

            <h2 className="font-display text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              Pronto para vender suas peças?
            </h2>
            <p className="text-lg mb-10" style={{ color: '#8892A4' }}>
              Junte-se a milhares de vendedores e alcance milhões de compradores na DAIG!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-listing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #0D75FF 0%, #7000FF 100%)',
                  boxShadow: '0 0 30px rgba(13,117,255,0.4)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-2px) scale(1.02)'
                  el.style.boxShadow = '0 0 50px rgba(13,117,255,0.6)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = ''
                  el.style.boxShadow = '0 0 30px rgba(13,117,255,0.4)'
                }}
              >
                Começar a Vender
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.1)'
                  el.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.05)'
                  el.style.transform = ''
                }}
              >
                Explorar Catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BRAND MARQUEE
      ════════════════════════════════════════ */}
      <section
        className="py-14 relative overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'var(--bg-card)' }}
      >
        {/* Edge fade */}
        <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--bg-card), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--bg-card), transparent)' }} />

        <div className="flex w-[200%] animate-marquee">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="flex-1 flex justify-center items-center px-8 transition-opacity duration-300"
              style={{ opacity: 0.15 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.45')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.15')}
            >
              <span
                className="font-display font-bold tracking-widest uppercase whitespace-nowrap"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#FFFFFF' }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
