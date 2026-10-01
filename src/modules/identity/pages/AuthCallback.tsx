import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '@/modules/shared/lib/supabase'
import { consumePostLoginPath } from '@/modules/shared/lib/webAuth'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useI18n } from '@/modules/shared/lib/i18n'
import BrandLoader from '@/modules/shared/components/BrandLoader'

/**
 * /auth/callback — destino canônico de TODO OAuth web (Google/Apple).
 * Troca ?code= pela sessão de forma explícita (sem depender de timing
 * de auto-detect), restaura o perfil e navega. Sem isso o app pousava em
 * "/" sem sessão e era empurrado para a tela de senha.
 */
export default function AuthCallback() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    ;(async () => {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code)
          if (exErr) throw exErr
        } else {
          // Fluxo implícito legado (#access_token) ou sessão já detectada
          const { data, error: sessErr } = await supabase.auth.getSession()
          if (sessErr) throw sessErr
          if (!data.session) throw new Error('auth-callback-no-session')
        }
        const ok = await useAuthStore.getState().ensureSession()
        if (!ok) throw new Error('auth-callback-no-session')
        navigate(consumePostLoginPath(), { replace: true })
      } catch (err) {
        console.error('[AuthCallback] falha ao concluir login:', err)
        setError(t('Não foi possível concluir o login. Tente novamente.'))
      }
    })()
  }, [navigate, t])

  if (error) {
    return (
      <div className="min-h-screen bg-[#060B14] flex items-center justify-center px-4">
        <div className="glass-ultra rounded-[24px] p-8 max-w-md w-full text-center space-y-4">
          <p className="text-white font-semibold">{error}</p>
          <Link to="/login" className="inline-block bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] text-white py-3 px-8 rounded-xl font-semibold">
            {t('Ir para o Login')}
          </Link>
        </div>
      </div>
    )
  }

  return <BrandLoader text={t('Concluindo login...')} />
}
