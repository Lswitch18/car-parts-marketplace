import { supabase, successResponse, errorResponse, corsHeaders, getAuthUser, verifyToken } from '../utils/base.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      if (action === 'me') return await getCurrentUser(req);
      if (action === 'list') return await listUsers();
      const userId = action?.match(/^[0-9a-f-]{36}$/) ? action : url.searchParams.get('id');
      if (userId) return await getUser(userId);
    }

    if (req.method === 'PUT' && action === 'me') {
      const body = await req.json();
      return await updateProfile(req, body);
    }

    if (req.method === 'POST' && action === 'verify') {
      const body = await req.json();
      return await verifyUser(body);
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

async function getCurrentUser(req: Request) {
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

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify(errorResponse('Perfil não encontrado')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, bio, rating, total_sales, is_verified, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse('Usuário não encontrado')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data: parts } = await supabase
    .from('parts')
    .select('id, title, price, images, status, created_at')
    .eq('seller_id', userId)
    .eq('status', 'active')
    .limit(10);

  return new Response(JSON.stringify(successResponse({ ...data, active_listings: parts || [] })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function listUsers() {
  const url = new URL(req?.url || 'http://localhost');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const role = url.searchParams.get('role') || undefined;
  const verified = url.searchParams.get('verified') === 'true';

  const offset = (page - 1) * limit;

  let query = supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, rating, total_sales, is_verified, created_at', { count: 'exact' });

  if (role) query = query.eq('role', role);
  if (verified) query = query.eq('is_verified', true);

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
    users: data,
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function updateProfile(req: Request, body: Record<string, unknown>) {
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

  const allowedFields = ['full_name', 'phone', 'address', 'cep', 'avatar_url', 'bio', 'role'];
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return new Response(JSON.stringify(errorResponse('Nenhum campo para atualizar')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data, 'Perfil atualizado')), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function verifyUser(body: Record<string, unknown>) {
  const { user_id, admin_key } = body;

  const expectedAdminKey = Deno.env.get('ADMIN_VERIFY_KEY');
  if (admin_key !== expectedAdminKey) {
    return new Response(JSON.stringify(errorResponse('Chave de administração inválida')), {
      status: 403,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: true, updated_at: new Date().toISOString() })
    .eq('id', user_id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data, 'Usuário verificado')), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}