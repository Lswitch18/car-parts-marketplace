import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function error(msg: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generatePedidoCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `#PED-${timestamp}-${random}`;
}

async function authorize(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (serviceRoleKey && token === serviceRoleKey) {
    return { serviceRole: true as const, user: null };
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role?.includes('admin')) return null;

  return { serviceRole: false as const, user };
}

async function syncTransaction(transactionId: string) {
  console.log('[LogistixSync] Iniciando sincronização:', transactionId);

  const { data: tx } = await supabase
    .from('transactions')
    .select('*, profiles!transactions_buyer_id_fkey(id, email, full_name)')
    .eq('id', transactionId)
    .single();

  if (!tx) return { error: 'Transação não encontrada' };

  const buyerEmail = tx.profiles?.email;
  const shippingAddress = {
    cidade: tx.shipping_city || 'São Paulo',
    estado: tx.shipping_state || 'SP',
  };

  let clienteId: string | null = null;

  if (buyerEmail) {
    const { data: cliente } = await supabase
      .from('admin_clientes')
      .select('id')
      .ilike('email', `%${buyerEmail}%`)
      .limit(1)
      .single();
    clienteId = cliente?.id || null;
  }

  if (!clienteId) {
    const { data: newCliente } = await supabase
      .from('admin_clientes')
      .insert({
        nome: tx.profiles?.full_name || buyerEmail || 'Cliente Marketplace',
        email: buyerEmail || 'marketplace@logistix.com',
        telefone: '',
        cidade: shippingAddress.cidade,
        estado: shippingAddress.estado,
        ativo: true,
      })
      .select('id')
      .single();

    if (newCliente) clienteId = newCliente.id;
  }

  if (!clienteId) return { error: 'Não foi possível criar/obter cliente' };

  const { data: armazem } = await supabase
    .from('admin_armazens')
    .select('id')
    .eq('nome', 'CD Yokohama - Porto')
    .limit(1)
    .single();

  const armazemId = armazem?.id;

  const previsao = new Date();
  previsao.setDate(previsao.getDate() + 5);

  const pedido = {
    codigo: generatePedidoCode(),
    cliente_id: clienteId,
    armazem_origem_id: armazemId,
    destino_cidade: shippingAddress.cidade,
    destino_estado: shippingAddress.estado,
    status: 'pendente',
    peso_kg: Math.round(Math.random() * 50 + 1),
    valor: tx.amount,
    previsao: previsao.toISOString(),
  };

  const { data: novoPedido, error: pedidoError } = await supabase
    .from('admin_pedidos')
    .insert(pedido)
    .select('id')
    .single();

  if (pedidoError) return { error: pedidoError.message };

  await supabase.from('admin_rastreamento').insert({
    pedido_id: novoPedido.id,
    tipo: 'CRIACAO',
    descricao: 'Pedido criado via Marketplace',
    local: 'CD São Paulo',
    status: 'pendente',
  });

  await supabase.from('messages').insert({
    sender_id: tx.seller_id,
    receiver_id: tx.buyer_id,
    product_id: tx.part_id,
    transaction_id: transactionId,
    content: `Seu pedido #${pedido.codigo} foi criado na Logistix! Código de rastreamento em breve.`,
    message_type: 'system',
  });

  console.log('[LogistixSync] Pedido criado:', novoPedido.id, pedido.codigo);
  return { pedido_id: novoPedido.id, codigo: pedido.codigo };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');

      if (action === 'list') {
        const auth = await authorize(req);
        if (!auth) return error('Não autorizado', 401);
        const { data } = await supabase
          .from('admin_pedidos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        return json(data || []);
      }

      return json({ status: 'healthy', service: 'logistix-sync' });
    }

    if (req.method === 'POST') {
      const auth = await authorize(req);
      if (!auth) return error('Não autorizado', 401);

      const body = await req.json();
      const { transaction_id } = body;

      if (!transaction_id) {
        return error('transaction_id é obrigatório');
      }

      const result = await syncTransaction(transaction_id);
      if (result.error) return error(result.error);

      return json(result, 201);
    }

    return error('Método não permitido', 405);
  } catch (err) {
    console.error('[LogistixSync] Erro:', err);
    return error(String(err), 500);
  }
});
