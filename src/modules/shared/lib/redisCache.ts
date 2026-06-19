/**
 * Upstash Redis REST Client
 * Utiliza o fetch nativo para evitar dependências pesadas no bundle.
 */

const REDIS_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN

export async function getCache(key: string): Promise<any | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null

  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    })
    
    if (!res.ok) return null
    const json = await res.json()
    
    if (json.result) {
      // O Upstash retorna a string do JSON, então precisamos fazer o parse
      return JSON.parse(json.result)
    }
    return null
  } catch (error) {
    console.warn('Redis Cache Miss (Error):', error)
    return null
  }
}

export async function setCache(key: string, value: any, expiresInSeconds: number = 3600): Promise<void> {
  if (!REDIS_URL || !REDIS_TOKEN) return

  try {
    const stringValue = JSON.stringify(value)
    
    await fetch(`${REDIS_URL}/`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      // Usando o comando Redis nativo via REST
      body: JSON.stringify(['SET', key, stringValue, 'EX', expiresInSeconds])
    })
  } catch (error) {
    console.warn('Redis Cache Set Error:', error)
  }
}
