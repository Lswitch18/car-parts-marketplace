const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

interface ApiOptions {
  headers?: Record<string, string>;
  method?: string;
  body?: string;
}

async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem('sb-access-token');
  
  const response = await fetch(`${FUNCTIONS_URL}${endpoint}`, {
    ...options,
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

    create: (data: { part_id: string; amount: number; shipping?: Record<string, string> }) => 
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
      const token = localStorage.getItem('sb-access-token');
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
      const token = localStorage.getItem('sb-access-token');
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
      const token = localStorage.getItem('sb-access-token');
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
      const token = localStorage.getItem('sb-access-token');
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
    analyzePart: (image: string) => fetchApi('/analyze-part', { method: 'POST', body: JSON.stringify({ image }) }),
  },
};

export type ApiClient = typeof api;