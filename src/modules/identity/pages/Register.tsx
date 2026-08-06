import { useState } from 'react'
import { Link } from 'react-router'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { handleSupabaseError, isRateLimitError } from '@/modules/shared/lib/supabaseErrorHandler'
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'
import GaidLogo from '@/modules/shared/components/GaidLogo'

export default function Register() {
  const { t } = useI18n()
  const { signUp, signInGoogle } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
      })
      setSuccess(true)
    } catch (err: any) {
      console.error('Erro completo:', err)
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      
      if (isRateLimitError(err)) {
        setRetryCount(prev => prev + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(13,117,255,0.15) 0%, rgba(112,0,255,0.05) 50%, transparent 80%)' }} />

        <div className="w-full max-w-md relative z-10 text-center">
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex justify-center">
              <GaidLogo size={48} variant="horizontal" />
            </div>

            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
              <Mail className="w-8 h-8" />
            </div>

            <h1 className="font-display text-2xl font-bold text-white">
              {t('Verifique seu e-mail')}
            </h1>

            <p className="text-zinc-400 text-sm leading-relaxed">
              {t('Enviamos um link de confirmação para')} <strong className="text-white font-semibold">{formData.email}</strong>. 
              {t('Por favor, verifique sua caixa de entrada para confirmar o cadastro e começar a utilizar a plataforma.')}
            </p>

            <div className="pt-2">
              <Link 
                to="/login" 
                className="w-full inline-block text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25"
              >
                {t('Ir para o Login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
              {t('Criar Conta')}
            </h1>
            <p className="text-zinc-400 text-sm">
              {t('Junte-se ao maior marketplace JDM do Japão')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{error}</p>
                  {isRateLimitError({ message: error }) && retryCount > 0 && (
                    <p className="text-xs mt-1 opacity-70">
                      Tentativas: {retryCount}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">{t('Nome completo')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder={t('Seu nome')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">{t('Email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">{t('Telefone (opcional)')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">{t('Senha')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                  minLength={6}
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

            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">{t('Confirmar senha')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50"
            >
              {loading ? t('Criando conta...') : t('Criar Conta')}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs text-zinc-400 uppercase tracking-widest">
                <span className="px-3 bg-zinc-900 text-zinc-400">{t('Ou continue com')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signInGoogle()}
              disabled={loading}
              className="w-full bg-zinc-800 hover:bg-zinc-700/90 text-white border border-zinc-700/70 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-md hover:scale-[1.01]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center space-y-4">
            <p className="text-zinc-400 text-sm">
              {t('Já tem conta?')}{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium underline">
                {t('Entrar')}
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