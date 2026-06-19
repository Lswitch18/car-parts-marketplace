import { getCache, setCache } from '@/modules/shared/lib/redisCache';

const PARTS_API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parts`;

interface PartsFilters {
  brand_id?: string;
  category_id?: string;
  model_id?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
}

interface PartsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  filters?: PartsFilters;
}

export async function fetchParts(params: PartsParams = {}) {
  const { page = 1, limit = 50, sort = 'created_at', order = 'desc', filters = {} } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));
  searchParams.set('sort', sort);
  searchParams.set('order', order);
  searchParams.set('status', 'active');

  if (filters.brand_id) searchParams.set('brand_id', filters.brand_id);
  if (filters.category_id) searchParams.set('category_id', filters.category_id);
  if (filters.model_id) searchParams.set('model_id', filters.model_id);
  if (filters.condition) searchParams.set('condition', filters.condition);
  if (filters.min_price) searchParams.set('min_price', String(filters.min_price));
  if (filters.max_price) searchParams.set('max_price', String(filters.max_price));
  if (filters.search) searchParams.set('search', filters.search);

  // 1. Criar a chave do Cache
  const cacheKey = `catalog:${searchParams.toString()}`;

  // 2. Tentar buscar no Redis (Read-Through Cache)
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    console.log('⚡ Cache Hit! Carregamento via Redis.');
    return cachedData;
  }

  // 3. Cache Miss: Buscar no Banco de Dados (Supabase)
  console.log('🐌 Cache Miss. Buscando no Supabase...');
  const res = await fetch(`${PARTS_API}/list?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao buscar peças');
  }

  const json = await res.json();
  const data = json.data;

  // 4. Salvar no Redis por 1 hora (3600 segundos) para os próximos usuários
  await setCache(cacheKey, data, 3600);

  return data;
}
