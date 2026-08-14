/**
 * Redis cache client with intelligent in-memory fallback.
 * Utiliza o SDK supabase.functions.invoke('redis-cache') para compatibilidade total de CORS/Auth.
 * Se a Edge Function ou Redis estiverem indisponíveis, utiliza cache em memória (zero falhas).
 */

import { supabase } from '@/modules/shared/lib/supabase';

const memoryCache = new Map<string, { value: any; expiresAt: number }>();

async function callRedis(body: Record<string, unknown>): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('redis-cache', {
      body,
    });

    if (error || !data) {
      return null;
    }

    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getCache(key: string): Promise<any | null> {
  // 1. Verificar cache em memória primeiro
  const mem = memoryCache.get(key);
  if (mem) {
    if (Date.now() < mem.expiresAt) {
      return mem.value;
    }
    memoryCache.delete(key);
  }

  // 2. Tentar Redis via Edge Function
  try {
    const remoteValue = await callRedis({ action: 'get', key });
    if (remoteValue !== null && remoteValue !== undefined) {
      memoryCache.set(key, { value: remoteValue, expiresAt: Date.now() + 1000 * 60 * 10 });
      return remoteValue;
    }
  } catch {
    // Silencioso
  }

  return null;
}

export async function setCache(key: string, value: any, expiresInSeconds: number = 3600): Promise<void> {
  // Salvar no cache local em memória
  memoryCache.set(key, { value, expiresAt: Date.now() + expiresInSeconds * 1000 });

  // Tentar persistir no Redis remoto via Edge Function de forma não bloqueante
  callRedis({ action: 'set', key, value, expiresInSeconds }).catch(() => {});
}

export async function getRedisKeys(pattern: string = '*'): Promise<string[]> {
  try {
    const keys = await callRedis({ action: 'list', pattern });
    return Array.isArray(keys) ? keys : [];
  } catch {
    return [];
  }
}

export async function deleteRedisKey(key: string): Promise<boolean> {
  memoryCache.delete(key);
  try {
    const result = await callRedis({ action: 'delete', key });
    return result !== null;
  } catch {
    return false;
  }
}
