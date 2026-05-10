import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { handleSupabaseError, isRateLimitError } from '../lib/supabaseErrorHandler'
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export default function Register() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { initialize } = useAuthStore()
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
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone
          }
        }
      })


      
      if (signUpError) {
        if (isRateLimitError(signUpError)) {
          setError(handleSupabaseError(signUpError))
          setLoading(false)
          return
        }
        console.error('Erro no signup:', signUpError)
        throw signUpError
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
        
        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }
      }


      await initialize()
      navigate('/dashboard')
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