const RATE_LIMIT_ERRORS: Record<string, string> = {
  '429': 'Muitas solicitações. Tente novamente em alguns minutos.',
  'PGRST301': 'Rate limit excedido. Aguarde um momento.',
  'email rate limit': 'Limite de email excedido. Use outro email ou aguarde.'
}

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

function sanitizeMessage(msg: string): string {
  return msg.replace(/https?:\/\/[^\s'"]+/g, '[URL OCULTA]')
}

export function handleSupabaseError(error: any): string {
  console.error('Supabase Error:', error)

  if (!error) {
    return 'Erro desconhecido. Tente novamente.'
  }

  let errorMessage = error.message || error.error_description || String(error)
  const errorCode = error.code || ''
  const statusCode = error.status || error.statusCode

  errorMessage = sanitizeMessage(errorMessage)

  for (const [key, message] of Object.entries(RATE_LIMIT_ERRORS)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase()) || 
        errorCode.toLowerCase().includes(key.toLowerCase())) {
      console.warn('Rate limit detectado:', key)
      return message
    }
  }

  if (statusCode === 429) {
    return 'Muitas solicitações. Tente novamente em alguns minutos.'
  }

  if (statusCode === 500) {
    return 'Erro no servidor. Tente novamente mais tarde.'
  }

  if (statusCode === 503) {
    return 'Serviço temporariamente indisponível. Tente novamente mais tarde.'
  }

  return errorMessage || 'Erro ao processar solicitação. Tente novamente.'
}

export function isRateLimitError(error: any): boolean {
  const errorMessage = error?.message || ''
  const statusCode = error?.status || error?.statusCode
  
  return (
    statusCode === 429 ||
    errorMessage.toLowerCase().includes('rate limit') ||
    errorMessage.toLowerCase().includes('email rate limit') ||
    errorMessage.toLowerCase().includes('too many requests')
  )
}

export function getRetryDelay(error: any): number {
  const errorMessage = error?.message || ''
  
  if (errorMessage.includes('email rate limit')) {
    return 60000
  }
  
  if (errorMessage.includes('rate limit') || error?.status === 429) {
    return 30000
  }
  
  return 0
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      if (isRateLimitError(error)) {
        const delay = getRetryDelay(error)
        if (delay > 0 && attempt < maxRetries - 1) {
          console.log(`Rate limit detectado. Tentando novamente em ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.log(`Erro: ${error.message}. Tentando novamente em ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
    }
  }
  
  throw lastError
}