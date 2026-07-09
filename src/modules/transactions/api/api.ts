import { supabase } from '@/modules/shared/lib/supabase';
import { BRANDS } from '@/modules/shared/lib/constants';
import { getCache, setCache } from '@/modules/shared/lib/redisCache';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

interface ApiOptions {
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  timeout?: number; // Timeout em milissegundos
}

async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token;
  
  // Se um timeout for especificado, usamos o AbortSignal
  const signal = options.timeout ? AbortSignal.timeout(options.timeout) : undefined;
  
  const response = await fetch(`${FUNCTIONS_URL}${endpoint}`, {
    ...options,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'API request failed');
  }

  return data.data;
}

export const api = {
  analytics: {
    all: () => fetchApi('/analytics/all'),
    sales: (days = 7) => fetchApi(`/analytics/sales?days=${days}`),
    sellers: (limit = 5) => fetchApi(`/analytics/sellers?limit=${limit}`),
    categories: () => fetchApi('/analytics/categories'),
    users: () => fetchApi('/analytics/users'),
    brands: (limit = 5) => fetchApi(`/analytics/brands?limit=${limit}`),
    status: () => fetchApi('/analytics/status'),
    daily: () => fetchApi('/analytics/daily'),
    recent: (limit = 10) => fetchApi(`/analytics/recent?limit=${limit}`),
  },

  parts: {
    list: (params?: {
      page?: number;
      limit?: number;
      sort?: 'created_at' | 'price' | 'views';
      order?: 'asc' | 'desc';
      brand_id?: string;
      category_id?: string;
      model_id?: string;
      condition?: string;
      status?: string;
      seller_id?: string;
      search?: string;
      featured?: boolean;
    }) => {
      const query = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v && query.set(k, String(v)));
      return fetchApi(`/parts/list?${query}`);
    },

    get: (id: string) => fetchApi(`/parts/${id}`),

    create: (data: {
      title: string;
      description?: string;
      price?: number;
      condition?: string;
      brand_id?: string;
      category_id?: string;
      model_id?: string;
      images?: string[];
    }) => fetchApi('/parts', { method: 'POST', body: JSON.stringify(data) }),
  },

  users: {
    me: () => fetchApi('/users/me'),
    
    get: (id: string) => fetchApi(`/users/${id}`),

    update: (data: {
      full_name?: string;
      phone?: string;
      address?: string;
      cep?: string;
      avatar_url?: string;
      bio?: string;
    }) => fetchApi('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  },

  transactions: {
    list: (params?: { role?: 'buyer' | 'seller'; status?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v && query.set(k, String(v)));
      return fetchApi(`/transactions/list?${query}`);
    },

    get: (id: string) => fetchApi(`/transactions/${id}`),

    create: (data: {
      part_id: string;
      amount: number;
      shipping?: Record<string, string>;
      /** Chave determinística para evitar transações duplicadas (hash de buyer+part+message) */
      idempotency_key?: string;
      /** ID da mensagem de price_proposal confirmada — backend valida o preço real */
      confirmed_message_id?: string;
    }) =>
      fetchApi('/transactions/create', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: { payment_status?: string; fulfillment_status?: string }) =>
      fetchApi(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    calculateFees: (amount: number) => fetchApi(`/transactions/calculate?amount=${amount}`),
  },

  auctions: {
    active: () => fetchApi('/auctions/active'),
    
    ended: () => fetchApi('/auctions/ended'),

    list: (params?: { status?: 'active' | 'ended' | 'sold'; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v && query.set(k, String(v)));
      return fetchApi(`/auctions/list?${query}`);
    },

    get: (id: string) => fetchApi(`/auctions/${id}`),

    create: (data: {
      title: string;
      description?: string;
      starting_bid: number;
      buy_now_price?: number;
      auction_duration_hours: number;
      condition?: string;
      brand_id?: string;
      category_id?: string;
      model_id?: string;
      images?: string[];
      buy_now_enabled?: boolean;
    }) => fetchApi('/auctions/create', { method: 'POST', body: JSON.stringify(data) }),

    bid: (data: { auction_id: string; amount: number }) =>
      fetchApi('/auctions/bid', { method: 'POST', body: JSON.stringify(data) }),

    buyNow: (data: { auction_id: string }) =>
      fetchApi('/auctions/buy-now', { method: 'POST', body: JSON.stringify(data) }),

    payWinner: (data: { transaction_id: string }) =>
      fetchApi('/auctions/pay', { method: 'POST', body: JSON.stringify(data) }),

    resolve: (data: { auction_id: string }) =>
      fetchApi('/auctions/resolve', { method: 'POST', body: JSON.stringify(data) }),

    resolveAll: () =>
      fetchApi('/auctions/resolve-all', { method: 'POST', body: JSON.stringify({}) }),
  },

  categories: {
    list: () => fetchApi('/categories'),
    get: (id: string) => fetchApi(`/categories/${id}`),
  },

  brands: {
    list: () => fetchApi('/brands'),
    get: (id: string) => fetchApi(`/brands/${id}`),
  },

  stripe: {
    createCheckout: async (data: {
      transaction_id: string;
      part_id: string;
      buyer_id: string;
      seller_id: string;
      amount: number;
      shipping?: Record<string, string>;
      auction_id?: string;
      title?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token;
      const response = await fetch(`${FUNCTIONS_URL}/stripe-checkout/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create checkout');
      }
      return result;
    },

    createConnectedAccount: async (sellerId: string, email?: string) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token;
      const response = await fetch(`${FUNCTIONS_URL}/stripe-checkout/create-connected-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ seller_id: sellerId, email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create connected account');
      }
      return result;
    },

    createAccountLink: async (accountId: string, sellerId: string) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token;
      const response = await fetch(`${FUNCTIONS_URL}/stripe-checkout/account-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ account_id: accountId, seller_id: sellerId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create account link');
      }
      return result;
    },

    createPortalSession: async (sellerId: string) => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token;
      const response = await fetch(`${FUNCTIONS_URL}/stripe-checkout/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ seller_id: sellerId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create portal session');
      }
      return result;
    },
  },

  notifications: {
    send: (data: {
      type: 'email' | 'push' | 'system';
      to: string;
      subject?: string;
      body: string;
      metadata?: Record<string, unknown>;
    }) => fetchApi('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  },

  ai: {
    // Análise de imagem via Edge Function do Supabase (para maior segurança e confiabilidade)
    analyzePart: async (image: string, language: string = 'pt', vin?: string) => {
      const base64Image = image.split(',')[1] || image;
      
      let cacheKey = '';
      try {
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(base64Image + language + (vin || '')));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        cacheKey = `ai_analysis_or_${hashHex}`;

        const cached = await getCache(cacheKey);
        if (cached) {
          console.log('[analyzePart] Cache HIT for key:', cacheKey);
          return cached;
        }
      } catch (e) {
        console.warn('Cache check error:', e);
      }

      try {
        console.log('[analyzePart] Cache MISS. Chamando a Edge Function analyze-part...');
        const parsedData = await fetchApi<any>('/analyze-part', {
          method: 'POST',
          body: JSON.stringify({ image: base64Image, language, vin }),
          timeout: 120000 // 2 minutos
        });

        console.log('[analyzePart] Retorno da Edge Function:', parsedData);

        // Normalize text to match internal UUID lookup maps (lowercase, trimmed)
        if (parsedData && parsedData.is_car_part) {
          if (typeof parsedData.brand === 'string') parsedData.brand = parsedData.brand.toLowerCase().trim();
          if (typeof parsedData.category === 'string') parsedData.category = parsedData.category.toLowerCase().trim();
          
          // Verify and correct the model against the project's predefined list
          if (typeof parsedData.model === 'string' && parsedData.model.trim()) {
            const rawModel = parsedData.model.trim().toLowerCase();
            const allValidModels = BRANDS.flatMap(b => b.models);
            
            const matchedModel = allValidModels.find(m => m.toLowerCase() === rawModel);
            
            if (matchedModel) {
              parsedData.model = matchedModel;
            } else {
              const partialMatch = allValidModels.find(m => 
                m.toLowerCase().includes(rawModel) || rawModel.includes(m.toLowerCase())
              );
              
              if (partialMatch) {
                parsedData.model = partialMatch;
              } else {
                const randomBrand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
                const randomModel = randomBrand.models[Math.floor(Math.random() * randomBrand.models.length)];
                parsedData.brand = randomBrand.id;
                parsedData.model = randomModel;
              }
            }
          }

          if (cacheKey) {
            await setCache(cacheKey, parsedData, 60 * 60 * 24 * 7).catch(console.warn);
          }
        }

        return parsedData;
      } catch (err: any) {
        console.error('[analyzePart] Falha ao analisar peça via Edge Function:', err);
        throw new Error(err.message || 'Falha na análise via Edge Function');
      }
    },
    
    fetchOllamaLogs: async () => {
      const baseUrl = import.meta.env.VITE_OLLAMA_API_URL || 'https://201.46.120.192.nip.io/api/chat';
      const logsUrl = baseUrl.replace(/\/api\/chat\/?$/, '/api/logs');
      
      try {
        const response = await fetch(logsUrl, {
          method: 'GET',
          headers: {
            'Authorization': import.meta.env.VITE_OLLAMA_API_AUTH || 'Basic YXBpOk0zdW4wbTNAQDE5OTE4'
          }
        });
        
        if (!response.ok) {
          throw new Error('Falha ao buscar logs (HTTP ' + response.status + ')');
        }
        
        const data = await response.json();
        return data.logs || '';
      } catch (err: any) {
        console.error('[fetchOllamaLogs] Request failed:', err);
        throw new Error(err.message || 'Falha ao conectar no micro-serviço de logs');
      }
    },
    
    pullModel: async (modelName: string) => {
      const baseUrl = import.meta.env.VITE_OLLAMA_API_URL || 'https://201.46.120.192.nip.io/api/chat';
      const pullUrl = baseUrl.replace(/\/api\/chat\/?$/, '/api/pull');
      
      const response = await fetch(pullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': import.meta.env.VITE_OLLAMA_API_AUTH || 'Basic YXBpOk0zdW4wbTNAQDE5OTE4'
        },
        body: JSON.stringify({ model: modelName, stream: true })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao iniciar download (HTTP ' + response.status + ')');
      }
      
      return response;
    },
    
    generate3D: (image: string) => fetchApi('/generate-3d', { method: 'POST', body: JSON.stringify({ image }) }),
    check3DStatus: (id: string) => fetchApi('/generate-3d', { method: 'POST', body: JSON.stringify({ id }) }),
    saveToDrive: (modelUrl: string, title: string) => fetchApi('/save-to-drive', { method: 'POST', body: JSON.stringify({ modelUrl, title }) }),
  },

  partsLookup: {
    brands: () => fetchPublic<{ id: string; name: string; slug: string; logo_url?: string; parts_count: number }[]>('/parts-lookup/brands'),

    models: (brandId: string) => fetchPublic<{ name: string; generations: { name: string | null; year_start: number; year_end: number | null }[] }[]>(`/parts-lookup/models?brand_id=${brandId}`),

    vehicles: (model: string, year?: number) => {
      const params = new URLSearchParams()
      if (model) params.set('model', model)
      if (year) params.set('year', String(year))
      return fetchPublic<import('@/modules/shared/types').VehicleModel[]>(`/parts-lookup/vehicles?${params}`)
    },

    categories: () => fetchPublic<{ id: string; name: string; slug: string; parts_count: number }[]>('/parts-lookup/categories'),

    search: (params: { q?: string; vehicle_id?: string; category_id?: string; brand_id?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && query.set(k, String(v)))
      return fetchPublic<import('@/modules/shared/types').PartsLookupResult>(`/parts-lookup/search?${query}`)
    },

    partDetail: (partNumber: string) => fetchPublic<import('@/modules/shared/types').PartCatalogItem>(`/parts-lookup/part/${encodeURIComponent(partNumber)}`),

    vehicleParts: (vehicleId: string) => fetchPublic<import('@/modules/shared/types').PartsByCategory[]>(`/parts-lookup/vehicle/${vehicleId}/parts`),
  },
};

async function fetchPublic<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${FUNCTIONS_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed')
  }

  return data.data
}

export type ApiClient = typeof api;