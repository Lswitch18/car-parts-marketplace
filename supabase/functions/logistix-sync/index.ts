/**
 * Logistix Sync Utility
 * Sincroniza dados entre Marketplace e Logistix
 * 
 * Funcionalidades:
 * - Marketplace Transaction → Logistix Pedido
 * - Status sync (paid → processing → shipped → delivered)
 * - Inventory sync (opcional)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface SyncResult {
  success: boolean
  logistix_pedido_id?: string
  error?: string
}

export interface MarketplaceTransaction {
  id: string
  buyer_id: string
  seller_id: string
  part_id: string
  amount: number
  payment_status: string
  fulfillment_status: string
  created_at: string
}

export interface LogistixPedido {
  codigo: string
  cliente_id: string
  armazem_origem_id: string
  destino_cidade: string
  destino_estado: string
  status: string
  peso_kg: number
  valor: number
  previsao: string
}

/**
 * Gera código de pedido único
 */
function generatePedidoCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `#PED-${timestamp}-${random}`
}

/**
 * Sincroniza uma transação do marketplace para Logistix
 * Chamado quando payment_status = 'paid'
 */
export async function syncTransactionToLogistix(
  transaction: MarketplaceTransaction,
  buyerEmail?: string,
  shippingAddress?: { cidade: string; estado: string; cep?: string }
): Promise<SyncResult> {
  try {
    console.log('[LogistixSync] Iniciando sincronização:', transaction.id)

    // 1. Buscar cliente no Logistix pelo email
    let clienteId: string | null = null
    
    if (buyerEmail) {
      const { data: cliente } = await supabase
        .from('admin_clientes')
        .select('id')
        .ilike('email', `%${buyerEmail}%`)
        .limit(1)
        .single()
      
      clienteId = cliente?.id || null
    }

    // Se não encontrar cliente, usar cliente padrão ou criar
    if (!clienteId) {
      const { data: defaultCliente } = await supabase
        .from('admin_clientes')
        .select('id')
        .eq('nome', 'Marketplace')
        .limit(1)
        .single()
      
      clienteId = defaultCliente?.id || null
    }

    if (!clienteId) {
      // Criar cliente temporário
      const { data: newCliente, error: clienteError } = await supabase
        .from('admin_clientes')
        .insert({
          nome: buyerEmail || 'Cliente Marketplace',
          email: buyerEmail || 'marketplace@logistix.com',
          telefone: '',
          cidade: shippingAddress?.cidade || 'São Paulo',
          estado: shippingAddress?.estado || 'SP',
          ativo: true
        })
        .select('id')
        .single()

      if (clienteError) {
        console.error('[LogistixSync] Erro ao criar cliente:', clienteError)
        return { success: false, error: clienteError.message }
      }
      
      clienteId = newCliente.id
    }

    // 2. Buscar armazém de origem (CD padrão)
    const { data: armazem } = await supabase
      .from('admin_armazens')
      .select('id')
      .eq('nome', 'CD São Paulo')
      .limit(1)
      .single()

    if (!armazem) {
      return { success: false, error: 'Armazém padrão não encontrado' }
    }

    // 3. Criar pedido no Logistix
    const previsao = new Date()
    previsao.setDate(previsao.getDate() + 5) // 5 dias para entrega

    const pedido: LogistixPedido = {
      codigo: generatePedidoCode(),
      cliente_id: clienteId,
      armazem_origem_id: armazem.id,
      destino_cidade: shippingAddress?.cidade || 'São Paulo',
      destino_estado: shippingAddress?.estado || 'SP',
      status: 'pendente',
      peso_kg: Math.round(Math.random() * 50 + 1), // Placeholder - ajustar com dados reais
      valor: transaction.amount,
      previsao: previsao.toISOString()
    }

    const { data: novoPedido, error: pedidoError } = await supabase
      .from('admin_pedidos')
      .insert(pedido)
      .select('id')
      .single()

    if (pedidoError) {
      console.error('[LogistixSync] Erro ao criar pedido:', pedidoError)
      return { success: false, error: pedidoError.message }
    }

    console.log('[LogistixSync] Pedido criado:', novoPedido.id)
    
    // 4. Registrar no rastreamento
    await supabase
      .from('admin_rastreamento')
      .insert({
        pedido_id: novoPedido.id,
        tipo: 'CRIACAO',
        descricao: 'Pedido criado via sincronização Marketplace',
        local: 'CD São Paulo',
        status: 'pendente'
      })

    return {
      success: true,
      logistix_pedido_id: novoPedido.id
    }

  } catch (error) {
    console.error('[LogistixSync] Erro:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Atualiza status do pedido no Logistix baseado no fulfillment_status
 */
export async function updateLogistixOrderStatus(
  transactionId: string,
  fulfillmentStatus: string
): Promise<SyncResult> {
  try {
    // Buscar pedido vinculado à transação (via código ou metadata)
    const { data: pedido, error } = await supabase
      .from('admin_pedidos')
      .select('id, status')
      .like('codigo', `%${transactionId.substring(0, 8)}%`)
      .limit(1)
      .single()

    if (error || !pedido) {
      return { success: false, error: 'Pedido não encontrado' }
    }

    // Mapear status
    const statusMap: Record<string, string> = {
      'pending': 'pendente',
      'processing': 'pendente',
      'shipped': 'em_transito',
      'delivered': 'entregue',
      'cancelled': 'cancelado'
    }

    const novoStatus = statusMap[fulfillmentStatus] || pedido.status

    // Atualizar status
    const { error: updateError } = await supabase
      .from('admin_pedidos')
      .update({ status: novoStatus })
      .eq('id', pedido.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Adicionar evento de rastreamento
    await supabase
      .from('admin_rastreamento')
      .insert({
        pedido_id: pedido.id,
        tipo: 'ATUALIZACAO',
        descricao: `Status atualizado: ${fulfillmentStatus}`,
        local: 'Sistema',
        status: novoStatus
      })

    return { success: true }

  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Verifica se uma transação já foi sincronizada
 */
export async function isTransactionSynced(transactionId: string): Promise<boolean> {
  const { data } = await supabase
    .from('admin_pedidos')
    .select('id')
    .like('codigo', `%${transactionId.substring(0, 8)}%`)
    .limit(1)
  
  return !!data && data.length > 0
}

/**
 * Lista pedidos syncados (para debugging)
 */
export async function listSyncedOrders(): Promise<any[]> {
  const { data, error } = await supabase
    .from('admin_pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data || []
}