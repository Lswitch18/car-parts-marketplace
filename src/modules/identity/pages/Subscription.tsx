import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { useI18n } from '@/modules/shared/lib/i18n'
import { Sparkles, CheckCircle, ChevronRight, ShieldCheck, Zap, Globe } from 'lucide-react'

export default function Subscription() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubscribe = async () => {
    setProcessing(true)
    try {
      // Mock payment simulation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const updates = {
        store_verified: true,
        store_status: 'approved',
        store_approved_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id)

      if (error) throw error

      await updateProfile(updates as any)
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)

    } catch (err) {
      console.error('Subscription error:', err)
      alert(t('Ocorreu um erro ao processar a assinatura.'))
    } finally {
      setProcessing(false)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-[#0D75FF]/20 text-[#0D75FF] rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(13,117,255,0.4)]">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white">{t('Empresa Validada!')}</h2>
          <p className="text-text-secondary text-lg">
            {t('Bem-vindo ao DAIG Premium. Agora você tem acesso a publicações ilimitadas.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col pt-24 pb-12">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#0D75FF]/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7000FF]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 w-full relative z-10 flex-1 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(13,117,255,0.1)', border: '1px solid rgba(13,117,255,0.2)' }}>
            <Sparkles className="w-4 h-4 text-[#0D75FF]" />
            <span className="text-sm font-semibold text-[#0D75FF] tracking-widest uppercase">DAIG for Business</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
            Venda sem limites com o <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D75FF] to-[#7000FF]">Plano Premium</span>
          </h1>
          <p className="text-xl text-text-secondary">
            {t('Você atingiu o limite de 20 anúncios de teste. Assine o plano Premium para validar sua empresa e vender para milhares de entusiastas JDM todos os dias.')}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="w-full max-w-lg rounded-3xl p-1 relative overflow-hidden group">
          {/* Animated Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D75FF] via-[#7000FF] to-[#0D75FF] opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundSize: '200% 200%', animation: 'gradient-xy 3s ease infinite' }} />
          
          <div className="relative bg-[#0A0A0F] rounded-[22px] p-8 md:p-10 h-full">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Plano Pro</h3>
                <p className="text-text-secondary">Acesso total e verificação</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-text-secondary">¥</span>
                  <span className="text-4xl font-bold text-white">4.500</span>
                </div>
                <span className="text-sm text-text-secondary">/mês</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              {[
                { icon: Zap, text: 'Anúncios de peças ilimitados' },
                { icon: ShieldCheck, text: 'Selo de Empresa Verificada' },
                { icon: Globe, text: 'Destaque nas buscas de peças' },
                { icon: Sparkles, text: 'Suporte prioritário 24/7' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80">
                  <div className="w-8 h-8 rounded-full bg-[#0D75FF]/10 text-[#0D75FF] flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubscribe}
              disabled={processing}
              className="w-full relative group overflow-hidden rounded-xl font-semibold text-white text-lg transition-all flex items-center justify-center gap-2 h-14"
              style={{
                background: 'linear-gradient(135deg, #0D75FF 0%, #7000FF 100%)',
                boxShadow: '0 0 30px rgba(13,117,255,0.3)',
              }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              
              <span className="relative z-10 flex items-center gap-2">
                {processing ? t('Processando Pagamento...') : t('Assinar e Validar Empresa')}
                {!processing && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
            <p className="text-center text-xs text-text-secondary mt-4">
              {t('O pagamento (R$ 150) será convertido e cobrado na sua moeda local.')}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
