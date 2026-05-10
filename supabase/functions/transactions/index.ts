import { supabase, successResponse, errorResponse, corsHeaders, getAuthUser, verifyToken } from '../utils/base.ts';

const COMMISSION_RATE = 0.10;
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FEE_FIXED = 30;

function calculateFees(amount: number) {
  const commission = amount * COMMISSION_RATE;
  const stripeFee = (amount * STRIPE_FEE_RATE) + STRIPE_FEE_FIXED;
  const platformFee = commission + stripeFee;
  const sellerNet = amount - platformFee;
  
  return {
    gross_amount: amount,
    commission_rate: COMMISSION_RATE,
    commission_amount: commission,
    stripe_fee: stripeFee,
    platform_fee: platformFee,
    seller_net: sellerNet,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      if (action === 'list') return await listTransactions(req);
      if (action === 'calculate') return calculateFeesEndpoint(req);
      const txId = action?.match(/^[0-9a-f-]{36}$/) ? action : url.searchParams.get('id');
      if (txId) return await getTransaction(txId);
    }

    if (req.method === 'POST' && action === 'create') {
      const body = await req.json();
      return await createTransaction(req, body);
    }

    if (req.method === 'PUT') {
      const txId = action?.match(/^[0-9a-f-]{36}$/) ? action : url.searchParams.get('id');
      if (txId) {
        const body = await req.json();
        return await updateTransaction(req, txId, body);
      }
    }

    return new Response(JSON.stringify(errorResponse('Endpoint não encontrado')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify(errorResponse(err.message)), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});

async function listTransactions(req: Request) {
  const token = getAuthUser(req);
  if (!token) {
    return new Response(JSON.stringify(errorResponse('Token required')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyToken(token);
  if (!user) {
    return new Response(JSON.stringify(errorResponse('Invalid token')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const role = url.searchParams.get('role');
  const status = url.searchParams.get('status');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  let query = supabase
    .from('transactions')
    .select(`
      *,
      part:parts(id, title, images, price),
      buyer:profiles(id, full_name, email),
      seller:profiles(id, full_name, email)
    `, { count: 'exact' });

  if (!profile?.role?.includes('admin')) {
    if (role === 'buyer') {
      query = query.eq('buyer_id', user.id);
    } else {
      query = query.eq('seller_id', user.id);
    }
  }

  if (status) query = query.eq('payment_status', status);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse({
    transactions: data,
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function getTransaction(txId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      part:parts(*),
      buyer:profiles(id, full_name, email, phone),
      seller:profiles(id, full_name, email, phone)
    `)
    .eq('id', txId)
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse('Transação não encontrada')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function createTransaction(req: Request, body: Record<string, unknown>) {
  const token = getAuthUser(req);
  if (!token) {
    return new Response(JSON.stringify(errorResponse('Token required')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyToken(token);
  if (!user) {
    return new Response(JSON.stringify(errorResponse('Invalid token')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { part_id, amount } = body;

  if (!part_id || !amount) {
    return new Response(JSON.stringify(errorResponse('part_id e amount são obrigatórios')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data: part } = await supabase
    .from('parts')
    .select('id, seller_id, price, status')
    .eq('id', part_id)
    .single();

  if (!part || part.status !== 'active') {
    return new Response(JSON.stringify(errorResponse('Peça não disponível para compra')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (part.seller_id === user.id) {
    return new Response(JSON.stringify(errorResponse('Você não pode comprar sua própria peça')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const fees = calculateFees(Number(amount));

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      part_id,
      buyer_id: user.id,
      seller_id: part.seller_id,
      amount: Number(amount),
      commission_rate: COMMISSION_RATE,
      commission_amount: fees.commission_amount,
      platform_fee: fees.platform_fee,
      seller_net: fees.seller_net,
      payment_status: 'pending',
      fulfillment_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  await supabase
    .from('parts')
    .update({ status: 'pending' })
    .eq('id', part_id);

  return new Response(JSON.stringify(successResponse({
    transaction: data,
    fees,
  }, 'Transação criada. Aguardando pagamento.')), {
    status: 201,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function updateTransaction(req: Request, txId: string, body: Record<string, unknown>) {
  const token = getAuthUser(req);
  if (!token) {
    return new Response(JSON.stringify(errorResponse('Token required')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyToken(token);
  if (!user) {
    return new Response(JSON.stringify(errorResponse('Invalid token')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { payment_status, fulfillment_status, stripe_payment_id } = body;

  const { data: existingTx } = await supabase
    .from('transactions')
    .select('buyer_id, seller_id')
    .eq('id', txId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role?.includes('admin');
  const isBuyer = existingTx?.buyer_id === user.id;
  const isSeller = existingTx?.seller_id === user.id;

  if (!isAdmin && !isBuyer && !isSeller) {
    return new Response(JSON.stringify(errorResponse('Não autorizado')), {
      status: 403,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const updates: Record<string, unknown> = {};
  if (payment_status) updates.payment_status = payment_status;
  if (fulfillment_status) updates.fulfillment_status = fulfillment_status;
  if (stripe_payment_id) updates.stripe_payment_id = stripe_payment_id;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', txId)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (payment_status === 'paid') {
    const { data: tx } = await supabase
      .from('transactions')
      .select('part_id, seller_id')
      .eq('id', txId)
      .single();

    await supabase
      .from('parts')
      .update({ status: 'sold' })
      .eq('id', tx?.part_id);

    await supabase
      .from('profiles')
      .update({ total_sales: supabase.raw('total_sales + 1') })
      .eq('id', tx?.seller_id);
  }

  return new Response(JSON.stringify(successResponse(data, 'Transação atualizada')), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

function calculateFeesEndpoint(req: Request) {
  const url = new URL(req.url);
  const amount = parseFloat(url.searchParams.get('amount') || '0');

  if (amount <= 0) {
    return new Response(JSON.stringify(errorResponse('Amount inválido')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const fees = calculateFees(amount);
  return new Response(JSON.stringify(successResponse(fees)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}