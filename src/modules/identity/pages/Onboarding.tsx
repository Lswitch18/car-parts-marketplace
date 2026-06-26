import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { useI18n } from '@/modules/shared/lib/i18n'
import { User, Building2, Wrench, Car, Package, Globe, ChevronRight, CheckCircle, Sparkles, Store } from 'lucide-react'

const STORE_TYPES = [
  { id: 'oficina', label: 'Oficina Mecânica', icon: Wrench, desc: 'Reparo e manutenção de veículos' },
  { id: 'desmanche', label: 'Desmanche', icon: Car, desc: 'Desmontagem e revenda de peças usadas' },
  { id: 'concessionaria', label: 'Concessionária / Revenda', icon: Store, desc: 'Venda de veículos e peças originais' },
  { id: 'loja_pecas', label: 'Loja de Peças', icon: Package, desc: 'Comércio especializado em autopeças' },
  { id: 'importadora', label: 'Importadora', icon: Globe, desc: 'Importação e distribuição de peças' },
] as const

const OnboardingLayout = ({ children, t }: { children: React.ReactNode, t: any }) => (
  <div className="min-h-screen bg-background flex">
    {/* Left Banner - Only on Desktop */}
    <div className="hidden lg:flex lg:w-[45%] relative bg-black overflow-hidden flex-col justify-end">
      <img 
        src="/onboarding_marketing_hero.png" 
        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-[20s] hover:scale-110" 
        alt="DAIG Marketplace" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-[#0D75FF]/10 mix-blend-overlay" />
      
      <div className="relative z-10 p-12 lg:p-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Sparkles className="w-4 h-4 text-[#00E5FF]" />
          <span className="text-sm font-semibold text-white tracking-widest uppercase">{t('DAIG for Business')}</span>
        </div>
        <h2 className="font-display text-5xl font-bold text-white mb-4 leading-tight">
          {t('O marketplace')}<br/>{t('de')} <span className="neon-text">{t('alta performance.')}</span>
        </h2>
        <p className="text-xl text-white/70 max-w-lg">
          {t('Conectamos oficinas, desmanches e entusiastas do mercado JDM em todo o Japão.')}
        </p>
      </div>
    </div>

    {/* Right Content */}
    <div className="w-full lg:w-[55%] flex items-center justify-center px-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(13,117,255,0.12) 0%, rgba(112,0,255,0.06) 50%, transparent 100%)' }} />
      {children}
    </div>
  </div>
)

export default function Onboarding() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [step, setStep] = useState(0)
  const [accountType, setAccountType] = useState<'pessoa_fisica' | 'empresa'>('pessoa_fisica')
  const [storeType, setStoreType] = useState('')
  const [storeName, setStoreName] = useState('')
  const [storeDocument, setStoreDocument] = useState('')
  const [phone, setPhone] = useState(user?.phone || '')
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [saving, setSaving] = useState(false)

  const handleFinish = async () => {
    setSaving(true)
    try {
      const updates: Record<string, unknown> = {
        onboarding_completed: true,
        full_name: fullName || user?.full_name,
        phone: phone || user?.phone,
      }

      if (accountType === 'pessoa_fisica') {
        updates.account_type = 'pessoa_fisica'
      } else {
        updates.account_type = storeType
        updates.store_type = storeType
        updates.store_name = storeName
        updates.store_document = storeDocument
        updates.store_status = 'pending'
        updates.store_requested_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id)

      if (error) throw error

      await updateProfile({ ...updates, onboarding_completed: true } as any)
      setStep(3)
    } catch (err) {
      // Fail safe: still mark onboarding as done to avoid infinite loop
      console.error('Onboarding save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const goToCatalog = () => {
    navigate('/catalog', { replace: true })
  }

  // ─── Step 0: Welcome ────────────────────────────────────────
  if (step === 0) {
    return (
      <OnboardingLayout t={t}>
        <div className="w-full max-w-lg text-center relative z-10">
          <div
            className="rounded-3xl p-10 mb-8"
            style={{
              background: 'rgba(10,10,15,0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(13,117,255,0.2)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-transform"
              style={{ 
                background: 'linear-gradient(135deg, #0D75FF 0%, #7000FF 100%)',
                boxShadow: '0 0 40px rgba(13,117,255,0.4)',
                animation: 'pulse 3s infinite'
              }}>
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
              {t('Bem-vindo à')}{' '}
              <span className="neon-text">DAIG</span> 🎉
            </h1>
            <p className="text-lg leading-relaxed max-w-md mx-auto" style={{ color: '#8892A4' }}>
              {t('O maior marketplace de peças automotivas JDM do Japão. Vamos configurar sua conta em poucos segundos.')}
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300"
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
            {t('Começar')}
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </OnboardingLayout>
    )
  }

  // ─── Step 1: Account Type ───────────────────────────────────
  if (step === 1) {
    return (
      <OnboardingLayout t={t}>
        <div className="w-full max-w-2xl relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ border: '1px solid rgba(13,117,255,0.2)', background: 'rgba(13,117,255,0.06)' }}>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#0D75FF' }}>
                {t('Passo 1 de 3')}
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-3">
              {t('Quem é você?')}
            </h1>
            <p className="text-lg" style={{ color: '#8892A4' }}>
              {t('Escolha o tipo de conta que melhor representa você')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Pessoa Física */}
            <button
              onClick={() => { setAccountType('pessoa_fisica'); setStep(2) }}
              className="group relative p-8 rounded-2xl border transition-all text-left overflow-hidden"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(13,117,255,0.5)'
                e.currentTarget.style.background = 'rgba(13,117,255,0.05)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(13,117,255,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, #0D75FF 0%, #0050c2 100%)',
                  boxShadow: '0 0 24px rgba(13,117,255,0.3)'
                }}>
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t('Pessoa Física')}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8892A4' }}>
                {t('Quero comprar e vender peças na plataforma')}
              </p>
            </button>

            {/* Empresa */}
            <button
              onClick={() => { setAccountType('empresa'); setStep(2) }}
              className="group relative p-8 rounded-2xl border transition-all text-left overflow-hidden"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(112,0,255,0.5)'
                e.currentTarget.style.background = 'rgba(112,0,255,0.05)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(112,0,255,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, #7000FF 0%, #45009d 100%)',
                  boxShadow: '0 0 24px rgba(112,0,255,0.3)'
                }}>
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t('Empresa')}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#8892A4' }}>
                {t('Sou empresa e quero usar a DAIG como vitrine para vender minhas peças')}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(112,0,255,0.15)', color: '#b388ff', border: '1px solid rgba(112,0,255,0.3)' }}>
                <Sparkles className="w-3 h-3" />
                {t('Vendas ilimitadas')}
              </span>
            </button>
          </div>
        </div>
      </OnboardingLayout>
    )
  }

  // ─── Step 2: Details ────────────────────────────────────────
  if (step === 2) {
    const isEmpresa = accountType === 'empresa'

    return (
      <OnboardingLayout t={t}>
        <div className="w-full max-w-lg relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ border: '1px solid rgba(13,117,255,0.2)', background: 'rgba(13,117,255,0.06)' }}>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#0D75FF' }}>
                {t('Passo 2 de 3')}
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-3">
              {isEmpresa ? t('Dados da Empresa') : t('Seus Dados')}
            </h1>
            <p className="text-lg" style={{ color: '#8892A4' }}>
              {isEmpresa
                ? t('Preencha os dados para solicitar verificação da sua loja')
                : t('Confirme suas informações básicas')}
            </p>
          </div>

          <div 
            className="rounded-3xl p-8 space-y-5"
            style={{
              background: 'rgba(10,10,15,0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
            }}
          >
            {/* Nome */}
            <div>
              <label className="block text-text-secondary text-sm mb-1.5">{t('Nome completo')}</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                placeholder={t('Seu nome completo')}
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-text-secondary text-sm mb-1.5">{t('Telefone')}</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                placeholder="+81 90 1234 5678"
              />
            </div>

            {isEmpresa && (
              <>
                {/* Tipo de empresa */}
                <div>
                  <label className="block text-text-secondary text-sm mb-1.5">{t('Tipo de empresa')}</label>
                  <div className="grid grid-cols-1 gap-2">
                    {STORE_TYPES.map(type => {
                      const Icon = type.icon
                      const selected = storeType === type.id
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setStoreType(type.id)}
                          className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:bg-white/5"
                          style={{
                            borderColor: selected ? '#7000FF' : 'rgba(255,255,255,0.08)',
                            background: selected ? 'rgba(112,0,255,0.1)' : 'transparent',
                            boxShadow: selected ? '0 0 20px rgba(112,0,255,0.2)' : 'none',
                          }}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{ 
                              background: selected ? '#7000FF' : 'rgba(255,255,255,0.05)',
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color: selected ? '#FFFFFF' : '#8892A4' }} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white mb-0.5">{t(type.label)}</p>
                            <p className="text-xs" style={{ color: '#8892A4' }}>{t(type.desc)}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Nome da empresa */}
                <div>
                  <label className="block text-text-secondary text-sm mb-1.5">{t('Nome da empresa')}</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                    placeholder={t('Nome comercial')}
                    required
                  />
                </div>

                {/* CNPJ / Registro */}
                <div>
                  <label className="block text-text-secondary text-sm mb-1.5">{t('CNPJ / Registro Comercial')}</label>
                  <input
                    type="text"
                    value={storeDocument}
                    onChange={e => setStoreDocument(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                    placeholder={t('Número do documento')}
                    required
                  />
                </div>
              </>
            )}

            <button
              onClick={handleFinish}
              disabled={saving || (isEmpresa && (!storeType || !storeName || !storeDocument))}
              className="w-full text-white py-4 mt-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #0D75FF 0%, #7000FF 100%)',
                boxShadow: '0 0 24px rgba(13,117,255,0.4)',
              }}
              onMouseEnter={(e) => {
                if(saving || (isEmpresa && (!storeType || !storeName || !storeDocument))) return;
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 0 40px rgba(13,117,255,0.6)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = ''
                el.style.boxShadow = '0 0 24px rgba(13,117,255,0.4)'
              }}
            >
              {saving
                ? t('Salvando...')
                : isEmpresa
                  ? t('Solicitar Verificação')
                  : t('Concluir')
              }
              {!saving && <ChevronRight className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-text-secondary hover:text-text text-sm py-2 transition-colors"
            >
              ← {t('Voltar')}
            </button>
          </div>
        </div>
      </OnboardingLayout>
    )
  }

  // ─── Step 3: Done! ──────────────────────────────────────────
  return (
    <OnboardingLayout t={t}>
      <div className="w-full max-w-lg text-center relative z-10">
        <div
          className="rounded-3xl p-10 mb-8"
          style={{
            background: 'rgba(10,10,15,0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(13,117,255,0.2)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 0 40px rgba(16,185,129,0.4)',
            }}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="font-display text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            {t('Tudo pronto!')} 🚀
          </h1>

          <p className="text-lg mb-8 leading-relaxed max-w-md mx-auto" style={{ color: '#8892A4' }}>
            {accountType === 'empresa'
              ? t('Sua solicitação de verificação foi enviada! Você será notificado quando sua loja for aprovada. Enquanto isso, explore nosso catálogo.')
              : t('Sua conta está configurada. Explore o catálogo de peças JDM e encontre o que você precisa!')}
          </p>

          {accountType === 'empresa' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ background: 'rgba(13,117,255,0.15)', color: '#0D75FF', border: '1px solid rgba(13,117,255,0.3)' }}>
              <div className="w-2 h-2 rounded-full bg-[#0D75FF] animate-pulse" />
              {t('Verificação pendente')}
            </div>
          )}

          <button
            onClick={goToCatalog}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #0D75FF 0%, #7000FF 100%)',
              boxShadow: '0 0 30px rgba(13,117,255,0.4)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 0 50px rgba(13,117,255,0.6)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = ''
              el.style.boxShadow = '0 0 30px rgba(13,117,255,0.4)'
            }}
          >
            {t('Explorar Catálogo')}
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </OnboardingLayout>
  )
}
