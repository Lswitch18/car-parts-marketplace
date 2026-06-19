import { Link } from 'react-router-dom'
import { ArrowRight, Search, Shield, Truck, Star, Zap, CheckCircle, ChevronDown, Package, RefreshCw, HeadphonesIcon, MapPin, Clock, FileText, BadgeCheck, Gauge, CreditCard, X, MessageCircle, Send, Cpu, Eye, Globe, Bot } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BRANDS } from '@/modules/shared/lib/constants'
import { useI18n } from '@/modules/shared/lib/i18n'
import HeroCarScene from '@/modules/parts-catalog/components/HeroCarScene'

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
  const trustRef = useReveal()
  const ctaRef = useReveal()

  const cards = [
    {
      icon: Shield,
      color: '#7000FF',
      colorBg: 'rgba(112,0,255,0.12)',
      colorBorder: 'rgba(112,0,255,0.25)',
      title: t('Compra Segura'),
      desc: t('Proteção total para suas compras com Compra Segura e devolução sem complicação.'),
      check: t('Pagamento protegido'),
      delay: 1,
      details: [
        { icon: CreditCard, label: t('Pagamento protegido'), text: t('Seus dados financeiros são criptografados e processados por gateways certificados.') },
        { icon: RefreshCw, label: t('Devolução fácil'), text: t('Devolução gratuita em até 30 dias para qualquer insatisfação.') },
        { icon: HeadphonesIcon, label: t('Suporte dedicado'), text: t('Atendimento prioritário em português, japonês e inglês.') },
      ],
    },
    {
      icon: Truck,
      color: '#4DA3FF',
      colorBg: 'rgba(77,163,255,0.10)',
      colorBorder: 'rgba(77,163,255,0.25)',
      title: t('Entrega Rápida'),
      desc: t('Envio para todo Japão com rastreamento em tempo real e estimativa precisa.'),
      check: t('Rastreio em tempo real'),
      delay: 2,
      details: [
        { icon: MapPin, label: t('Cobertura nacional'), text: t('Entregamos em todas as prefeituras do Japão, incluindo áreas remotas.') },
        { icon: Clock, label: t('2-5 dias úteis'), text: t('Prazo médio de entrega para a maioria das regiões do Japão.') },
        { icon: Search, label: t('Rastreio em tempo real'), text: t('Acompanhe cada etapa da entrega com atualizações por email e SMS.') },
      ],
    },
    {
      icon: MessageCircle,
      color: '#0D75FF',
      colorBg: 'rgba(13,117,255,0.12)',
      colorBorder: 'rgba(13,117,255,0.25)',
      title: t('Negociação Transparente'),
      desc: t('Converse diretamente com o vendedor, tire dúvidas e envie sua proposta sem intermediários.'),
      check: t('Contato direto'),
      delay: 3,
      details: [
        { icon: MessageCircle, label: t('Chat com o vendedor'), text: t('Comunique-se em tempo real com o vendedor para alinhar detalhes antes de fechar negócio.') },
        { icon: Send, label: t('Envie sua proposta'), text: t('Faça uma oferta personalizada — o vendedor analisa e responde diretamente pelo chat.') },
        { icon: RefreshCw, label: t('Negociação flexível'), text: t('Combine prazos, frete e condições de pagamento direto com o vendedor.') },
      ],
    },
  ]

  return (
    <div className="bg-background min-h-screen text-text overflow-hidden">
      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" ref={heroRef}>
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />

        <HeroCarScene />

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


            {/* H1 */}
            <h1 className="reveal reveal-delay-2 font-display font-bold text-text leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}
            >
              {t('Encontre as melhores')}{' '}
              <span className="neon-text">{t('peças')}</span>
              <br />
              {t('para seu carro')}
            </h1>



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
                {t('Compre sua peça')}
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
          TRUST CARDS
      ════════════════════════════════════════ */}
      <section className="pt-24 pb-10 bg-background" ref={trustRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="reveal text-center mb-14">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
              style={{ color: '#0D75FF' }}
            >
              {t('Por que escolher a DAIG')}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {t('Compre com confiança')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TECH & INNOVATION
      ════════════════════════════════════════ */}
      {/*
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full filter blur-[180px]"
            style={{ background: 'rgba(13,117,255,0.06)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full filter blur-[150px]"
            style={{ background: 'rgba(112,0,255,0.05)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="reveal text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ border: '1px solid rgba(13,117,255,0.2)', background: 'rgba(13,117,255,0.06)' }}>
              <Cpu className="w-3.5 h-3.5" style={{ color: '#0D75FF' }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#0D75FF' }}>
                Tecnologia & Inovação
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white">
              Potência tecnológica da{' '}
              <span className="neon-text">DAIG</span>
            </h2>
            <p className="text-base mt-4 max-w-2xl mx-auto" style={{ color: '#8892A4' }}>
              Do matching inteligente à visualização 3D — nossa plataforma é construída sobre engenharia de ponta para conectar compradores e vendedores com segurança e velocidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                color: '#0D75FF',
                title: 'Matching por IA',
                desc: 'Nosso algoritmo de machine learning analisa milhares de peças em segundos e encontra a compatibilidade exata para seu veículo — mesmo em modelos raros e importados.',
              },
              {
                icon: Eye,
                color: '#00E5FF',
                title: 'Visualização 3D Imersiva',
                desc: 'Inspencione peças em 3D com zoom, rotação e realidade aumentada antes de comprar. Veja cada detalhe como se estivesse com a peça em mãos.',
              },
              {
                icon: Globe,
                color: '#7000FF',
                title: 'Logística Inteligente',
                desc: 'Rastreamento em tempo real com estimativas precisas, rotas otimizadas por IA e integração com as principais transportadoras do Japão.',
              },
            ].map((tech, idx) => (
              <div
                key={tech.title}
                className="reveal rounded-2xl p-8 transition-all duration-300 group hover:-translate-y-1"
                style={{
                  background: `rgba(13,117,255,0.04)`,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = `${tech.color}44`
                  el.style.boxShadow = `0 16px 40px ${tech.color}15`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'rgba(255,255,255,0.06)'
                  el.style.boxShadow = ''
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110"
                  style={{ background: `${tech.color}18`, border: `1px solid ${tech.color}33` }}>
                  <tech.icon className="w-6 h-6" style={{ color: tech.color }} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-3">{tech.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8892A4' }}>{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

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
              {t('Pronto para vender suas peças?')}
            </h2>
            <p className="text-lg mb-10" style={{ color: '#8892A4' }}>
              {t('Junte-se a milhares de vendedores e alcance milhões de compradores!')}
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
                {t('Começar a Vender')}
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
                {t('Compre sua peça')}
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

function FeatureCard({ icon: Icon, color, colorBg, colorBorder, title, desc, check, delay, details }: {
  icon: any; color: string; colorBg: string; colorBorder: string;
  title: string; desc: string; check: string; delay: number;
  details: { icon: any; label: string; text: string }[];
}) {
  const { t } = useI18n()
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <div
        className={`reveal reveal-delay-${delay} group relative rounded-2xl p-8 overflow-hidden transition-all duration-300 cursor-pointer`}
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
        onClick={() => setShowModal(true)}
      >
        {/* Top glow bar */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}88, transparent)`,
          }}
        />

        {/* Animated background pulse */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${color}15, transparent)`,
          }}
        />

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]"
          style={{ background: `${color}18`, border: `1px solid ${color}33` }}
        >
          <Icon className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" style={{ color }} />
        </div>

        <h3 className="font-display text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#8892A4' }}>
          {desc}
        </p>

        {/* Check feature */}
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color }} />
          <span className="text-xs font-medium" style={{ color }}>
            {check}
          </span>
        </div>

        {/* Click hint */}
        <div className="flex items-center gap-1.5 text-xs font-medium transition-all group-hover:gap-2" style={{ color }}>
          <span>{t('Clique para detalhes')}</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-8 overflow-hidden"
            style={{
              background: 'rgba(10,10,15,0.97)',
              border: `1px solid ${color}44`,
              boxShadow: `0 32px 64px rgba(0,0,0,0.8), 0 0 48px ${color}22`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: '#6B7280' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}33` }}
              >
                <Icon className="w-7 h-7" style={{ color }} />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">{title}</h3>
                <p className="text-xs mt-0.5" style={{ color }}>{check}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#8892A4' }}>
              {desc}
            </p>

            {/* Detail items */}
            <div className="space-y-5">
              {details.map(({ icon: DIcon, label, text }) => (
                <div key={label} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}
                  >
                    <DIcon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white mb-1">{label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#8892A4' }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
