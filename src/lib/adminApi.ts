import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ADMIN_URL = `${SUPABASE_URL}/functions/v1/admin`;

async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(`${ADMIN_URL}${endpoint}`, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  clearTimeout(timeout);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Admin API error');
  return json.data as T;
}

export const adminApi = {
  me: () => adminFetch<any>('/me'),

  dashboard: {
    kpis: () => adminFetch<DashboardKPIs>('/dashboard/kpis'),
    statusEntregas: () => adminFetch<{status:string;count:number}[]>('/dashboard/status-entregas'),
    performance: () => adminFetch<{data:string;no_prazo:number;atrasadas:number}[]>('/dashboard/performance'),
    pedidosRecentes: () => adminFetch<any[]>('/dashboard/pedidos-recentes'),
  },

  setores: {
    list: () => adminFetch<any[]>('/setores'),
    get: (id: string) => adminFetch<any>(`/setores/${id}`),
    create: (data: any) => adminFetch<any>('/setores', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/setores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => adminFetch<any>(`/setores/${id}`, { method: 'DELETE' }),
  },

  cargos: {
    list: () => adminFetch<any[]>('/cargos'),
    get: (id: string) => adminFetch<any>(`/cargos/${id}`),
    create: (data: any) => adminFetch<any>('/cargos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/cargos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => adminFetch<any>(`/cargos/${id}`, { method: 'DELETE' }),
  },

  permissoes: {
    list: (setor_id?: string) => adminFetch<any[]>(`/permissoes${setor_id ? `?setor_id=${setor_id}` : ''}`),
    create: (data: any) => adminFetch<any>('/permissoes', { method: 'POST', body: JSON.stringify(data) }),
  },

  usuarios: {
    list: (search?: string, semCargo?: boolean) => adminFetch<any[]>(`/usuarios?search=${search || ''}${semCargo ? '&sem_cargo=true' : ''}`),
    get: (id: string) => adminFetch<any>(`/usuarios/${id}`),
    create: (data: any) => adminFetch<any>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  armazens: {
    list: () => adminFetch<any[]>('/armazens'),
    get: (id: string) => adminFetch<any>(`/armazens/${id}`),
    create: (data: any) => adminFetch<any>('/armazens', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/armazens/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => adminFetch<any>(`/armazens/${id}`, { method: 'DELETE' }),
  },

  clientes: {
    list: (params?: { page?: number; limit?: number; search?: string }) => {
      const q = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v && q.set(k, String(v)));
      return adminFetch<any>(`/clientes?${q}`);
    },
    get: (id: string) => adminFetch<any>(`/clientes/${id}`),
    create: (data: any) => adminFetch<any>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => adminFetch<any>(`/clientes/${id}`, { method: 'DELETE' }),
  },

  pedidos: {
    list: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v && q.set(k, String(v)));
      return adminFetch<any>(`/pedidos?${q}`);
    },
    get: (id: string) => adminFetch<any>(`/pedidos/${id}`),
    create: (data: any) => adminFetch<any>('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => adminFetch<any>(`/pedidos/${id}`, { method: 'DELETE' }),
  },

  entregas: {
    list: (params?: { page?: number; limit?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (params) Object.entries(params).forEach(([k, v]) => v && q.set(k, String(v)));
      return adminFetch<any>(`/entregas?${q}`);
    },
    create: (data: any) => adminFetch<any>('/entregas', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/entregas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  transportes: {
    list: (armazem_id?: string) => adminFetch<any[]>(`/transportes${armazem_id ? `?armazem_id=${armazem_id}` : ''}`),
    create: (data: any) => adminFetch<any>('/transportes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/transportes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  estoque: {
    list: (armazem_id?: string) => adminFetch<any[]>(`/estoque${armazem_id ? `?armazem_id=${armazem_id}` : ''}`),
    create: (data: any) => adminFetch<any>('/estoque', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => adminFetch<any>(`/estoque/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  transferencias: {
    list: () => adminFetch<any[]>('/transferencias'),
    create: (data: any) => adminFetch<any>('/transferencias', { method: 'POST', body: JSON.stringify(data) }),
  },

  ocorrencias: {
    list: (status?: string) => adminFetch<any[]>(`/ocorrencias${status ? `?status=${status}` : ''}`),
    create: (data: any) => adminFetch<any>('/ocorrencias', { method: 'POST', body: JSON.stringify(data) }),
  },

  configuracoes: {
    list: () => adminFetch<Record<string,string>>('/configuracoes'),
    update: (chave: string, valor: string) => adminFetch<any>('/configuracoes', { method: 'PUT', body: JSON.stringify({ chave, valor }) }),
  },

  auditoria: {
    list: (page = 1, limit = 50) => adminFetch<any[]>(`/auditoria?page=${page}&limit=${limit}`),
  },

  rastreamento: {
    list: (codigo?: string) => adminFetch<any[]>(`/rastreamento${codigo ? `?codigo=${codigo}` : ''}`),
    create: (data: any) => adminFetch<any>('/rastreamento', { method: 'POST', body: JSON.stringify(data) }),
    evento: (data: { pedido_id: string; tipo: string; descricao: string; local?: string; status?: string }) =>
      adminFetch<any>('/rastreamento/evento', { method: 'POST', body: JSON.stringify(data) }),
  },

  etiqueta: {
    get: (pedidoId: string) => adminFetch<any>(`/etiqueta/${pedidoId}`),
  },

  custos: {
    list: () => adminFetch<{ historico: any[]; parametros: any[] }>('/custos'),
    calcular: () => adminFetch<{ success: boolean }>('/custos/calcular'),
    parametros: {
      list: () => adminFetch<any[]>('/custos-parametros'),
      update: (id: string, data: any) => adminFetch<any>(`/custos-parametros/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    },
  },
};

export interface DashboardKPIs {
  total: number;
  concluidas: number;
  atrasos: number;
  cancelados: number;
  emTransito: number;
  taxa: string;
  receita: string;
  receita_mensal: string;
  receita_anual: string;
  custo: string;
  custo_mensal: string;
  custo_anual: string;
  lucro_mensal: string;
  lucro_anual: string;
  margem: string;
}
