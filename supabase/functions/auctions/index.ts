import { supabase, successResponse, errorResponse, corsHeaders, getAuthUser, verifyToken, requireAuth } from '../utils/base.ts';

const COMMISSION_RATE = 0.074;
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FEE_FIXED = 30;

/** Calcula comissão da plataforma + taxa Stripe com arredondamento financeiro seguro */
function calculateFees(amount: number, isIntegerCurrency = true) {
  const commission = amount * COMMISSION_RATE;
  const stripeFee = (amount * STRIPE_FEE_RATE) + STRIPE_FEE_FIXED;
  const platformFee = commission + stripeFee;
  const sellerNet = amount - platformFee;

  const round = (val: number) => isIntegerCurrency ? Math.round(val) : Math.round(val * 100) / 100;

  return {
    gross_amount: round(amount),
    commission_rate: COMMISSION_RATE,
    commission_amount: round(commission),
    stripe_fee: round(stripeFee),
    platform_fee: round(platformFee),
    seller_net: round(sellerNet),
  };
}

// requireAuth foi movido para utils/base.ts

// ─── Router ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // GET endpoints
    if (req.method === 'GET') {
      if (action === 'active')    return await getActiveAuctions();
      if (action === 'list')      return await listAuctions(req);
      if (action === 'ended')     return await getEndedAuctions();

      // Match UUID pattern (single auction)
      const auctionId = action?.match(/^[0-9a-f-]{36}$/)
        ? action
        : url.searchParams.get('id');
      if (auctionId) return await getAuction(auctionId);
    }

    // POST endpoints
    if (req.method === 'POST') {
      const body = await req.json();
      switch (action) {
        case 'create':      return await createAuction(req, body);
        case 'bid':         return await placeBid(req, body);
        case 'resolve':     return await resolveAuction(req, body);
        case 'resolve-all': return await resolveAllExpired(req);
        case 'buy-now':     return await buyNow(req, body);
        case 'pay':         return await payAuctionWinner(req, body);
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

// ─── GET /auctions/active ──────────────────────────────────────
async function getActiveAuctions() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(name, logo_url),
      category:categories(name),
      seller:profiles!parts_seller_id_fkey(id, full_name, rating),
      bids!bids_part_id_fkey(count)
    `)
    .eq('auction_enabled', true)
    .eq('status', 'active')
    .gt('auction_end', now)
    .order('auction_end', { ascending: true })
    .limit(20);

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // Normaliza dados para o frontend
  const auctions = data?.map(a => ({
    ...a,
    bid_count: a.bids?.[0]?.count || 0,
    current_bid: a.current_bid || a.starting_bid,
    time_remaining: new Date(a.auction_end).getTime() - Date.now(),
  })) || [];

  return new Response(JSON.stringify(successResponse(auctions)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── GET /auctions/ended ───────────────────────────────────────
async function getEndedAuctions() {
  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(name, logo_url),
      category:categories(name),
      seller:profiles!parts_seller_id_fkey(id, full_name, rating),
      winning_bid:bids!parts_winning_bid_id_fkey(id, amount, created_at, bidder:profiles!bids_bidder_id_fkey(id, full_name))
    `)
    .eq('auction_enabled', true)
    .in('status', ['ended', 'sold'])
    .order('auction_end', { ascending: false })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── GET /auctions/:id ─────────────────────────────────────────
async function getAuction(auctionId: string) {
  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      seller:profiles!parts_seller_id_fkey(id, full_name, avatar_url, rating, is_verified),
      winning_bid:bids!parts_winning_bid_id_fkey(id, amount, created_at, bidder:profiles!bids_bidder_id_fkey(id, full_name, avatar_url)),
      bids!bids_part_id_fkey(
        id, amount, created_at, is_winning,
        bidder:profiles!bids_bidder_id_fkey(id, full_name, avatar_url)
      )
    `)
    .eq('id', auctionId)
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse('Leilão não encontrado')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── GET /auctions/list?status=&page=&limit= ───────────────────
async function listAuctions(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const status = url.searchParams.get('status') || 'active';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('parts')
    .select(`
      *,
      brand:brands(name, logo_url),
      category:categories(name),
      seller:profiles!parts_seller_id_fkey(id, full_name, rating),
      bids!bids_part_id_fkey(count)
    `, { count: 'exact' })
    .eq('auction_enabled', true);

  if (status === 'active') {
    query = query.eq('status', 'active').gt('auction_end', new Date().toISOString());
  } else if (status === 'ended') {
    query = query.in('status', ['ended', 'sold']).lt('auction_end', new Date().toISOString());
  } else if (status === 'sold') {
    query = query.eq('status', 'sold');
  }

  const { data, error, count } = await query
    .order('auction_end', { ascending: status === 'active' })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse({
    auctions: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── POST /auctions/create ─────────────────────────────────────
async function createAuction(req: Request, body: Record<string, unknown>) {
  const { user, response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  // --- Regras de Negócio de Criação ---
  const { data: profile } = await supabase.from('profiles').select('account_type, store_verified').eq('id', user.id).single();
  
  if (profile?.account_type !== 'pessoa_fisica' && !profile?.store_verified) {
    return new Response(JSON.stringify(errorResponse('Sua loja precisa ser verificada antes de criar anúncios')), {
      status: 403,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (profile?.account_type === 'pessoa_fisica') {
    const { count } = await supabase.from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .in('status', ['active', 'sold']);
      
    if (count !== null && count >= 10) {
      return new Response(JSON.stringify(errorResponse('Limite de 10 peças atingido para Pessoa Física. Atualize para conta Empresa.')), {
        status: 403,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
  }
  // --- Fim Regras ---

  const {
    title, description, starting_bid, buy_now_price,
    auction_duration_hours, condition, brand_id,
    category_id, model_id, images, buy_now_enabled,
  } = body as Record<string, unknown>;

  if (!title || !starting_bid || !auction_duration_hours) {
    return new Response(
      JSON.stringify(errorResponse('title, starting_bid e auction_duration_hours são obrigatórios')),
      { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + Number(auction_duration_hours) * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('parts')
    .insert({
      seller_id: user.id,
      title,
      description: description || null,
      starting_bid: Number(starting_bid),
      current_bid: Number(starting_bid),
      buy_now_price: buy_now_price ? Number(buy_now_price) : null,
      buy_now_enabled: buy_now_enabled !== false,
      condition: condition || 'good',
      brand_id: brand_id || null,
      category_id: category_id || null,
      model_id: model_id || null,
      images: images || [],
      auction_enabled: true,
      auction_start: now.toISOString(),
      auction_end: endDate.toISOString(),
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data, 'Leilão criado com sucesso')), {
    status: 201,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── POST /auctions/bid ────────────────────────────────────────
async function placeBid(req: Request, body: Record<string, unknown>) {
  const { user, response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  const { auction_id, amount } = body;
  if (!auction_id || !amount) {
    return new Response(JSON.stringify(errorResponse('auction_id e amount são obrigatórios')), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // Usa a RPC place_bid (atômica, sem race condition)
  const { data: rpcResult, error: rpcError } = await supabase
    .rpc('place_bid', {
      p_part_id: auction_id,
      p_bidder_id: user.id,
      p_amount: Number(amount),
    });

  if (rpcError) {
    return new Response(JSON.stringify(errorResponse(rpcError.message)), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const result = rpcResult as Record<string, unknown>;
  if (!result.success) {
    return new Response(JSON.stringify(errorResponse(String(result.error))), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse({
    bid: result.bid,
    current_bid: result.current_bid,
    recent_bids: result.recent_bids,
  }, 'Lance registrado com sucesso')), {
    status: 201,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── POST /auctions/resolve ────────────────────────────────────
async function resolveAuction(req: Request, body: Record<string, unknown>) {
  const { response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  const { auction_id } = body;
  if (!auction_id) {
    return new Response(JSON.stringify(errorResponse('auction_id é obrigatório')), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data: rpcResult, error: rpcError } = await supabase
    .rpc('resolve_auction', { p_part_id: auction_id });

  if (rpcError) {
    return new Response(JSON.stringify(errorResponse(rpcError.message)), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const result = rpcResult as Record<string, unknown>;
  if (!result.success) {
    return new Response(JSON.stringify(errorResponse(String(result.error))), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(result.data, 'Leilão resolvido')), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── POST /auctions/resolve-all ────────────────────────────────
async function resolveAllExpired(req: Request) {
  const { response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  const now = new Date().toISOString();

  const { data: expired } = await supabase
    .from('parts')
    .select('id')
    .eq('auction_enabled', true)
    .eq('status', 'active')
    .lt('auction_end', now);

  if (!expired || expired.length === 0) {
    return new Response(
      JSON.stringify(successResponse({ resolved: 0 }, 'Nenhum leilão expirado encontrado')),
      { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
    );
  }

  const results = [];
  for (const auction of expired) {
    const { data: rpcResult } = await supabase
      .rpc('resolve_auction', { p_part_id: auction.id });
    results.push({ id: auction.id, result: rpcResult });
  }

  return new Response(JSON.stringify(successResponse({ resolved: results.length, results })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── POST /auctions/buy-now ────────────────────────────────────
async function buyNow(req: Request, body: Record<string, unknown>) {
  const { user, response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  const { auction_id } = body;
  if (!auction_id) {
    return new Response(JSON.stringify(errorResponse('auction_id é obrigatório')), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // Usa a RPC buy_now (atômica, com FOR UPDATE, sem race condition)
  const { data: rpcResult, error: rpcError } = await supabase
    .rpc('buy_now', { p_part_id: auction_id, p_buyer_id: user.id });

  if (rpcError) {
    return new Response(JSON.stringify(errorResponse(rpcError.message)), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const result = rpcResult as Record<string, unknown>;
  if (!result.success) {
    return new Response(JSON.stringify(errorResponse(String(result.error))), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse({
    transaction: result.transaction,
    fees: result.fees,
  }, 'Compra iniciada. Redirecionando para pagamento...')), {
    status: 201,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── POST /auctions/pay ────────────────────────────────────────
async function payAuctionWinner(req: Request, body: Record<string, unknown>) {
  const { user, response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  const { transaction_id } = body;
  if (!transaction_id) {
    return new Response(JSON.stringify(errorResponse('transaction_id é obrigatório')), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // Verifica se a transação pertence ao usuário
  const { data: tx } = await supabase
    .from('transactions')
    .select('id, part_id, buyer_id, seller_id, amount, payment_status')
    .eq('id', transaction_id)
    .single();

  if (!tx) {
    return new Response(JSON.stringify(errorResponse('Transação não encontrada')), {
      status: 404, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
  if (tx.buyer_id !== user.id) {
    return new Response(JSON.stringify(errorResponse('Esta transação não pertence a você')), {
      status: 403, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
  if (tx.payment_status !== 'pending') {
    return new Response(JSON.stringify(errorResponse('Pagamento já foi processado')), {
      status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse({
    transaction: tx,
    checkout_url: null, // Frontend chama stripe-checkout separadamente
  }, 'Pronto para pagamento.')), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
