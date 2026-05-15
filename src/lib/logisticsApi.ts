import { supabase } from './supabase';

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logistics`;

async function logisticsFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Sem sessão ativa');

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error?.error || json.error || 'Erro na API Logistics');
  return json.data as T;
}

export const logisticsApi = {
  // OMS - Shipments
  shipments: {
    list: (params?: { etapa?: string; search?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.etapa) q.set('etapa', params.etapa);
      if (params?.search) q.set('search', params.search);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      return logisticsFetch<any>(`/oms/shipments?${q}`);
    },
    get: (id: string) => logisticsFetch<any>(`/oms/shipments/${id}`),
    create: (data: any) => logisticsFetch<any>('/oms/shipments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => logisticsFetch<any>(`/oms/shipments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // OMS - Labels
  labels: {
    gerar: (shipmentIds: string[]) => logisticsFetch<any[]>(`/oms/labels?ids=${shipmentIds.join(',')}`),
    zpl: (shipmentId: string) => logisticsFetch<string>(`/oms/labels/zpl/${shipmentId}`),
    preview: (shipmentId: string) => logisticsFetch<any>(`/oms/labels/preview/${shipmentId}`),
    async downloadZpl(shipmentId: string, filename?: string) {
      const res = await fetch(`${BASE}/oms/labels/zpl/${shipmentId}`, { headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename || `etiqueta.zpl`;
      a.click(); URL.revokeObjectURL(url);
    },
    async downloadZplBatch(shipmentIds: string[]) {
      for (const id of shipmentIds) {
        const { data: s } = await supabase.from('admin_shipments').select('codigo').eq('id', id).single();
        await logisticsApi.labels.downloadZpl(id, `etiqueta-${s?.codigo || id.slice(0, 8)}.zpl`);
      }
    },
  },

  // Dropoff
  dropoff: {
    create: (data: { shipment_id: string; agencia_id: string }) => logisticsFetch<any>('/dropoff', { method: 'POST', body: JSON.stringify(data) }),
    list: (agenciaId?: string) => logisticsFetch<any[]>(`/dropoff${agenciaId ? `/agency/${agenciaId}` : ''}`),
  },

  // TMS - Rotas
  rotas: {
    list: (params?: { tipo?: string; data?: string }) => {
      const q = new URLSearchParams();
      if (params?.tipo) q.set('tipo', params.tipo);
      if (params?.data) q.set('data', params.data);
      return logisticsFetch<any[]>(`/tms/routes?${q}`);
    },
    create: (data: any) => logisticsFetch<any>('/tms/routes', { method: 'POST', body: JSON.stringify(data) }),
  },

  // TMS - Assign driver
  assign: (data: { shipment_id: string; motorista_id: string; veiculo_id?: string; transportadora?: string }) =>
    logisticsFetch<any>('/tms/assign', { method: 'POST', body: JSON.stringify(data) }),

  // Tracking
  tracking: {
    get: (codigo: string) => logisticsFetch<any>(`/tracking/${encodeURIComponent(codigo)}`),
    gps: (motorista_id: string, latitude: number, longitude: number, precisao?: number, velocidade?: number) =>
      logisticsFetch<any>('/tracking/gps', { method: 'POST', body: JSON.stringify({ motorista_id, latitude, longitude, precisao, velocidade: velocidade || 0 }) }),
    gpsList: () => logisticsFetch<any[]>('/tracking/gps'),
    gpsHistory: (motorista_id: string, since?: string) =>
      logisticsFetch<any[]>(`/tracking/gps?motorista_id=${motorista_id}&history=true${since ? `&since=${since}` : ''}`),
  },

  // Dashboard
  dashboard: () => logisticsFetch<any>('/dashboard'),

  // WMS
  wms: {
    receive: (data: { codigo_barras: string; armazem_id: string; zona_id?: string }) =>
      logisticsFetch<any>('/wms/receive', { method: 'POST', body: JSON.stringify(data) }),
    sort: (data: { inventory_id: string; zona_id: string; rota_id?: string }) =>
      logisticsFetch<any>('/wms/sort', { method: 'POST', body: JSON.stringify(data) }),
    crossdock: (data: { inventory_id: string; armazem_destino_id: string; zona_destino_id?: string }) =>
      logisticsFetch<any>('/wms/crossdock', { method: 'POST', body: JSON.stringify(data) }),
    inventory: (armazem_id?: string, zona_id?: string) => {
      const q = new URLSearchParams();
      if (armazem_id) q.set('armazem_id', armazem_id);
      if (zona_id) q.set('zona_id', zona_id);
      return logisticsFetch<any[]>('/wms/inventory?' + q);
    },
    zones: (armazem_id?: string) => {
      const q = new URLSearchParams();
      if (armazem_id) q.set('armazem_id', armazem_id);
      return logisticsFetch<any[]>('/wms/zones?' + q);
    },
  },
};
