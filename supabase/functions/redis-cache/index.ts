import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

function corsHeaders(origin: string | null) {
  const allowedOrigin = isTrustedOrigin(origin);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}

function isTrustedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  try {
    const parsed = new URL(origin);
    const allowed = ['daig.jp', 'partner.daig.jp', 'localhost'];
    const trusted = allowed.some(
      (d) => parsed.hostname === d || parsed.hostname.endsWith('.' + d)
    );
    return trusted ? origin : null;
  } catch {
    return null;
  }
}

function json(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
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
  const origin = req.headers.get('Origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  try {
    if (req.method !== 'POST') {
      return json(405, { success: false, error: 'Method not allowed' }, origin);
    }

    const env = redisEnv();
    if (!env) {
      return json(503, { success: false, error: 'Redis cache not configured' }, origin);
    }

    const user = await requireAuth(req);
    if (!user) {
      return json(401, { success: false, error: 'Não autorizado' }, origin);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json(400, { success: false, error: 'Invalid JSON body' }, origin);
    }

    const action = body?.action;
    const key = typeof body?.key === 'string' ? body.key : '';

    if (action === 'get') {
      if (!key) return json(400, { success: false, error: 'key is required' }, origin);
      if (!isAllowedKey(key)) return json(400, { success: false, error: 'key not allowed' }, origin);
      const value = await redisGet(env.url, env.token, key);
      return json(200, { success: true, data: value ?? null }, origin);
    }

    if (action === 'set') {
      if (!key || body.value === undefined) {
        return json(400, { success: false, error: 'key and value are required' }, origin);
      }
      if (!isAllowedKey(key)) return json(400, { success: false, error: 'key not allowed' }, origin);
      const serialized = JSON.stringify(body.value);
      if (serialized.length > MAX_VALUE_BYTES) {
        return json(400, { success: false, error: 'value too large' }, origin);
      }
      const ttl = Math.min(Math.max(1, Number(body.expiresInSeconds) || 3600), 86400);
      const result = await redisCmd(env.url, env.token, ['SET', key, serialized, 'EX', ttl]);
      return json(200, { success: true, data: result }, origin);
    }

    const adminOnly = ['list', 'delete'];
    if (adminOnly.includes(action)) {
      const admin = await isAdmin(user.id);
      if (!admin) {
        return json(403, { success: false, error: 'Apenas administradores podem executar esta ação' }, origin);
      }
    }

    if (action === 'list') {
      const pattern = typeof body?.pattern === 'string' && body.pattern ? body.pattern : '*';
      const result = await redisCmd(env.url, env.token, ['KEYS', pattern]);
      return json(200, { success: true, data: Array.isArray(result) ? result : [] }, origin);
    }

    if (action === 'delete') {
      if (!key) return json(400, { success: false, error: 'key is required' }, origin);
      const result = await redisCmd(env.url, env.token, ['DEL', key]);
      return json(200, { success: true, data: result }, origin);
    }

    return json(400, { success: false, error: 'Unknown action' }, origin);
  } catch (err: any) {
    return json(500, { success: false, error: err.message || 'Error accessing Redis cache' }, origin);
  }
});
