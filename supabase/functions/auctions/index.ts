import { supabase, successResponse, errorResponse, corsHeaders, getAuthUser, verifyToken } from '../utils/base.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      if (action === 'list') return await listAuctions(req);
      if (action === 'active') return await getActiveAuctions();
      const auctionId = action?.match(/^[0-9a-f-]{36}$/) ? action : url.searchParams.get('id');
      if (auctionId) return await getAuction(auctionId);
    }

    if (req.method === 'POST') {
      if (action === 'bid') {
        const body = await req.json();
        return await placeBid(req, body);
      }
      if (action === 'create') {
        const body = await req.json();
        return await createAuction(req, body);
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

async function getActiveAuctions() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(name, logo_url),
      category:categories(name),
      seller:profiles(id, full_name, rating),
      bids(count),
      current_bid_data:bids(amount, created_at)
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

  const auctions = data?.map(auction => ({
    ...auction,
    bid_count: auction.bids?.[0]?.count || 0,
    current_bid: auction.current_bid_data?.[0]?.amount || auction.starting_bid,
    time_remaining: new Date(auction.auction_end).getTime() - Date.now(),
  })) || [];

  return new Response(JSON.stringify(successResponse(auctions)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

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
      seller:profiles(id, full_name, rating),
      bids(count)
    `, { count: 'exact' })
    .eq('auction_enabled', true);

  if (status === 'active') {
    query = query.eq('status', 'active').gt('auction_end', new Date().toISOString());
  } else if (status === 'ended') {
    query = query.lt('auction_end', new Date().toISOString());
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

async function getAuction(auctionId: string) {
  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      seller:profiles(id, full_name, avatar_url, rating, is_verified),
      bids(
        id,
        amount,
        created_at,
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

async function createAuction(req: Request, body: Record<string, unknown>) {
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

  const { title, description, starting_bid, buy_now_price, auction_duration_hours, condition, brand_id, category_id, model_id, images } = body as Record<string, unknown>;

  if (!title || !starting_bid || !auction_duration_hours) {
    return new Response(JSON.stringify(errorResponse('title, starting_bid e auction_duration_hours são obrigatórios')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
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
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data, 'Leilão criado com sucesso')), {
    status: 201,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function placeBid(req: Request, body: Record<string, unknown>) {
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

  const { auction_id, amount } = body;

  if (!auction_id || !amount) {
    return new Response(JSON.stringify(errorResponse('auction_id e amount são obrigatórios')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data: auction, error: auctionError } = await supabase
    .from('parts')
    .select('id, seller_id, current_bid, auction_end, status')
    .eq('id', auction_id)
    .single();

  if (auctionError || !auction) {
    return new Response(JSON.stringify(errorResponse('Leilão não encontrado')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (auction.status !== 'active') {
    return new Response(JSON.stringify(errorResponse('Leilão não está ativo')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (new Date(auction.auction_end) < new Date()) {
    return new Response(JSON.stringify(errorResponse('Leilão encerrado')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (auction.seller_id === user.id) {
    return new Response(JSON.stringify(errorResponse('Você não pode dar lance no seu próprio leilão')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const minBid = auction.current_bid * 1.05;
  if (Number(amount) < minBid) {
    return new Response(JSON.stringify(errorResponse(`Lance mínimo: ¥${Math.ceil(minBid).toLocaleString()}`)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  await supabase
    .from('bids')
    .update({ is_winning: false })
    .eq('part_id', auction_id)
    .eq('is_winning', true);

  const { data: bid, error } = await supabase
    .from('bids')
    .insert({
      part_id: auction_id,
      bidder_id: user.id,
      amount: Number(amount),
      is_winning: true,
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
    .update({ current_bid: Number(amount), watchers: supabase.raw('watchers + 1') })
    .eq('id', auction_id);

  const { data: allBids } = await supabase
    .from('bids')
    .select(`
      id,
      amount,
      created_at,
      bidder:profiles(id, full_name, avatar_url)
    `)
    .eq('part_id', auction_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return new Response(JSON.stringify(successResponse({
    bid,
    current_bid: Number(amount),
    recent_bids: allBids,
  }, 'Lance registrado com sucesso')), {
    status: 201,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}