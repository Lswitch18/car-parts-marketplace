import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { handleSupabaseError } from '@/modules/shared/lib/supabaseErrorHandler'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'
import GaidLogo from '@/modules/shared/components/GaidLogo'

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

  const handleGoogleLogin = async () => {
    try {
      await signInGoogle()
    } catch (err: any) {
      setError(handleSupabaseError(err))
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(13,117,255,0.15) 0%, rgba(112,0,255,0.05) 50%, transparent 80%)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
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
            className="w-full bg-zinc-800 hover:bg-zinc-700/90 text-white border border-zinc-700/70 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50 mb-6 shadow-md hover:scale-[1.01]"
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
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">{t('Email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">{t('Senha')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-0" />
                <span className="text-zinc-400 text-sm">{t('Lembrar-me')}</span>
              </label>
              <a href="#" className="text-blue-400 text-sm hover:underline">
                {t('Esqueceu a senha?')}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50"
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