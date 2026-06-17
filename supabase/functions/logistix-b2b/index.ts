/**
 * Logistix B2B API
 * API pública para integração com parceiros externos
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface B2BApiKey {
  id: string
  partner_name: string
  partner_email: string
  api_key_prefix: string
  scopes: string[]
  is_active: boolean
  partner_carrier?: string | null
  partner_warehouse_id?: string | null
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

function error(message: string, status = 400) {
  return json({ success: false, error: message }, status)
}

// Simple fetch wrapper for Supabase
async function supabaseFetch(endpoint: string, options: any = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      ...options.headers
    }
  })
  const data = await response.json()
  return { data, error: response.ok ? null : data, response }
}

async function validateApiKey(apiKey: string): Promise<{ valid: boolean; apiKey?: B2BApiKey; error?: string }> {
  if (!apiKey) {
    return { valid: false, error: 'API key não fornecida. Use header x-api-key' }
  }

  const prefix = apiKey.substring(0, 8)
  const { data, error: fetchError } = await supabaseFetch(
    `b2b_api_keys?api_key_prefix=eq.${prefix}&is_active=eq.true&select=*`
  )

  if (fetchError || !data || data.length === 0) {
    return { valid: false, error: 'API key inválida ou inativa' }
  }

  const hash = await hashString(apiKey)
  if (data[0].api_key_hash !== hash) {
    return { valid: false, error: 'API key inválida ou inativa' }
  }

  return { valid: true, apiKey: data[0] }
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'lk_'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function logRequest(
  apiKeyId: string | null,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  ip: string | null,
  ua: string | null
) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/b2b_request_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        api_key_id: apiKeyId,
        endpoint,
        method,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
        ip_address: ip,
        user_agent: ua
      })
    })
  } catch (err) {
    console.error('[Logistix B2B] Logging failed:', err)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  const startTime = Date.now()
  let apiKeyId: string | null = null
  const url = new URL(req.url)
  const path = url.pathname.includes('/logistix-b2b') 
    ? url.pathname.split('/logistix-b2b')[1] 
    : url.pathname
  const method = req.method
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  const ua = req.headers.get('user-agent') || ''

  const send = async (res: Response) => {
    const duration = Date.now() - startTime
    if (path !== '/health' && path !== '' && path !== '/') {
      await logRequest(apiKeyId, path, method, res.status, duration, ip, ua)
    }
    return res
  }

  try {
    console.log('Full pathname:', url.pathname, 'Extracted path:', path)

    // Health check - PUBLIC (no auth required)
    if (path === '/health' || path === '' || path === '/') {
      return send(json({
        status: 'healthy',
        service: 'Logistix B2B API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }))
    }

    // Auth endpoint - PUBLIC (no key required)
    if (path === '/auth/token') {
      if (req.method !== 'POST') {
        return send(error('Método não permitido', 405))
      }

      const body = await req.json()
      const { partner_name, partner_email, partner_carrier, partner_warehouse_id } = body

      if (!partner_name || !partner_email) {
        return send(error('partner_name e partner_email são obrigatórios'))
      }

      const apiKey = generateApiKey()
      const prefix = apiKey.substring(0, 8)
      const keyHash = await hashString(apiKey)

      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/b2b_api_keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          partner_name,
          partner_email,
          api_key_hash: keyHash,
          api_key_prefix: prefix,
          scopes: ['read'],
          rate_limit: 100,
          is_active: true,
          partner_carrier: partner_carrier || null,
          partner_warehouse_id: partner_warehouse_id || null
        })
      })

      const insertData = await insertResponse.json()
      console.log('Insert result:', { status: insertResponse.status, data: insertData })

      if (!insertResponse.ok) {
        return send(error('Erro ao criar API key: ' + JSON.stringify(insertData)))
      }

      return send(json({
        success: true,
        api_key: apiKey,
        prefix: prefix,
        message: 'Guarde esta API key - não será possível recuperá-la'
      }))
    }

    // Validate API key for PROTECTED routes (orders, shipments, inventory, webhooks)
    const apiKeyHeader = req.headers.get('x-api-key')
    const auth = await validateApiKey(apiKeyHeader || '')
    
    if (!auth.valid) {
      return send(error(auth.error || 'Unauthorized', 401))
    }

    apiKeyId = auth.apiKey?.id || null

    // Orders endpoints (protected)
    if (path.startsWith('/orders')) {
      const orderId = path.split('/').filter(Boolean)[1]

      if (!orderId || req.method === 'GET') {
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const status = url.searchParams.get('status')
        const offset = (page - 1) * limit

        // Data isolation by carrier
        let pedidoIds: string[] = []
        if (auth.apiKey?.partner_carrier) {
          const carrier = auth.apiKey.partner_carrier
          const { data: shipments } = await supabaseFetch(
            `admin_shipments?transportadora=eq.${encodeURIComponent(carrier)}&select=pedido_id`
          )
          pedidoIds = (shipments || []).map((s: any) => s.pedido_id).filter(Boolean)
          
          if (pedidoIds.length === 0) {
            return send(json({ success: true, data: [] }))
          }
        }

        let query = `admin_pedidos?order=created_at.desc&offset=${offset}&limit=${limit}`
        if (status) {
          query += `&status=eq.${status}`
        }
        if (auth.apiKey?.partner_carrier) {
          query += `&id=in.(${pedidoIds.join(',')})`
        }

        const { data, error: fetchError } = await supabaseFetch(query)

        if (fetchError) {
          return send(error('Erro ao buscar pedidos: ' + JSON.stringify(fetchError)))
        }

        return send(json({ success: true, data: data || [] }))
      }

      // Get single order
      const { data, error: fetchError } = await supabaseFetch(`admin_pedidos?id=eq.${orderId}`)
      
      if (fetchError || !data || data.length === 0) {
        return send(error('Pedido não encontrado', 404))
      }

      // Enforce carrier scope check for single order detail
      if (auth.apiKey?.partner_carrier) {
        const carrier = auth.apiKey.partner_carrier
        const { data: belongs } = await supabaseFetch(
          `admin_shipments?pedido_id=eq.${orderId}&transportadora=eq.${encodeURIComponent(carrier)}&select=id`
        )
        if (!belongs || belongs.length === 0) {
          return send(error('Acesso não autorizado a este pedido', 403))
        }
      }

      // Get tracking
      const { data: rastreamento } = await supabaseFetch(
        `admin_rastreamento?pedido_id=eq.${orderId}&order=created_at.asc`
      )

      return send(json({ success: true, data: { ...data[0], rastreamento: rastreamento || [] } }))
    }

    // Shipments
    if (path.startsWith('/shipments')) {
      let query = 'admin_shipments?select=*,pedido:admin_pedidos!pedido_id(*)'
      if (auth.apiKey?.partner_carrier) {
        query += `&transportadora=eq.${encodeURIComponent(auth.apiKey.partner_carrier)}`
      }
      const { data } = await supabaseFetch(query)
      return send(json({ success: true, data: data || [] }))
    }

    // Inventory
    if (path.startsWith('/inventory')) {
      const warehouseId = url.searchParams.get('warehouse_id')
      const targetWarehouseId = auth.apiKey?.partner_warehouse_id || warehouseId
      
      if (auth.apiKey?.partner_warehouse_id && warehouseId && warehouseId !== auth.apiKey.partner_warehouse_id) {
        return send(error('Não autorizado a acessar este centro de distribuição', 403))
      }

      let query = 'admin_armazens?select=*'
      if (targetWarehouseId) {
        query = `admin_armazens?id=eq.${targetWarehouseId}&select=*`
      }
      
      const { data } = await supabaseFetch(query)
      
      const enriched = (data || []).map((wh: any) => ({
        id: wh.id,
        nome: wh.nome,
        cidade: wh.cidade,
        estado: wh.estado,
        capacidade: wh.capacidade,
        ocupacao: wh.ocupacao,
        ocupacao_percent: wh.capacidade > 0 ? Math.round((wh.ocupacao / wh.capacidade) * 100) : 0
      }))

      return send(json({ success: true, data: enriched }))
    }

    // Webhooks
    if (path.startsWith('/webhooks')) {
      if (req.method === 'GET') {
        const { data } = await supabaseFetch(
          `b2b_webhooks?api_key_id=eq.${auth.apiKey?.id}&is_active=eq.true`
        )
        return send(json({ success: true, data: data || [] }))
      }

      if (req.method === 'POST') {
        const body = await req.json()
        const { webhook_url, events } = body

        if (!webhook_url || !events || events.length === 0) {
          return send(error('webhook_url e events são obrigatórios'))
        }

        try {
          new URL(webhook_url)
        } catch {
          return send(error('URL de webhook inválida'))
        }

        const { data } = await supabaseFetch('b2b_webhooks', {
          method: 'POST',
          body: JSON.stringify({
            api_key_id: auth.apiKey?.id,
            webhook_url,
            events,
            is_active: true
          })
        })

        return send(json({ success: true, data }))
      }

      if (req.method === 'DELETE') {
        const webhookId = url.searchParams.get('id')
        if (!webhookId) {
          return send(error('ID do webhook é obrigatório'))
        }

        await supabaseFetch(`b2b_webhooks?id=eq.${webhookId}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: false })
        })

        return send(json({ success: true, message: 'Webhook removido' }))
      }
    }

    return send(error('Endpoint não encontrado', 404))

  } catch (err) {
    console.error('[Logistix B2B] Error:', err)
    return send(error('Erro interno do servidor', 500))
  }
})