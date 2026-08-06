import { supabase } from '@/modules/shared/lib/supabase';

const OLLAMA_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ollama-proxy`;

/**
 * Proxy de acesso ao servidor Ollama (AI Ops).
 * Todas as credenciais do servidor Ollama ficam na Edge Function `ollama-proxy`
 * (env OLLAMA_API_URL/OLLAMA_API_AUTH), nunca no bundle do cliente.
 */
export async function ollamaProxy(body: Record<string, unknown>): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return fetch(OLLAMA_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

export async function ollamaProxyJson<T>(body: Record<string, unknown>): Promise<T> {
  const res = await ollamaProxy(body);
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Ollama proxy error (HTTP ${res.status})`);
  }
  return json.data as T;
}
