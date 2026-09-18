import { useState, useRef } from 'react'
import { Link } from 'react-router'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { handleSupabaseError } from '@/modules/shared/lib/supabaseErrorHandler'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'
import GaidLogo from '@/modules/shared/components/GaidLogo'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function Login() {
  const { t } = useI18n()
  const { signIn, signInGoogle } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await signIn(email, password)
    } catch (err: any) {
      const errorMsg = err.message || ''
      if (errorMsg.includes('Email not confirmed') || errorMsg.includes('email_not_confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada ou use outro email.')
      } else {
        setError(handleSupabaseError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const cardRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!cardRef.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    gsap.from(cardRef.current, { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', clearProps: 'transform' })
    gsap.from(cardRef.current.querySelectorAll('.login-field'), { y: 12, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.15, clearProps: 'transform' })
  }, { scope: cardRef })

  const handleGoogleLogin = async () => {
    try {
      try { (navigator as any).vibrate?.(10) } catch {}
      await signInGoogle()
    } catch (err: any) {
      setError(handleSupabaseError(err))
    }
  }

  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Premium ambient — mantém tokens void/blue */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[120px] opacity-[0.12]" style={{ background: '#0D75FF' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.07]" style={{ background: '#7000FF' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div ref={cardRef} className="glass-ultra rounded-[24px] p-8 sm:p-10 shadow-2xl">
          <div className="flex justify-center mb-6">
            <GaidLogo size={52} variant="horizontal" />
          </div>

          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold text-white mb-1.5">
              {t('Entrar')}
            </h1>
            <p className="text-zinc-400 text-sm">
              {t('Acesse sua conta DAIG')}
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="login-field w-full bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50 mb-6 shadow-md active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{t('Continuar com Google')}</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs text-zinc-400 uppercase tracking-widest">
              <span className="px-3 bg-zinc-900 text-zinc-400">{t('ou')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="login-field bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="login-field">
              <label className="block text-white/70 text-sm font-medium mb-1.5">{t('Email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#06080F] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 transition-all text-sm"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label className="block text-white/70 text-sm font-medium mb-1.5">{t('Senha')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-[#06080F] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/30 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="login-field flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-[#06080F] text-[#0D75FF] focus:ring-0" />
                <span className="text-white/50 text-sm">{t('Lembrar-me')}</span>
              </label>
              <a href="#" className="text-[#00E5FF] text-sm hover:underline">
                {t('Esqueceu a senha?')}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-field w-full bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] hover:opacity-90 text-white py-3.5 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(13,117,255,0.35)] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? t('Entrando...') : t('Entrar')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center space-y-4">
            <p className="text-zinc-400 text-sm">
              {t('Não tem conta?')}{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium underline">
                {t('Cadastrar')}
              </Link>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-zinc-400">
              <Link to="/terms" className="hover:text-white transition-colors underline">
                {t('Termos de Uso')}
              </Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-white transition-colors underline">
                {t('Política de Privacidade')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}