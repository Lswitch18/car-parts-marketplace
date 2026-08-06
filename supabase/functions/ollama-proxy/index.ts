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

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) return false;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return !!profile?.role?.includes('admin');
}

function ollamaEnv() {
  const rawUrl = Deno.env.get('OLLAMA_API_URL')?.trim();
  const auth = Deno.env.get('OLLAMA_API_AUTH')?.trim();
  if (!rawUrl || !auth) return null;
  // Normaliza para a base da API (remove sufixo /api/chat se presente)
  const base = rawUrl.replace(/\/api\/chat\/?$/, '');
  return { base, auth };
}

function buildHeaders(auth: string, withAuth = true) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (withAuth && auth) headers['Authorization'] = auth;
  return headers;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  try {
    if (!(await requireAdmin(req))) {
      return json(401, { success: false, error: 'Não autorizado' });
    }

    const env = ollamaEnv();
    if (!env) {
      return json(503, { success: false, error: 'Ollama proxy not configured' });
    }

    if (req.method !== 'POST') {
      return json(405, { success: false, error: 'Method not allowed' });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json(400, { success: false, error: 'Invalid JSON body' });
    }

    const action = body?.action;

    if (action === 'health') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const [tagsRes, psRes] = await Promise.all([
          fetch(`${env.base}/api/tags`, { headers: buildHeaders(env.auth), signal: controller.signal }),
          fetch(`${env.base}/api/ps`, { headers: buildHeaders(env.auth), signal: controller.signal }).catch(() => null),
        ]);
        if (!tagsRes.ok) {
          return json(200, { success: true, data: { status: 'offline', models: [], runningModels: [], serverUrl: `${env.base}/api/chat` } });
        }
        const tags = await tagsRes.json();
        const models = (tags.models || []).map((m: any) => m.name || m.model || 'unknown');
        let runningModels: string[] = [];
        if (psRes?.ok) {
          const ps = await psRes.json();
          runningModels = (ps.models || []).map((m: any) => m.name || m.model || 'unknown');
        }
        return json(200, {
          success: true,
          data: { status: 'online', models, runningModels, serverUrl: `${env.base}/api/chat` },
        });
      } catch (err: any) {
        return json(200, {
          success: true,
          data: { status: err.name === 'AbortError' ? 'timeout' : 'offline', models: [], runningModels: [], serverUrl: `${env.base}/api/chat` },
        });
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (action === 'logs') {
      const res = await fetch(`${env.base}/api/logs`, { headers: buildHeaders(env.auth) });
      const headers = { ...corsHeaders(), 'Content-Type': 'text/event-stream' };
      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ success: false, error: err || `HTTP ${res.status}` }), {
          status: res.status,
          headers,
        });
      }
      return new Response(res.body, { status: 200, headers });
    }

    if (action === 'pull') {
      if (!body?.model) return json(400, { success: false, error: 'model is required' });
      const res = await fetch(`${env.base}/api/pull`, {
        method: 'POST',
        headers: buildHeaders(env.auth),
        body: JSON.stringify({ model: body.model, stream: true }),
      });
      const headers = { ...corsHeaders(), 'Content-Type': 'application/json' };
      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ success: false, error: err || `HTTP ${res.status}` }), {
          status: res.status,
          headers,
        });
      }
      return new Response(res.body, { status: 200, headers });
    }

    if (action === 'chat') {
      if (!body?.model) return json(400, { success: false, error: 'model is required' });
      const res = await fetch(`${env.base}/api/chat`, {
        method: 'POST',
        headers: buildHeaders(env.auth),
        body: JSON.stringify({
          model: body.model,
          messages: Array.isArray(body.messages) ? body.messages : [],
          format: body.format,
          stream: body.stream !== false,
        }),
      });
      const headers = { ...corsHeaders(), 'Content-Type': 'application/json' };
      if (!res.ok) {
        const err = await res.text();
        return new Response(JSON.stringify({ success: false, error: err || `HTTP ${res.status}` }), {
          status: res.status,
          headers,
        });
      }
      return new Response(res.body, { status: 200, headers });
    }

    return json(400, { success: false, error: 'Unknown action' });
  } catch (err: any) {
    return json(500, { success: false, error: err.message || 'Ollama proxy error' });
  }
});
