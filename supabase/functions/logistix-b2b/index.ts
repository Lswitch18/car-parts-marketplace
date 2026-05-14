/**
 * Logistix B2B API
 * API pública para integração com parceiros externos
 * 
 * Endpoints disponíveis:
 * - POST /b2b/auth/token - Gerar token de acesso
 * - GET /b2b/orders - Listar pedidos
 * - GET /b2b/orders/:id - Detalhar pedido
 * - GET /b2b/shipments - Listar remessas
 * - GET /b2b/shipments/:id - Detalhar remessa
 * - GET /b2b/inventory - Consultar estoque
 * - POST /b2b/webhooks - Registrar webhook
 * - GET /b2b/health - Health check
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hashSha256, generateRandomString } from 'https://esm.sh/@supabase/supabase-js@2/utils'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

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

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Valida API Key e retorna o parceiro
 */
async function validateApiKey(req: Request): Promise<{ valid: boolean; apiKey?: any; error?: string }> {
  const apiKey = req.headers.get('x-api-key')
  
  if (!apiKey) {
    return { valid: false, error: 'API key não fornecida. Use header x-api-key' }
  }

  // Buscar key no banco
  const { data: keyData, error } = await supabase
    .from('b2b_api_keys')
    .select('*')
    .eq('api_key_prefix', apiKey.substring(0, 8))
    .eq('is_active', true)
    .single()

  if (error || !keyData) {
    return { valid: false, error: 'API key inválida ou inativa' }
  }

  // Verificar expiração
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { valid: false, error: 'API key expirada' }
  }

  // Atualizar último uso
  await supabase
    .from('b2b_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id)

  return { valid: true, apiKey: keyData }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/logistix-b2b', '')

    // Health check sem autenticação
    if (path === '/health' || path === '') {
      return json({
        status: 'healthy',
        service: 'Logistix B2B API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      })
    }

    // Auth endpoints
    if (path === '/auth/token') {
      if (req.method !== 'POST') {
        return error('Método não permitido', 405)
      }
      return handleAuthToken(req)
    }

    // Validar API Key para outras rotas
    const auth = await validateApiKey(req)
    if (!auth.valid) {
      return error(auth.error || 'Unauthorized', 401)
    }

    // Log request
    await logRequest(auth.apiKey.id, path, req.method, 200, 0, req)

    // Route handlers
    if (path.startsWith('/orders')) {
      return handleOrders(req, auth.apiKey)
    }
    
    if (path.startsWith('/shipments')) {
      return handleShipments(req, auth.apiKey)
    }
    
    if (path.startsWith('/inventory')) {
      return handleInventory(req, auth.apiKey)
    }
    
    if (path.startsWith('/webhooks')) {
      return handleWebhooks(req, auth.apiKey)
    }

    return error('Endpoint não encontrado', 404)

  } catch (err) {
    console.error('[Logistix B2B] Error:', err)
    return error('Erro interno do servidor', 500)
  }
})

// ============================================================================
// AUTH HANDLERS
// ============================================================================

async function handleAuthToken(req: Request) {
  const body = await req.json()
  const { partner_name, partner_email } = body

  if (!partner_name || !partner_email) {
    return error('partner_name e partner_email são obrigatórios')
  }

  // Gerar API key
  const apiKey = `lk_${generateRandomString(32)}`
  const prefix = apiKey.substring(0, 8)
  
  // Hash da key (armazenar apenas hash)
  const encoder = new TextEncoder()
  const keyData = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  // Criar API key no banco
  const { data, error: insertError } = await supabase
    .from('b2b_api_keys')
    .insert({
      partner_name,
      partner_email,
      api_key_hash: keyHash,
      api_key_prefix: prefix,
      scopes: ['read'],
      rate_limit: 100,
      is_active: true
    })
    .select('id')
    .single()

  if (insertError) {
    return error('Erro ao criar API key: ' + insertError.message)
  }

  return json({
    success: true,
    api_key: apiKey,
    prefix: prefix,
    message: 'Guarde esta API key - não será possível recuperá-la'
  })
}

// ============================================================================
// ORDERS HANDLERS
// ============================================================================

