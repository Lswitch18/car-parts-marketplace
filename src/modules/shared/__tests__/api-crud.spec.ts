/**
 * Teste de Integração — CRUD real contra Edge Functions do Supabase
 *
 * Testa INSERT, GET, UPDATE, LIST para cada endpoint da API.
 * Usa SUPABASE_ACCESS_TOKEN para autenticação.
 *
 * Uso: SUPABASE_ACCESS_TOKEN=sbp_xxx npx vitest run src/__tests__/api-crud.spec.ts
 */

import { describe, it, expect } from 'vitest';

const SUPABASE_URL = 'https://clqubcryhbrjlupkgeva.supabase.co';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const ANON_KEY = 'sb_publishable_qmK1AvvoZuK_Vgc5ZE26uw_KeLoNOFt';

function headers(token?: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || ANON_KEY}`,
  };
}

async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin${endpoint}`, {
    ...options,
    headers: { ...headers(TOKEN), ...(options.headers as Record<string, string> || {}) },
  });
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.error || json));
  return json.data as T;
}

async function logisticsFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/logistics${endpoint}`, {
    ...options,
    headers: { ...headers(TOKEN), ...(options.headers as Record<string, string> || {}) },
  });
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.error || json));
  return json.data as T;
}

const TEST_PREFIX = `test-${Date.now()}`;

// ═══════════════════════════════════════════════════════════════
// ADMIN API — CRUD Tests
// ═══════════════════════════════════════════════════════════════

describe('Admin API - LIST (GET)', () => {

  if (!TOKEN) {
    it.skip('SUPABASE_ACCESS_TOKEN não configurado');
    return;
  }

  it('GET /dashboard/kpis', async () => {
    const data = await adminFetch<any>('/dashboard/kpis');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('concluidas');
    expect(data).toHaveProperty('atrasos');
  });

  it('GET /dashboard/status-entregas', async () => {
    const data = await adminFetch<any[]>('/dashboard/status-entregas');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /dashboard/pedidos-recentes', async () => {
    const data = await adminFetch<any[]>('/dashboard/pedidos-recentes');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /armazens', async () => {
    const data = await adminFetch<any[]>('/armazens');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(16);
    expect(data[0]).toHaveProperty('nome');
    expect(data[0]).toHaveProperty('cidade');
  });

  it('GET /pedidos', async () => {
    const data = await adminFetch<any[]>('/pedidos?limit=5');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /clientes', async () => {
    const data = await adminFetch<any[]>('/clientes');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(10);
  });

  it('GET /transportes', async () => {
    const data = await adminFetch<any[]>('/transportes');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /estoque', async () => {
    const data = await adminFetch<any[]>('/estoque');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /ocorrencias', async () => {
    const data = await adminFetch<any[]>('/ocorrencias');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /configuracoes', async () => {
    const data = await adminFetch<Record<string, string>>('/configuracoes');
    expect(typeof data).toBe('object');
  });

  it('GET /setores', async () => {
    const data = await adminFetch<any[]>('/setores');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /cargos', async () => {
    const data = await adminFetch<any[]>('/cargos');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /coletas', async () => {
    const data = await adminFetch<any[]>('/coletas?limit=5');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /entregas', async () => {
    const data = await adminFetch<any[]>('/entregas?limit=5');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /transferencias', async () => {
    const data = await adminFetch<any[]>('/transferencias');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /rastreamento', async () => {
    const data = await adminFetch<any[]>('/rastreamento');
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /me', async () => {
    const data = await adminFetch<any>('/me');
    expect(data).toHaveProperty('id');
  });
});

// ═══════════════════════════════════════════════════════════════
// LOGISTICS API — GET/READ Tests
// ═══════════════════════════════════════════════════════════════

describe('Logistics API - LIST (GET)', () => {
  if (!TOKEN) {
    it.skip('SUPABASE_ACCESS_TOKEN não configurado');
    return;
  }

  it('GET /oms/shipments', async () => {
    const data = await logisticsFetch<any[]>('/oms/shipments');
    expect(data).toBeDefined();
  });

  it('GET /wms/zones?armazem_id=...', async () => {
    const data = await logisticsFetch<any[]>('/wms/zones?armazem_id=a0000001-0000-0000-0000-000000000001');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /wms/inventory?armazem_id=...', async () => {
    const data = await logisticsFetch<any[]>('/wms/inventory?armazem_id=a0000001-0000-0000-0000-000000000001');
    expect(data).toBeDefined();
  });

  it('GET /wms/layout/:id', async () => {
    const data = await logisticsFetch<any>('/wms/layout/a0000001-0000-0000-0000-000000000001');
    expect(data).toHaveProperty('armazem');
    expect(data.armazem).toHaveProperty('largura_m');
    expect(data.armazem).toHaveProperty('comprimento_m');
    expect(data).toHaveProperty('zonas');
    expect(Array.isArray(data.zonas)).toBe(true);
    expect(data.zonas.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /dashboard', async () => {
    const data = await logisticsFetch<any>('/dashboard');
    expect(data).toBeDefined();
  });

  it('GET /wms/zones todas sem filtro', async () => {
    const data = await logisticsFetch<any[]>('/wms/zones');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(16 * 6);
  });
});

// ═══════════════════════════════════════════════════════════════
// ADMIN API — CREATE (POST) → GET (by ID) → UPDATE (PUT)
// ═══════════════════════════════════════════════════════════════

describe('Admin API - CRUD Cycle (POST → GET → PUT)', () => {
  if (!TOKEN) {
    it.skip('SUPABASE_ACCESS_TOKEN não configurado');
    return;
  }

  const uid = `${TEST_PREFIX}`;
  let createdClienteId: string;
  let createdArmazemId: string;
  let createdPedidoId: string;
  let createdOcorrenciaId: string;


  // ── CLIENTES ──────────────────────────────────────────────

  it('POST /clientes → cria cliente', async () => {
    const data = await adminFetch<any>('/clientes', {
      method: 'POST',
      body: JSON.stringify({
        nome: `Test Cliente ${uid}`,
        email: `test-${uid}@test.com`,
        telefone: '11999999999',
        cidade: 'São Paulo',
        estado: 'SP',
        cnpj: `${uid.slice(0, 14).padEnd(14, '0')}`,
        ativo: true,
      }),
    });
    expect(data).toHaveProperty('id');
    createdClienteId = data.id;
  });

  it('GET /clientes/:id → cliente criado', async () => {
    const data = await adminFetch<any>(`/clientes/${createdClienteId}`);
    expect(data.nome).toContain('Test Cliente');
    expect(data.email).toContain('@test.com');
  });

  it('PUT /clientes/:id → atualiza cliente', async () => {
    const data = await adminFetch<any>(`/clientes/${createdClienteId}`, {
      method: 'PUT',
      body: JSON.stringify({ nome: `Test Cliente Atualizado ${uid}` }),
    });
    expect(data).toBeDefined();
  });

  it('GET /clientes/:id → confirmar atualização', async () => {
    const data = await adminFetch<any>(`/clientes/${createdClienteId}`);
    expect(data.nome).toContain('Atualizado');
  });

  // ── PEDIDOS ───────────────────────────────────────────────

  it('POST /pedidos → cria pedido', async () => {
    const data = await adminFetch<any>('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        codigo: `TEST-${uid}`,
        cliente: `Test ${uid}`,
        origem: 'CD Yokohama - Porto',
        destino_cidade: 'Tokyo',
        destino_estado: 'JP',
        peso: 5.0,
        valor: 10000,
        status: 'pendente',
      }),
    });
    expect(data).toHaveProperty('id');
    createdPedidoId = data.id || data.codigo;
  });

  it('GET /pedidos/:id → pedido criado', async () => {
    const data = await adminFetch<any>(`/pedidos/${createdPedidoId}`);
    expect(data.codigo).toBe(`TEST-${uid}`);
    expect(data.valor).toBe(10000);
  });

  it('PUT /pedidos/:id → atualiza status', async () => {
    const data = await adminFetch<any>(`/pedidos/${createdPedidoId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'em_transito' }),
    });
    expect(data).toBeDefined();
  });

  it('GET /pedidos/:id → confirmar status update', async () => {
    const data = await adminFetch<any>(`/pedidos/${createdPedidoId}`);
    expect(data.status).toBe('em_transito');
  });

  // ── ARMAZÉNS ──────────────────────────────────────────────

  it('POST /armazens → cria armazém', async () => {
    const data = await adminFetch<any>('/armazens', {
      method: 'POST',
      body: JSON.stringify({
        nome: `Test Armazém ${uid}`,
        cidade: 'Yokohama',
        estado: 'Kanagawa',
        pais: 'JP',
        endereco: '1-1-1 Test',
        capacidade: 1000,
      }),
    });
    expect(data).toHaveProperty('id');
    createdArmazemId = data.id;
  });

  it('GET /armazens/:id → armazém criado', async () => {
    const data = await adminFetch<any>(`/armazens/${createdArmazemId}`);
    expect(data.nome).toContain('Test Armazém');
    expect(data.capacidade).toBe(1000);
  });

  it('PUT /armazens/:id → atualiza armazém', async () => {
    const data = await adminFetch<any>(`/armazens/${createdArmazemId}`, {
      method: 'PUT',
      body: JSON.stringify({ capacidade: 2000 }),
    });
    expect(data).toBeDefined();
  });

  it('GET /armazens/:id → confirmar update', async () => {
    const data = await adminFetch<any>(`/armazens/${createdArmazemId}`);
    expect(data.capacidade).toBe(2000);
  });

  // ── TRANSPORTES ───────────────────────────────────────────

  it('POST /transportes → cria transporte', async () => {
    const data = await adminFetch<any>('/transportes', {
      method: 'POST',
      body: JSON.stringify({
        nome: `Test Veículo ${uid}`,
        placa: `TEST-${uid.slice(0, 4)}`,
        tipo: 'van',
        capacidade_kg: 1500,
        ativo: true,
      }),
    });
    expect(data).toHaveProperty('id');
  });

  it('GET /transportes (verifica criação)', async () => {
    const data = await adminFetch<any[]>('/transportes');
    const found = data.find((t: any) => t.nome?.includes(uid));
    expect(found).toBeDefined();
  });

  // ── OCORRÊNCIAS ───────────────────────────────────────────

  it('POST /ocorrencias → cria ocorrência', async () => {
    const data = await adminFetch<any>('/ocorrencias', {
      method: 'POST',
      body: JSON.stringify({
        pedido_id: '',
        tipo: 'teste',
        descricao: `Teste de integração ${uid}`,
        status: 'aberto',
      }),
    });
    expect(data).toHaveProperty('id');
    createdOcorrenciaId = data.id;
  });

  it('GET /ocorrencias?status=aberto → lista ocorrências abertas', async () => {
    const data = await adminFetch<any[]>('/ocorrencias?status=aberto');
    expect(Array.isArray(data)).toBe(true);
    const found = data.find((o: any) => o.id === createdOcorrenciaId);
    expect(found).toBeDefined();
  });

  // ── RASTREAMENTO ──────────────────────────────────────────

  it('POST /rastreamento/evento → cria evento', async () => {
    const data = await adminFetch<any>('/rastreamento/evento', {
      method: 'POST',
      body: JSON.stringify({
        pedido_id: createdPedidoId,
        tipo: 'ATUALIZACAO',
        descricao: `Teste integração ${uid}`,
        status: 'em_transito',
      }),
    });
    expect(data).toBeDefined();
  });

  it('GET /rastreamento?codigo=... → eventos do pedido', async () => {
    const data = await adminFetch<any[]>(`/rastreamento?codigo=TEST-${uid}`);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  // ── CONFIGURAÇÕES ─────────────────────────────────────────

  it('GET /configuracoes → retorna objeto', async () => {
    const data = await adminFetch<Record<string, string>>('/configuracoes');
    expect(typeof data).toBe('object');
  });

  // ── ENTREGAS ──────────────────────────────────────────────

  it('POST /entregas → cria entrega', async () => {
    const data = await adminFetch<any>('/entregas', {
      method: 'POST',
      body: JSON.stringify({
        pedido_id: createdPedidoId,
        status: 'pendente',
      }),
    });
    expect(data).toHaveProperty('id');
  });

  // ── RASTREAMENTO (admin) ──────────────────────────────────

  it('POST /rastreamento → cria registro', async () => {
    const data = await adminFetch<any>('/rastreamento', {
      method: 'POST',
      body: JSON.stringify({
        pedido_id: createdPedidoId,
        codigo: `TEST-${uid}`,
        tipo: 'CRIACAO',
        descricao: 'Teste de integração',
        status: 'pendente',
      }),
    });
    expect(data).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// LOGISTICS API — POST Tests
// ═══════════════════════════════════════════════════════════════

describe('Logistics API - POST / WMS operations', () => {
  if (!TOKEN) {
    it.skip('SUPABASE_ACCESS_TOKEN não configurado');
    return;
  }

  it('POST /wms/receive → recebe pacote no inventário', async () => {
    const data = await logisticsFetch<any>('/wms/receive', {
      method: 'POST',
      body: JSON.stringify({
        codigo_barras: `TEST-BARCODE-${TEST_PREFIX}`,
        armazem_id: 'a0000001-0000-0000-0000-000000000001',
        zona_id: '',
      }),
    });
    expect(data).toBeDefined();
  });

  it('POST /wms/sort → move item para zona', async () => {
    const inventory = await logisticsFetch<any[]>('/wms/inventory?armazem_id=a0000001-0000-0000-0000-000000000001');
    if (inventory.length > 0) {
      const item = inventory[inventory.length - 1];
      const zones = await logisticsFetch<any[]>('/wms/zones?armazem_id=a0000001-0000-0000-0000-000000000001');
      if (zones.length > 0) {
        const data = await logisticsFetch<any>('/wms/sort', {
          method: 'POST',
          body: JSON.stringify({ inventory_id: item.id, zona_id: zones[0].id }),
        });
        expect(data).toBeDefined();
      }
    }
  });

  it('POST /oms/shipments → cria shipment', async () => {
    const data = await logisticsFetch<any>('/oms/shipments', {
      method: 'POST',
      body: JSON.stringify({
        pedido_codigo: `TEST-${TEST_PREFIX}`,
        destino: 'Tokyo',
        origem: 'Yokohama',
        transportadora: 'Yamato',
      }),
    });
    expect(data).toBeDefined();
  });

  it('GET /tracking/:codigo → rastreamento público', async () => {
    const data = await logisticsFetch<any>('/tracking/TEST-123');
    expect(data).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// RESUMO
// ═══════════════════════════════════════════════════════════════

describe('Cleanup (opcional)', () => {
  it('Dados de teste identificáveis por prefixo', () => {
    expect(TEST_PREFIX).toBeTruthy();
  });
});
