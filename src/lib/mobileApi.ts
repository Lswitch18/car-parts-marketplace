import { supabase } from './supabase';

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin`;

async function mobileFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.error || json.error || 'Erro na API');
  return json.data as T;
}

export const mobileApi = {
  me: () => mobileFetch<any>('/me'),

  dashboard: {
    hoje: () => mobileFetch<any>('/dashboard/kpis'),
  },

  coletas: {
    list: (params?: { page?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.status) q.set('status', params.status);
      return mobileFetch<any>(`/coletas?${q}`);
    },
    get: (id: string) => mobileFetch<any>(`/coletas/${id}`),
    update: (id: string, data: any) => mobileFetch<any>(`/coletas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    create: (data: any) => mobileFetch<any>('/coletas', { method: 'POST', body: JSON.stringify(data) }),
  },

  entregas: {
    list: (params?: { page?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.status) q.set('status', params.status);
      return mobileFetch<any>(`/entregas?${q}`);
    },
    get: (id: string) => mobileFetch<any>(`/entregas/${id}`),
    update: (id: string, data: any) => mobileFetch<any>(`/entregas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  envio: {
    create: (data: any) => mobileFetch<any>('/envio', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, data: any) => mobileFetch<any>(`/envio/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  recebimento: {
    list: (armazem_id?: string) => mobileFetch<any[]>(`/recebimento${armazem_id ? `?armazem_id=${armazem_id}` : ''}`),
    confirmar: (data: any) => mobileFetch<any>('/recebimento', { method: 'POST', body: JSON.stringify(data) }),
  },

  armazens: {
    list: () => mobileFetch<any[]>('/armazens'),
    get: (id: string) => mobileFetch<any>(`/armazens/${id}`),
  },

  estoque: {
    list: (armazem_id?: string) => mobileFetch<any[]>(`/estoque${armazem_id ? `?armazem_id=${armazem_id}` : ''}`),
  },

  rastreamento: {
    list: (codigo?: string) => mobileFetch<any[]>(`/rastreamento${codigo ? `?codigo=${codigo}` : ''}`),
    create: (data: any) => mobileFetch<any>('/rastreamento', { method: 'POST', body: JSON.stringify(data) }),
  },
};