async function handleOrders(req: Request, apiKey: any) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const orderId = pathParts[pathParts.indexOf('orders') + 1]

  // List orders
  if (!orderId || req.method === 'GET') {
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status')
    const offset = (page - 1) * limit

    let query = supabase
      .from('admin_pedidos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, count, error: queryError } = await query

    if (queryError) {
      return error('Erro ao buscar pedidos: ' + queryError.message)
    }

    return json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  }

  // Get single order
  if (orderId) {
    const { data, error: queryError } = await supabase
      .from('admin_pedidos')
      .select('*')
      .eq('id', orderId)
      .single()

    if (queryError || !data) {
      return error('Pedido não encontrado', 404)
    }

    // Get tracking events
    const { data: rastreamento } = await supabase
      .from('admin_rastreamento')
      .select('*')
      .eq('pedido_id', orderId)
      .order('created_at', { ascending: true })

    return json({
      success: true,
      data: {
        ...data,
        rastreamento: rastreamento || []
      }
    })
  }

  return error('Método não permitido', 405)
}

// ============================================================================
// SHIPMENTS HANDLERS
// ============================================================================

async function handleShipments(req: Request, apiKey: any) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const shipmentId = pathParts[pathParts.indexOf('shipments') + 1]

  if (req.method === 'GET' && !shipmentId) {
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Shipments são pedidos com status em_transito ou entregue
    const { data, count, error } = await supabase
      .from('admin_pedidos')
      .select('*', { count: 'exact' })
      .in('status', ['em_transito', 'entregue'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return error('Erro ao buscar remessas: ' + error.message)
    }

    return json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  }

  if (shipmentId) {
    const { data, error } = await supabase
      .from('admin_pedidos')
      .select('*')
      .eq('id', shipmentId)
      .single()

    if (error || !data) {
      return error('Remessa não encontrada', 404)
    }

    return json({ success: true, data })
  }

  return error('Método não permitido', 405)
}

// ============================================================================
// INVENTORY HANDLERS
// ============================================================================

async function handleInventory(req: Request, apiKey: any) {
  const url = new URL(req.url)
  const warehouseId = url.searchParams.get('warehouse_id')

  let query = supabase
    .from('admin_armazens')
    .select('*')

  if (warehouseId) {
    query = query.eq('id', warehouseId)
  }

  const { data, error } = await query

  if (error) {
    return error('Erro ao buscar estoque: ' + error.message)
  }

  // Enrich with occupation data
  const enriched = data?.map((wh: any) => ({
    id: wh.id,
    nome: wh.nome,
    cidade: wh.cidade,
    estado: wh.estado,
    capacidade: wh.capacidade,
    ocupacao: wh.ocupacao,
    ocupacao_percent: Math.round((wh.ocupacao / wh.capacidade) * 100)
  }))

  return json({
    success: true,
    data: enriched || []
  })
}

// ============================================================================
// WEBHOOKS HANDLERS
// ============================================================================

async function handleWebhooks(req: Request, apiKey: any) {
  // List webhooks
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('b2b_webhooks')
      .select('*')
      .eq('api_key_id', apiKey.id)
      .eq('is_active', true)

    if (error) {
      return error('Erro ao buscar webhooks: ' + error.message)
    }

    return json({
      success: true,
      data: data || []
    })
  }

  // Create webhook
  if (req.method === 'POST') {
    const body = await req.json()
    const { webhook_url, events } = body

    if (!webhook_url || !events || events.length === 0) {
      return error('webhook_url e events são obrigatórios')
    }

    // Validar URL
    try {
      new URL(webhook_url)
    } catch {
      return error('URL de webhook inválida')
    }

    const { data, error: insertError } = await supabase
      .from('b2b_webhooks')
      .insert({
        api_key_id: apiKey.id,
        webhook_url,
        events,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      return error('Erro ao criar webhook: ' + insertError.message)
    }

    return json({
      success: true,
      data
    })
  }

  // Delete webhook
  if (req.method === 'DELETE') {
    const url = new URL(req.url)
    const webhookId = url.searchParams.get('id')

    if (!webhookId) {
      return error('ID do webhook é obrigatório')
    }

    const { error: updateError } = await supabase
      .from('b2b_webhooks')
      .update({ is_active: false })
      .eq('id', webhookId)
      .eq('api_key_id', apiKey.id)

    if (updateError) {
      return error('Erro ao remover webhook: ' + updateError.message)
    }

    return json({ success: true, message: 'Webhook removido' })
  }

  return error('Método não permitido', 405)
}

// ============================================================================
// HELPER: LOG REQUEST
// ============================================================================

async function logRequest(
  apiKeyId: string, 
  endpoint: string, 
  method: string, 
  statusCode: number, 
  responseTimeMs: number,
  req: Request
) {
  await supabase
    .from('b2b_request_logs')
    .insert({
      api_key_id: apiKeyId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
      user_agent: req.headers.get('user-agent')
    })
    .catch(console.error)
}