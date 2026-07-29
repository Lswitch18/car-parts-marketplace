import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { useI18n } from '@/modules/shared/lib/i18n'
import { 
  User, Building2, Wrench, Car, Package, Globe, ChevronRight, CheckCircle2, 
  Sparkles, Store, ShieldCheck, ArrowRight, Zap, Check, Lock, Landmark, FileText
} from 'lucide-react'
import GaidLogo from '@/modules/shared/components/GaidLogo'

const STORE_TYPES = [
  { id: 'oficina', label: 'Oficina Mecânica', icon: Wrench, desc: 'Reparo, preparação e manutenção JDM', color: '#F59E0B' }, // Amber
  { id: 'desmanche', label: 'Desmanche JDM', icon: Car, desc: 'Desmontagem e revenda de peças usadas', color: '#EF4444' }, // Red
  { id: 'concessionaria', label: 'Concessionária / Revenda', icon: Store, desc: 'Venda de veículos e peças originais', color: '#3B82F6' }, // Blue
  { id: 'loja_pecas', label: 'Loja de Autopeças', icon: Package, desc: 'Comércio especializado em peças e acessórios', color: '#10B981' }, // Emerald
  { id: 'importadora', label: 'Importadora Direct Ship', icon: Globe, desc: 'Importação e distribuição direta do Japão', color: '#8B5CF6' }, // Purple
] as const

const OnboardingLayout = ({ children, currentStep }: { children: React.ReactNode, currentStep: number }) => (
  <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans selection:bg-emerald-500 selection:text-black relative overflow-hidden">
    
    {/* Background Glow Orbs */}
    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

    {/* Left Banner - Desktop Only */}
    <div className="hidden lg:flex lg:w-[45%] relative bg-[#0c0c0e] border-r border-zinc-800/80 overflow-hidden flex-col justify-between p-12">
      <div className="relative z-10">
        <Link to="/" className="inline-block mb-10">
          <GaidLogo size={40} />
        </Link>

        <div className="space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Ecossistema JDM Japão B2B & B2C</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Gestão inteligente de peças, estoque e repasses bancários.
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Conectamos oficinas, desmanches e importadoras diretamente aos clientes no Japão com repasses automáticos via Stripe Connect.
          </p>

          <div className="space-y-3 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-bold">
                ✓
              </div>
              <span>Lojas B2B Multi-Tenant com estoque sincronizado em 1-clique.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 font-bold">
                ✓
              </div>
              <span>Repasses diretos via Stripe Connect em ienes (JPY).</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 font-bold">
                ✓
              </div>
              <span>Rastreamento Direct Ship (Japan Post / Sagawa / Yamato).</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-6 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>DAIG.jp © 2026</span>
        <span>Japão JDM Marketplace</span>
      </div>
    </div>

    {/* Right Content Form Area */}
    <div className="w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-12 relative z-10 bg-[#09090b]/80 backdrop-blur-2xl">
      
      {/* Step Progress Bar */}
      <div className="max-w-xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-400 mb-2 uppercase tracking-wider">
          <span className={currentStep >= 0 ? 'text-emerald-400' : ''}>01 Boas-Vindas</span>
          <span className={currentStep >= 1 ? 'text-emerald-400' : ''}>02 Perfil</span>
          <span className={currentStep >= 2 ? 'text-emerald-400' : ''}>03 Configuração</span>
          <span className={currentStep >= 3 ? 'text-emerald-400' : ''}>04 Conclusão</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="max-w-xl mx-auto w-full flex-1 flex items-center justify-center">
        {children}
      </div>

      {/* Footer info */}
      <div className="max-w-xl mx-auto w-full text-center text-xs text-zinc-500 pt-6">
        Precisa de ajuda com o Stripe ou Cadastro? <Link to="/legal" className="text-zinc-300 hover:text-white underline">Suporte DAIG</Link>
      </div>

    </div>

  </div>
)

