import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { handleSupabaseError, isRateLimitError } from '@/modules/shared/lib/supabaseErrorHandler'
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'

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
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="card p-8 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-text">
              {t('Verifique seu e-mail')}
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t('Enviamos um link de confirmação para')} <strong className="text-text font-bold">{formData.email}</strong>. 
              {t('Por favor, verifique sua caixa de entrada (e pasta de spam) para confirmar o cadastro e começar a utilizar a plataforma.')}
            </p>
            <div className="pt-2">
              <Link 
                to="/login" 
                className="w-full inline-block text-center bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors"
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-text mb-2">
            {t('Criar Conta')}
          </h1>
          <p className="text-text-secondary">
            {t('Junte-se ao maior marketplace JDM do Japão')}
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
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
              <label className="block text-text-secondary text-sm mb-2">{t('Nome completo')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                  placeholder={t('Seu nome')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('Email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('Telefone (opcional)')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('Senha')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('Confirmar senha')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-secondary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? t('Criando conta...') : t('Criar Conta')}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-text-secondary">{t('Ou continue com')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signInGoogle()}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>

          <p className="text-center text-text-secondary mt-6">
            {t('Já tem conta?')}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t('Entrar')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}