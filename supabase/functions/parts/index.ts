import { supabase, successResponse, errorResponse, corsHeaders, requireAuth, checkRateLimit } from '../utils/base.ts';
import { redisGet, redisSet, cacheKey } from '../utils/redis.ts';

interface PartFilters {
  brand_id?: string;
  category_id?: string;
  model_id?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  status?: string;
  seller_id?: string;
  featured?: boolean;
  search?: string;
}

interface ListPartsParams {
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'price' | 'views';
  order?: 'asc' | 'desc';
  filters?: PartFilters;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const sort = (url.searchParams.get('sort') || 'created_at') as 'created_at' | 'price' | 'views';
    const order = (url.searchParams.get('order') || 'desc') as 'asc' | 'desc';

    const filters: PartFilters = {
      brand_id: url.searchParams.get('brand_id') || undefined,
      category_id: url.searchParams.get('category_id') || undefined,
      model_id: url.searchParams.get('model_id') || undefined,
      condition: url.searchParams.get('condition') || undefined,
      status: url.searchParams.get('status') || 'active',
      seller_id: url.searchParams.get('seller_id') || undefined,
      featured: url.searchParams.get('featured') === 'true',
      search: url.searchParams.get('search') || undefined,
    };

    if (action === 'list') {
      const rl = await checkRateLimit(req, 120, 60);
      if (rl) return rl;
      return await listParts({ page, limit, sort, order, filters });
    }

    if (action === 'get' || action?.match(/^[0-9a-f-]{36}$/)) {
      const rl = await checkRateLimit(req, 120, 60);
      if (rl) return rl;
      const partId = action !== 'get' ? action : url.searchParams.get('id');
      if (partId) return await getPart(partId);
    }

    if (req.method === 'POST') {
      return await createPart(req);
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

async function listParts(params: ListPartsParams) {
  const { page, limit, sort, order, filters } = params;
  const offset = (page - 1) * limit;

  // Tenta cache Redis primeiro
  const rkey = cacheKey({ ...filters, page: String(page), limit: String(limit), sort, order });
  const cached = await redisGet<{ parts: unknown[]; pagination: Record<string, unknown> }>(rkey);
  if (cached) {
    return new Response(JSON.stringify(successResponse(cached)), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  let query = supabase
    .from('parts')
    .select(`
      *,
      brand:brands(id, name, slug, logo_url),
      category:categories(id, name, slug),
      model:car_models(id, name, slug),
      seller:profiles!parts_seller_id_fkey(id, full_name, avatar_url, rating, is_verified)
    `, { count: 'exact' });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.brand_id) query = query.eq('brand_id', filters.brand_id);
  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.model_id) query = query.eq('model_id', filters.model_id);
  if (filters.condition) query = query.eq('condition', filters.condition);
  if (filters.seller_id) query = query.eq('seller_id', filters.seller_id);
  if (filters.featured) query = query.eq('featured', true);

  if (filters.search) {
    const safe = filters.search.replace(/[\\%_*]/g, (m) => `\\${m}`);
    query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  if (filters.min_price) query = query.gte('price', filters.min_price);
  if (filters.max_price) query = query.lte('price', filters.max_price);

  query = query.order(sort, { ascending: order }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const result = {
    parts: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  };

  // Cache no Redis (assíncrono, não bloqueia a resposta)
  redisSet(rkey, result);

  return new Response(JSON.stringify(successResponse(result)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function getPart(partId: string) {
  const { data, error } = await supabase
    .from('parts')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      model:car_models(*),
      seller:profiles!parts_seller_id_fkey(id, full_name, avatar_url, rating, is_verified, total_sales, bio)
    `)
    .eq('id', partId)
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse('Peça não encontrada')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  await supabase.rpc('increment_views', { part_id: partId });

  return new Response(JSON.stringify(successResponse(data)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function createPart(req: Request) {
  const { user, response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  const body = await req.json();
  const { title, description, price, condition, brand_id, category_id, model_id, images } = body as Record<string, unknown>;

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

  if (!title || typeof title !== 'string' || title.length < 3) {
    return new Response(JSON.stringify(errorResponse('Título é obrigatório (mín 3 caracteres)')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('parts')
    .insert({
      seller_id: user.id,
      title,
      description: description || null,
      price: price || null,
      condition: condition || 'good',
      brand_id: brand_id || null,
      category_id: category_id || null,
      model_id: model_id || null,
      images: images || [],
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

  return new Response(JSON.stringify(successResponse(data, 'Peça criada com sucesso')), {
    status: 201,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}