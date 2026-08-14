/**
 * In-memory cache with TTL support.
 *
 * A Edge Function `redis-cache` não possui CORS configurado no Supabase,
 * causando erros de preflight no console do browser. Como o cache em memória
 * já atendia 100% das necessidades (análise de IA, catálogo, queries),
 * removemos completamente as chamadas remotas para garantir console limpo.
 *
 * Quando a Edge Function for configurada com CORS, basta restaurar callRedis().
 */

const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

/** Limpar entradas expiradas periodicamente (a cada 60s) */
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache) {
      if (now >= entry.expiresAt) {
        memoryCache.delete(key);
      }
    }
    if (memoryCache.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL_MS);
}

export async function getCache(key: string): Promise<unknown | null> {
  const mem = memoryCache.get(key);
  if (!mem) return null;

  if (Date.now() < mem.expiresAt) {
    return mem.value;
  }

  memoryCache.delete(key);
  return null;
}

export async function setCache(key: string, value: unknown, expiresInSeconds: number = 3600): Promise<void> {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  });
  ensureCleanup();
}

export async function getRedisKeys(pattern: string = '*'): Promise<string[]> {
  if (pattern === '*') {
    return Array.from(memoryCache.keys());
  }

  // Suporte básico a glob pattern (e.g. "ai_analysis_*")
  const regex = new RegExp(
    '^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
  );
  return Array.from(memoryCache.keys()).filter((k) => regex.test(k));
}

export async function deleteRedisKey(key: string): Promise<boolean> {
  return memoryCache.delete(key);
}
