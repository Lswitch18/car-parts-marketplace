import { supabase, successResponse, errorResponse, corsHeaders, getAuthUser, verifyToken } from '../utils/base.ts';

const COMMISSION_RATE = 0.10;
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FEE_FIXED = 30;

function calculateFees(amount: number) {
  const commission = amount * COMMISSION_RATE;
  const stripeFee = (amount * STRIPE_FEE_RATE) + STRIPE_FEE_FIXED;
  const platformFee = commission + stripeFee;
  const sellerNet = amount - platformFee;
  return { gross_amount: amount, commission_rate: COMMISSION_RATE, commission_amount: commission, stripe_fee: stripeFee, platform_fee: platformFee, seller_net: sellerNet };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      if (action === 'active') return await getActiveAuctions();
      if (action === 'list') return await listAuctions(req);
      if (action === 'ended') return await getEndedAuctions();
      const auctionId = action?.match(/^[0-9a-f-]{36}$/) ? action : url.searchParams.get('id');
      if (auctionId) return await getAuction(auctionId);
    }

    if (req.method === 'POST') {
      const body = await req.json();
      switch (action) {
        case 'create': return await createAuction(req, body);
        case 'bid': return await placeBid(req, body);
        case 'resolve': return await resolveAuction(req, body);
        case 'resolve-all': return await resolveAllExpired(req);
        case 'buy-now': return await buyNow(req, body);
        case 'pay': return await payAuctionWinner(req, body);
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

// ─── GET: Active auctions ────────────────────────────────
async function getActiveAuctions() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(name, logo_url),
      category:categories(name),
      seller:profiles(id, full_name, rating),
      bids(count)
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

// ─── GET: Ended auctions (won/lost) ──────────────────────
async function getEndedAuctions() {
  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(name, logo_url),
      category:categories(name),
      seller:profiles(id, full_name, rating),
      winning_bid:bids!parts_winning_bid_id_fkey(id, amount, created_at, bidder:profiles(id, full_name))
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

// ─── GET: Single auction ─────────────────────────────────
async function getAuction(auctionId: string) {
  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      seller:profiles(id, full_name, avatar_url, rating, is_verified),
      winning_bid:bids!parts_winning_bid_id_fkey(id, amount, created_at, bidder:profiles(id, full_name, avatar_url)),
      bids(
        id, amount, created_at, is_winning,
        bidder:profiles(id, full_name, avatar_url)
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

// ─── GET: List (paginated) ───────────────────────────────
async function listAuctions(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const status = url.searchParams.get('status') || 'active';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('parts')
    .select(`*, brand:brands(name, logo_url), category:categories(name), seller:profiles(id, full_name, rating), bids(count)`, { count: 'exact' })
    .eq('auction_enabled', true);

  if (status === 'active') {
    query = query.eq('status', 'active').gt('auction_end', new Date().toISOString());
  } else if (status === 'ended') {
    query = query.lt('auction_end', new Date().toISOString());
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
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

// ─── POST: Create auction ────────────────────────────────
async function createAuction(req: Request, body: Record<string, unknown>) {
  const token = getAuthUser(req);
  if (!token) return new Response(JSON.stringify(errorResponse('Token required')), { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  const user = await verifyToken(token);
  if (!user) return new Response(JSON.stringify(errorResponse('Invalid token')), { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });

  const { title, description, starting_bid, buy_now_price, auction_duration_hours, condition, brand_id, category_id, model_id, images, buy_now_enabled } = body as Record<string, unknown>;

  if (!title || !starting_bid || !auction_duration_hours) {
    return new Response(JSON.stringify(errorResponse('title, starting_bid e auction_duration_hours são obrigatórios')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + (Number(auction_duration_hours) * 60 * 60 * 1000));

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
    return new Response(JSON.stringify(errorResponse(error.message)), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify(successResponse(data, 'Leilão criado com sucesso')), { status: 201, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
}

// ─── POST: Place bid ─────────────────────────────────────
async function placeBid(req: Request, body: Record<string, unknown>) {
  const token = getAuthUser(req);
  if (!token) return new Response(JSON.stringify(errorResponse('Token required')), { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  const user = await verifyToken(token);
  if (!user) return new Response(JSON.stringify(errorResponse('Invalid token')), { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });

  const { auction_id, amount } = body;
  if (!auction_id || !amount) {
    return new Response(JSON.stringify(errorResponse('auction_id e amount são obrigatórios')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  const { data: auction, error: auctionError } = await supabase
    .from('parts')
    .select('id, seller_id, current_bid, auction_end, status')
    .eq('id', auction_id)
    .single();

  if (auctionError || !auction) {
    return new Response(JSON.stringify(errorResponse('Leilão não encontrado')), { status: 404, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }
  if (auction.status !== 'active') {
    return new Response(JSON.stringify(errorResponse('Leilão não está ativo')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }
  if (new Date(auction.auction_end) < new Date()) {
    return new Response(JSON.stringify(errorResponse('Leilão encerrado')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }
  if (auction.seller_id === user.id) {
    return new Response(JSON.stringify(errorResponse('Você não pode dar lance no seu próprio leilão')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  const minBid = auction.current_bid * 1.05;
  if (Number(amount) < minBid) {
    return new Response(JSON.stringify(errorResponse(`Lance mínimo: ¥${Math.ceil(minBid).toLocaleString()}`)), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  await supabase.from('bids').update({ is_winning: false }).eq('part_id', auction_id).eq('is_winning', true);

  const { data: bid, error } = await supabase
    .from('bids')
    .insert({ part_id: auction_id, bidder_id: user.id, amount: Number(amount), is_winning: true })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  await supabase.from('parts').update({ current_bid: Number(amount), watchers: supabase.raw('watchers + 1') }).eq('id', auction_id);

  const { data: allBids } = await supabase
    .from('bids')
    .select('id, amount, created_at, bidder:profiles(id, full_name, avatar_url)')
    .eq('part_id', auction_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return new Response(JSON.stringify(successResponse({ bid, current_bid: Number(amount), recent_bids: allBids }, 'Lance registrado com sucesso')), { status: 201, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
}

// ─── POST: Resolve a single ended auction ────────────────
async function resolveAuction(req: Request, body: Record<string, unknown>) {
  const { auction_id } = body;
  if (!auction_id) {
    return new Response(JSON.stringify(errorResponse('auction_id é obrigatório')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  const result = await resolveSingleAuction(auction_id as string);
  if (result.error) {
    return new Response(JSON.stringify(errorResponse(result.error)), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify(successResponse(result.data, 'Leilão resolvido')), { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
}

// ─── POST: Resolve ALL expired auctions ──────────────────
async function resolveAllExpired(_req: Request) {
  const now = new Date().toISOString();

  const { data: expired } = await supabase
    .from('parts')
    .select('id')
    .eq('auction_enabled', true)
    .eq('status', 'active')
    .lt('auction_end', now);

  if (!expired || expired.length === 0) {
    return new Response(JSON.stringify(successResponse({ resolved: 0 }, 'Nenhum leilão expirado encontrado')), { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  const results = [];
  for (const auction of expired) {
    const result = await resolveSingleAuction(auction.id);
    results.push({ id: auction.id, ...result });
  }

  return new Response(JSON.stringify(successResponse({ resolved: results.length, results })), { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
}

async function resolveSingleAuction(auctionId: string): Promise<{ data?: any; error?: string }> {
  // Fetch the auction with its winning bid
  const { data: auction } = await supabase
    .from('parts')
    .select('id, seller_id, title, current_bid, starting_bid, status, auction_enabled')
    .eq('id', auctionId)
    .single();

  if (!auction) return { error: 'Leilão não encontrado' };
  if (auction.status !== 'active') return { error: 'Leilão já foi resolvido' };

  // Find winning bid
  const { data: winningBid } = await supabase
    .from('bids')
    .select('id, bidder_id, amount')
    .eq('part_id', auctionId)
    .eq('is_winning', true)
    .single();

  const now = new Date().toISOString();

  if (winningBid) {
    // There is a winner — create transaction, mark as ended with winner
    const fees = calculateFees(Number(winningBid.amount));

    const { data: tx } = await supabase
      .from('transactions')
      .insert({
        part_id: auctionId,
        auction_id: auctionId,
        bid_id: winningBid.id,
        buyer_id: winningBid.bidder_id,
        seller_id: auction.seller_id,
        amount: Number(winningBid.amount),
        commission_rate: COMMISSION_RATE,
        commission_amount: fees.commission_amount,
        platform_fee: fees.platform_fee,
        seller_net: fees.seller_net,
        payment_status: 'pending',
        fulfillment_status: 'pending',
      })
      .select()
      .single();

    if (tx) {
      // Update part with winner info
      await supabase
        .from('parts')
        .update({
          status: 'ended',
          winning_bid_id: winningBid.id,
          winner_id: winningBid.bidder_id,
          resolved_at: now,
          current_bid: Number(winningBid.amount),
        })
        .eq('id', auctionId);

      // Notify winner
      try {
        await supabase.from('messages').insert({
          sender_id: auction.seller_id,
          receiver_id: winningBid.bidder_id,
          product_id: auctionId,
          transaction_id: tx.id,
          content: `🎉 Você venceu o leilão "${auction.title}"! Complete o pagamento para garantir sua peça.`,
          message_type: 'system',
        });
      } catch (_) { /* ignore */ }

      return { data: { winner: winningBid, transaction: tx, status: 'ended' } };
    }
  }

  // No bids — mark as ended with no winner
  await supabase
    .from('parts')
    .update({ status: 'ended', resolved_at: now })
    .eq('id', auctionId);

  return { data: { winner: null, status: 'ended_no_bids' } };
}

// ─── POST: Buy Now ───────────────────────────────────────
async function buyNow(req: Request, body: Record<string, unknown>) {
  const token = getAuthUser(req);
  if (!token) return new Response(JSON.stringify(errorResponse('Token required')), { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  const user = await verifyToken(token);
  if (!user) return new Response(JSON.stringify(errorResponse('Invalid token')), { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });

  const { auction_id } = body;
  if (!auction_id) {
    return new Response(JSON.stringify(errorResponse('auction_id é obrigatório')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  const { data: auction } = await supabase
    .from('parts')
    .select('id, seller_id, buy_now_price, buy_now_enabled, current_bid, status, auction_end, title')
    .eq('id', auction_id)
    .single();

  if (!auction) return new Response(JSON.stringify(errorResponse('Leilão não encontrado')), { status: 404, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  if (auction.status !== 'active') return new Response(JSON.stringify(errorResponse('Leilão não está ativo')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  if (!auction.buy_now_price) return new Response(JSON.stringify(errorResponse('Este leilão não tem preço de compra imediata')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  if (!auction.buy_now_enabled) return new Response(JSON.stringify(errorResponse('Compra imediata não disponível')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  if (auction.seller_id === user.id) return new Response(JSON.stringify(errorResponse('Você não pode comprar sua própria peça')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });

  const amount = Number(auction.buy_now_price);
  const fees = calculateFees(amount);

  // Create transaction
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      part_id: auction_id,
      auction_id: auction_id,
      buyer_id: user.id,
      seller_id: auction.seller_id,
      amount,
      commission_rate: COMMISSION_RATE,
      commission_amount: fees.commission_amount,
      platform_fee: fees.platform_fee,
      seller_net: fees.seller_net,
      payment_status: 'pending',
      fulfillment_status: 'pending',
    })
    .select()
    .single();

  if (txError) {
    return new Response(JSON.stringify(errorResponse(txError.message)), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  // Mark part as pending
  await supabase.from('parts').update({ status: 'pending' }).eq('id', auction_id);

  return new Response(JSON.stringify(successResponse({ transaction: tx, fees }, 'Compra iniciada. Redirecionando para pagamento...')), { status: 201, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
}

// ─── POST: Pay for won auction ───────────────────────────
async function payAuctionWinner(req: Request, body: Record<string, unknown>) {
  const token = getAuthUser(req);
  if (!token) return new Response(JSON.stringify(errorResponse('Token required')), { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  const user = await verifyToken(token);
  if (!user) return new Response(JSON.stringify(errorResponse('Invalid token')), { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });

  const { transaction_id } = body;
  if (!transaction_id) {
    return new Response(JSON.stringify(errorResponse('transaction_id é obrigatório')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  }

  // Verify transaction belongs to user and is unpaid
  const { data: tx } = await supabase
    .from('transactions')
    .select('id, part_id, buyer_id, seller_id, amount, payment_status')
    .eq('id', transaction_id)
    .single();

  if (!tx) return new Response(JSON.stringify(errorResponse('Transação não encontrada')), { status: 404, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  if (tx.buyer_id !== user.id) return new Response(JSON.stringify(errorResponse('Esta transação não pertence a você')), { status: 403, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
  if (tx.payment_status !== 'pending') return new Response(JSON.stringify(errorResponse('Pagamento já foi processado')), { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });

  // Return the transaction data so frontend can redirect to Stripe checkout
  return new Response(JSON.stringify(successResponse({
    transaction: tx,
    checkout_url: null, // Frontend will call stripe-checkout/create-checkout
  }, 'Pronto para pagamento. Redirecionando...')), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