export default function Onboarding() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()

  const [step, setStep] = useState(0)
  const [accountType, setAccountType] = useState<'pessoa_fisica' | 'empresa'>('pessoa_fisica')
  const [storeType, setStoreType] = useState('desmanche')
  const [storeName, setStoreName] = useState('')
  const [storeDocument, setStoreDocument] = useState('')
  const [phone, setPhone] = useState(user?.phone || '')
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [saving, setSaving] = useState(false)

  const handleFinish = async (skip: boolean | React.MouseEvent = false) => {
    const isSkip = typeof skip === 'boolean' ? skip : false
    setSaving(true)
    try {
      const updates: Record<string, unknown> = {
        onboarding_completed: true,
      }

      if (!isSkip) {
        updates.full_name = fullName || user?.full_name
        updates.phone = phone || user?.phone

        if (accountType === 'pessoa_fisica') {
          updates.account_type = 'pessoa_fisica'
        } else {
          updates.account_type = storeType
          updates.store_type = storeType
          updates.store_name = storeName
          updates.store_document = storeDocument
          updates.store_status = 'approved' // Auto-approve store for instant testing
          updates.is_verified = true
          updates.store_requested_at = new Date().toISOString()

          // Automatically register tenant in tenants table if store
          await supabase
            .from('tenants')
            .insert({
              name: storeName || 'Loja Automotiva JDM',
              slug: (storeName || 'loja').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              contact_email: user?.email || 'vendedor@daig.jp',
              contact_phone: phone,
              plan_type: 'pro',
              is_active: true
            })
        }
      } else {
        updates.account_type = 'pessoa_fisica'
      }

      let { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id)

      if (error && (error.code === 'PGRST303' || error.message?.includes('JWT expired'))) {
        const { data: refreshed } = await supabase.auth.refreshSession()
        if (refreshed?.session) {
          await supabase.from('profiles').update(updates).eq('id', user?.id)
        }
      }

      await updateProfile({ ...updates, onboarding_completed: true } as any)
      setStep(3)
    } catch (err) {
      console.error('Onboarding save error:', err)
      setStep(3)
    } finally {
      setSaving(false)
    }
  }

  const goToDashboard = () => {
    if (accountType === 'empresa' || user?.role === 'seller' || storeType) {
      navigate('/tenant-dashboard', { replace: true })
    } else {
      navigate('/catalog', { replace: true })
    }
  }

  // ═══ STEP 0: WELCOME SCREEN ═══
  if (step === 0) {
    return (
      <OnboardingLayout currentStep={0}>
        <div className="w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-sky-500 p-0.5 shadow-2xl shadow-emerald-500/20 mx-auto">
              <div className="w-full h-full bg-[#121215] rounded-[22px] flex items-center justify-center">
                <GaidLogo size={42} />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-500 text-zinc-950 font-black text-[10px] rounded-full shadow">
              PRO
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Bem-vindo à DAIG.jp 🎉
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              O maior ecossistema de marketplace, repasses Stripe e peças automotivas JDM do Japão.
            </p>
          </div>

          {/* Action cards preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto pt-2">
            <div className="bg-[#121215] border border-zinc-800 p-4 rounded-2xl space-y-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                🛒
              </div>
              <h4 className="font-bold text-xs text-white">Comprar Peças JDM</h4>
              <p className="text-[11px] text-zinc-500">Encontre componentes originais com garantia Escrow.</p>
            </div>

            <div className="bg-[#121215] border border-zinc-800 p-4 rounded-2xl space-y-1">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                🏢
              </div>
              <h4 className="font-bold text-xs text-white">Vender & Criar Loja B2B</h4>
              <p className="text-[11px] text-zinc-500">Gerencie estoque privado e receba em ienes (JPY).</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setStep(1)}
              className="w-full max-w-md py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
            >
              <span>Começar Configuração da Conta</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </OnboardingLayout>
    )
  }

  // ═══ STEP 1: ACCOUNT TYPE ═══
  if (step === 1) {
    return (
      <OnboardingLayout currentStep={1}>
        <div className="w-full space-y-6 animate-in fade-in duration-300">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Como você usará a plataforma?
            </h1>
            <p className="text-xs text-zinc-400">
              Escolha a modalidade de conta que melhor define suas atividades.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Option 1: Pessoa Física */}
            <div
              onClick={() => { setAccountType('pessoa_fisica'); setStep(2); }}
              className={`p-6 bg-[#121215] border rounded-2xl cursor-pointer transition-all hover:border-blue-500/50 group relative overflow-hidden ${
                accountType === 'pessoa_fisica' ? 'border-blue-500 bg-blue-500/[0.04]' : 'border-zinc-800'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Pessoa Física</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Para entusiastas, compradores e mecânicos que desejam comprar peças JDM ou realizar vendas ocasionais.
              </p>
              <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                Selecionar Perfil <ChevronRight size={12} />
              </span>
            </div>

            {/* Option 2: Empresa / Parceiro B2B */}
            <div
              onClick={() => { setAccountType('empresa'); setStep(2); }}
              className={`p-6 bg-[#121215] border rounded-2xl cursor-pointer transition-all hover:border-emerald-500/50 group relative overflow-hidden ${
                accountType === 'empresa' ? 'border-emerald-500 bg-emerald-500/[0.04]' : 'border-zinc-800'
              }`}
            >
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold rounded">
                RECOMENDADO PARCEIROS
              </span>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Empresa / Loja B2B</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Para oficinas, desmanches, lojas de autopeças e importadoras com gestão de estoque e repasses Stripe.
              </p>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                Criar Loja B2B <ChevronRight size={12} />
              </span>
            </div>

          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <button onClick={() => setStep(0)} className="text-zinc-500 hover:text-white transition">
              ← Voltar
            </button>
          </div>

        </div>
      </OnboardingLayout>
    )
  }

  // ═══ STEP 2: DETAILS & STORE CONFIG ═══
  if (step === 2) {
    const isEmpresa = accountType === 'empresa'

    return (
      <OnboardingLayout currentStep={2}>
        <div className="w-full space-y-5 animate-in fade-in duration-300">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isEmpresa ? 'Configuração da Loja B2B' : 'Dados do Seu Perfil'}
            </h1>
            <p className="text-xs text-zinc-400">
              {isEmpresa ? 'Preencha os dados da sua empresa para ativar o estoque SaaS no Japão.' : 'Confirme suas informações para personalizar sua experiência.'}
            </p>
          </div>

          <div className="bg-[#121215] border border-zinc-800 p-6 rounded-2xl space-y-4 shadow-xl">
            
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Nome do Responsável / Proprietário *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Kenji Sato"
                className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-white outline-none"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Telefone de Contato (Japão) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090-0000-0000"
                className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-white outline-none font-mono"
              />
            </div>

            {isEmpresa && (
              <>
                {/* Tipo de Loja */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Categoria do Negócio Automotivo *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STORE_TYPES.map((st) => {
                      const Icon = st.icon
                      const isSel = storeType === st.id
                      return (
                        <div
                          key={st.id}
                          onClick={() => setStoreType(st.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                            isSel ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <Icon size={16} style={{ color: st.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{st.label}</p>
                            <p className="text-[10px] text-zinc-500 truncate">{st.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Nome da Loja */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Nome da Loja / Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Tokyo Performance Parts JDM"
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                {/* CNPJ / Registro */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Registro Comercial / Licença Kotto-sho (Japão) *</label>
                  <input
                    type="text"
                    required
                    value={storeDocument}
                    onChange={(e) => setStoreDocument(e.target.value)}
                    placeholder="Ex: 301042398402 (Registro de Antiguidades Peças)"
                    className="w-full px-3.5 py-2.5 bg-[#18181b] border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>

                {/* Information banner about Stripe Connect */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-start gap-2">
                  <Landmark size={15} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Ativação do Stripe Connect</span>
                    Para receber pagamentos diretamente na sua conta bancária japonesa, você poderá configurar sua conta Stripe no painel após a conclusão.
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-[#18181b] hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => handleFinish(false)}
                disabled={saving || (isEmpresa && (!storeName || !storeDocument))}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{saving ? 'Salvando...' : isEmpresa ? 'Concluir & Criar Loja B2B 🚀' : 'Concluir Onboarding 🚀'}</span>
              </button>
            </div>

          </div>

        </div>
      </OnboardingLayout>
    )
  }

  // ═══ STEP 3: SUCCESS & DASHBOARD LINK ═══
  return (
    <OnboardingLayout currentStep={3}>
      <div className="w-full text-center space-y-6 animate-in fade-in duration-300">
        
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Tudo Pronto & Configurado! 🚀
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            {accountType === 'empresa' 
              ? `Sua loja B2B ${storeName || ''} foi criada com sucesso no sistema. Você pode cadastrar peças e ativar os repasses Stripe Connect.`
              : 'Seu perfil foi configurado. Explore o catálogo de peças JDM ou comece a comprar com custódia Escrow.'}
          </p>
        </div>

        {/* Notice for Stripe Connect Onboarding */}
        {accountType === 'empresa' && (
          <div className="bg-[#121215] border border-emerald-500/30 p-4 rounded-2xl text-left space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Landmark size={14} />
              <span>Configuração da Conta Bancária Japão (Stripe Connect)</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Acesse a guia <strong>"Conta Bancária / Stripe"</strong> no seu painel para ativar os repasses em ienes (JPY) via <code className="text-emerald-300 bg-black px-1 rounded">dashboard.stripe.com/connect</code>.
            </p>
          </div>
        )}

        <div className="pt-4 max-w-md mx-auto space-y-3">
          <button
            onClick={goToDashboard}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl transition shadow-xl shadow-emerald-500/20 text-sm flex items-center justify-center gap-2"
          >
            <span>{accountType === 'empresa' ? 'Acessar Painel da Loja B2B' : 'Ir para o Catálogo JDM'}</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </OnboardingLayout>
  )
}
