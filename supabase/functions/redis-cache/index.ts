import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function requireAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) return null;
  return user;
}

async function isAdmin(userId: string) {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return !!profile?.role?.includes('admin');
}

function redisEnv() {
  const url = Deno.env.get('UPSTASH_REDIS_REST_URL')?.trim();
  const token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN')?.trim();
  if (!url || !token) return null;
  return { url, token };
}

const ALLOWED_KEY_PATTERNS: RegExp[] = [
  /^catalog:[A-Za-z0-9%&=_+.\-]{1,200}$/,
  /^ai_analysis_or_[a-f0-9]{64}$/,
];
const MAX_VALUE_BYTES = 512 * 1024;

function isAllowedKey(key: string): boolean {
  return ALLOWED_KEY_PATTERNS.some((p) => p.test(key));
}

async function redisGet(url: string, token: string, key: string): Promise<unknown> {
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const jsonData = await res.json();
  if (!jsonData?.result) return null;
  try {
    return JSON.parse(jsonData.result);
  } catch {
    return jsonData.result;
  }
}

async function redisCmd(url: string, token: string, args: unknown[]): Promise<unknown> {
  const res = await fetch(`${url}/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) return null;
  const jsonData = await res.json();
  return jsonData?.result;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    if (req.method !== 'POST') {
      return json(405, { success: false, error: 'Method not allowed' });
    }

    const env = redisEnv();
    if (!env) {
      return json(503, { success: false, error: 'Redis cache not configured' });
    }

    const user = await requireAuth(req);
    if (!user) {
      return json(401, { success: false, error: 'Não autorizado' });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json(400, { success: false, error: 'Invalid JSON body' });
    }

    const action = body?.action;
    const key = typeof body?.key === 'string' ? body.key : '';

    if (action === 'get') {
      if (!key) return json(400, { success: false, error: 'key is required' });
      if (!isAllowedKey(key)) return json(400, { success: false, error: 'key not allowed' });
      const value = await redisGet(env.url, env.token, key);
      return json(200, { success: true, data: value ?? null });
    }

    if (action === 'set') {
      if (!key || body.value === undefined) {
        return json(400, { success: false, error: 'key and value are required' });
      }
      if (!isAllowedKey(key)) return json(400, { success: false, error: 'key not allowed' });
      const serialized = JSON.stringify(body.value);
      if (serialized.length > MAX_VALUE_BYTES) {
        return json(400, { success: false, error: 'value too large' });
      }
      const ttl = Math.min(Math.max(1, Number(body.expiresInSeconds) || 3600), 86400);
      const result = await redisCmd(env.url, env.token, ['SET', key, serialized, 'EX', ttl]);
      return json(200, { success: true, data: result });
    }

    const adminOnly = ['list', 'delete'];
    if (adminOnly.includes(action)) {
      const admin = await isAdmin(user.id);
      if (!admin) {
        return json(403, { success: false, error: 'Apenas administradores podem executar esta ação' });
      }
    }

    if (action === 'list') {
      const pattern = typeof body?.pattern === 'string' && body.pattern ? body.pattern : '*';
      const result = await redisCmd(env.url, env.token, ['KEYS', pattern]);
      return json(200, { success: true, data: Array.isArray(result) ? result : [] });
    }

    if (action === 'delete') {
      if (!key) return json(400, { success: false, error: 'key is required' });
      const result = await redisCmd(env.url, env.token, ['DEL', key]);
      return json(200, { success: true, data: result });
    }

    return json(400, { success: false, error: 'Unknown action' });
  } catch (err: any) {
    return json(500, { success: false, error: err.message || 'Error accessing Redis cache' });
  }
});
