/**
 * Redis cache client.
 * Todas as operações são delegadas à Edge Function `redis-cache`,
 * que executa os comandos Upstash do lado do servidor (UPSTASH_REDIS_REST_URL/TOKEN
 * ficam no ambiente da função, NUNCA no bundle do cliente).
 */

import { supabase } from '@/modules/shared/lib/supabase';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redis-cache`;

async function callRedis(body: Record<string, unknown>): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(FUNCTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json.success ? json.data : null;
}

export async function getCache(key: string): Promise<any | null> {
  try {
    const value = await callRedis({ action: 'get', key });
    return value ?? null;
  } catch (error) {
    console.warn('Redis Cache Miss (Error):', error);
    return null;
  }
}

export async function setCache(key: string, value: any, expiresInSeconds: number = 3600): Promise<void> {
  try {
    await callRedis({ action: 'set', key, value, expiresInSeconds });
  } catch (error) {
    console.warn('Redis Cache Set Error:', error);
  }
}

export async function getRedisKeys(pattern: string = '*'): Promise<string[]> {
  try {
    const keys = await callRedis({ action: 'list', pattern });
    return Array.isArray(keys) ? keys : [];
  } catch (error) {
    console.warn('Redis KEYS error:', error);
    return [];
  }
}

export async function deleteRedisKey(key: string): Promise<boolean> {
  try {
    const result = await callRedis({ action: 'delete', key });
    return result !== null;
  } catch (error) {
    console.warn('Redis DEL error:', error);
    return false;
  }
}
