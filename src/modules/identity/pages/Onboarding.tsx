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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#ff3d00] to-[#ff6d00] flex items-center justify-center shadow-lg shadow-[#ff3d00]/20"
              style={{ animation: 'pulse 2s infinite' }}>
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-text mb-3">
              {t('Bem-vindo ao GAID')} 🎉
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto">
              {t('O maior marketplace de peças automotivas JDM do Japão. Vamos configurar sua conta em poucos segundos.')}
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 bg-[#ff3d00] hover:bg-[#e63600] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-[#ff3d00]/25"
          >
            {t('Começar')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // ─── Step 1: Account Type ───────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <p className="text-[#ff3d00] font-medium text-sm mb-2 uppercase tracking-wider">{t('Passo 1 de 3')}</p>
            <h1 className="font-display text-3xl font-bold text-text mb-2">
              {t('Quem é você?')}
            </h1>
            <p className="text-text-secondary">
              {t('Escolha o tipo de conta que melhor representa você')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Pessoa Física */}
            <button
              onClick={() => { setAccountType('pessoa_fisica'); setStep(2) }}
              className="group relative p-6 rounded-2xl border-2 transition-all text-left hover:scale-[1.02]"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ff3d00'
                e.currentTarget.style.background = 'rgba(255,61,0,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text mb-1">{t('Pessoa Física')}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t('Quero comprar peças e/ou vender como pessoa física (até 10 peças)')}
              </p>
            </button>

            {/* Empresa */}
            <button
              onClick={() => { setAccountType('empresa'); setStep(2) }}
              className="group relative p-6 rounded-2xl border-2 transition-all text-left hover:scale-[1.02]"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#00E5FF'
                e.currentTarget.style.background = 'rgba(0,229,255,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#0091EA] flex items-center justify-center mb-4 shadow-lg shadow-[#00E5FF]/20">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text mb-1">{t('Empresa')}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t('Oficina, desmanche, concessionária, loja de peças ou importadora')}
              </p>
              <span className="inline-block mt-2 text-xs font-medium text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full">
                {t('Vendas ilimitadas')}
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Step 2: Details ────────────────────────────────────────
  if (step === 2) {
    const isEmpresa = accountType === 'empresa'

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <p className="text-[#ff3d00] font-medium text-sm mb-2 uppercase tracking-wider">{t('Passo 2 de 3')}</p>
            <h1 className="font-display text-3xl font-bold text-text mb-2">
              {isEmpresa ? t('Dados da Empresa') : t('Seus Dados')}
            </h1>
            <p className="text-text-secondary">
              {isEmpresa
                ? t('Preencha os dados para solicitar verificação da sua loja')
                : t('Confirme suas informações básicas')}
            </p>
          </div>

          <div className="card p-6 space-y-4">
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
                          className="flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all"
                          style={{
                            borderColor: selected ? '#00E5FF' : 'rgba(255,255,255,0.1)',
                            background: selected ? 'rgba(0,229,255,0.08)' : 'transparent',
                          }}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" style={{ color: selected ? '#00E5FF' : '#888' }} />
                          <div>
                            <p className="text-sm font-medium text-text">{t(type.label)}</p>
                            <p className="text-xs text-text-secondary">{t(type.desc)}</p>
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
              className="w-full bg-[#ff3d00] hover:bg-[#e63600] text-white py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>
    )
  }

  // ─── Step 3: Done! ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>

        <h1 className="font-display text-3xl font-bold text-text mb-3">
          {t('Tudo pronto!')} 🚀
        </h1>

        <p className="text-text-secondary text-lg mb-8 leading-relaxed max-w-md mx-auto">
          {accountType === 'empresa'
            ? t('Sua solicitação de verificação foi enviada! Você será notificado quando sua loja for aprovada. Enquanto isso, explore nosso catálogo.')
            : t('Sua conta está configurada. Explore o catálogo de peças JDM e encontre o que você precisa!')}
        </p>

        {accountType === 'empresa' && (
          <div className="inline-flex items-center gap-2 bg-[#00E5FF]/10 text-[#00E5FF] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            {t('Verificação pendente')}
          </div>
        )}

        <div>
          <button
            onClick={goToCatalog}
            className="inline-flex items-center gap-2 bg-[#ff3d00] hover:bg-[#e63600] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-[#ff3d00]/25"
          >
            {t('Explorar Catálogo')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
