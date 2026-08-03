import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useI18n } from '@/modules/shared/lib/i18n'
import GaidLogo from '@/modules/shared/components/GaidLogo'

export default function SaasGatewayPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [rememberPreference, setRememberPreference] = useState(false)

  const handleSelectDestination = (route: string) => {
    if (rememberPreference && user?.id) {
      try {
        localStorage.setItem(`daig_preferred_gateway_${user.id}`, route)
      } catch (err) {
        console.warn('Erro ao salvar preferência no cache:', err)
      }
    }
    navigate(route, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Glow Backdrop Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0D75FF]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto space-y-8 relative z-10 animate-in fade-in duration-500">
        
        {/* Header / Logo Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <GaidLogo className="h-10 text-cyan-400" />
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-300 bg-blue-500/10 border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <span>{t('Portal de Acesso Parceiro DAIG')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {t('Olá, ')} <span className="bg-gradient-to-r from-[#0D75FF] via-cyan-400 to-[#00E5FF] bg-clip-text text-transparent">{user?.name || user?.full_name || 'Parceiro SaaS'}</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {t('Escolha o ambiente de trabalho que deseja acessar neste momento:')}
          </p>
        </div>

        {/* 21st.dev Modern Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Card 1: AI Auto Parts & SaaS WMS Hub (Sem Ícones) */}
          <div className="group relative bg-gradient-to-b from-[#0B0E17] to-[#0A0D14] border border-blue-500/40 hover:border-[#00E5FF] rounded-3xl p-7 shadow-[0_0_35px_rgba(13,117,255,0.2)] backdrop-blur-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-[#00E5FF]/40 uppercase tracking-wider">
                {t('SaaS Operacional')}
              </span>
            </div>

            <div className="space-y-5 pt-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {t('AI Auto Parts & WMS')}
                </h2>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {t('Gestão inteligente de desmanche, inventário com QR Code, Ordens de Serviço da oficina, Kanban, Visão Computacional e API B2B.')}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="text-xs text-zinc-300 font-medium">
                  • {t('ERP de Desmanche JDM & Estoque WMS')}
                </div>
                <div className="text-xs text-zinc-300 font-medium">
                  • {t('Ordens de Serviço (Oficina) & Kanban')}
                </div>
                <div className="text-xs text-zinc-300 font-medium">
                  • {t('Chave de Publicação 1-Clique no Marketplace')}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <button
                type="button"
                onClick={() => handleSelectDestination('/tenant-dashboard')}
                className="w-full min-h-[48px] bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-[0_0_25px_rgba(13,117,255,0.4)] border border-[#00E5FF]/40 flex items-center justify-center cursor-pointer active:scale-95"
              >
                <span>{t('Acessar AI Auto Parts')}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Marketplace DAIG Central */}
          <div className="group relative bg-gradient-to-b from-[#0B0E17] to-[#0A0D14] border border-blue-500/40 hover:border-cyan-400 rounded-3xl p-7 shadow-[0_0_35px_rgba(0,229,255,0.15)] backdrop-blur-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-cyan-300 border border-blue-500/40 uppercase tracking-wider">
                {t('Loja & Leilões')}
              </span>
            </div>

            <div className="space-y-5 pt-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {t('Marketplace Central')}
                </h2>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {t('Explorar peças do mercado, adquirir itens genuínos de desmanches homologados no Japão e participar de leilões ao vivo.')}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="text-xs text-zinc-300 font-medium">
                  • {t('Catálogo Completo de Peças JDM')}
                </div>
                <div className="text-xs text-zinc-300 font-medium">
                  • {t('Leilões JDM & Compra Direta')}
                </div>
                <div className="text-xs text-zinc-300 font-medium">
                  • {t('Checkout Seguro com Stripe Connect')}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4">
              <button
                type="button"
                onClick={() => handleSelectDestination('/catalog')}
                className="w-full min-h-[48px] bg-[#06080F] hover:bg-blue-950/40 text-cyan-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition border border-blue-500/40 hover:border-[#00E5FF] flex items-center justify-center cursor-pointer active:scale-95 shadow-lg"
              >
                <span>{t('Acessar Marketplace Central')}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Preference Checkbox Footer */}
        <div className="flex items-center justify-center space-x-3 pt-2 text-xs text-zinc-400">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberPreference}
              onChange={(e) => setRememberPreference(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-800 bg-[#06080F] text-[#0D75FF] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>{t('Lembrar minha preferência de navegação neste dispositivo')}</span>
          </label>
        </div>

      </div>
    </div>
  )
}
