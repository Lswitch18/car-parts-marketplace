import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import JapanBankForm from '@/modules/backoffice/components/JapanBankForm'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function JapanBankAccount() {
  const navigate = useNavigate()
  const { user, initialized, loading: authLoading } = useAuthStore()

  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-x-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <Link
            to="/profile"
            className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Perfil
          </Link>

          <span className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CONFIGURAÇÕES DE REPASSE JPY (FURIKOMI)</span>
          </span>
        </div>

        {/* Form & Overview Component */}
        <JapanBankForm />

      </div>
    </div>
  )
}
