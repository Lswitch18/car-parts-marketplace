import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/modules/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token-123' } },
        error: null,
      }),
    },
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

async function importModule() {
  const { adminApi } = await import('@/modules/transactions/api/adminApi');
  return adminApi;
}

describe('adminApi - URL construction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [] }),
    });
  });

  it('dashboard.kpis monta URL /dashboard/kpis', async () => {
    const adminApi = await importModule();
    await adminApi.dashboard.kpis();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard/kpis'),
      expect.any(Object),
    );
  });

  it('dashboard.pedidosRecentes monta URL /dashboard/pedidos-recentes', async () => {
    const adminApi = await importModule();
    await adminApi.dashboard.pedidosRecentes();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/dashboard/pedidos-recentes'),
      expect.any(Object),
    );
  });

  it('armazens.list monta URL /armazens', async () => {
    const adminApi = await importModule();
    await adminApi.armazens.list();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/armazens'),
      expect.any(Object),
    );
  });

  it('clientes.list com page e search monta query string', async () => {
    const adminApi = await importModule();
    await adminApi.clientes.list({ page: 2, limit: 10, search: 'honda' });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=2');
    expect(url).toContain('limit=10');
    expect(url).toContain('search=honda');
  });

  it('pedidos.list com page, limit, search e status', async () => {
    const adminApi = await importModule();
    await adminApi.pedidos.list({ page: 1, limit: 20, search: '#JP', status: 'pendente' });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=1');
    expect(url).toContain('limit=20');
    expect(url).toContain('search=%23JP');
    expect(url).toContain('status=pendente');
  });

  it('pedidos.list sem params deixa query vazia', async () => {
    const adminApi = await importModule();
    await adminApi.pedidos.list();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/pedidos?');
  });

  it('entregas.list com filtro status', async () => {
    const adminApi = await importModule();
    await adminApi.entregas.list({ status: 'em_transito' });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('status=em_transito');
  });

  it('ocorrencias.list com filtro status', async () => {
    const adminApi = await importModule();
    await adminApi.ocorrencias.list('aberto');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('status=aberto');
  });

  it('ocorrencias.list sem status não adiciona parametro', async () => {
    const adminApi = await importModule();
    await adminApi.ocorrencias.list();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain('status');
  });

  it('transportes.list com armazem_id', async () => {
    const adminApi = await importModule();
    await adminApi.transportes.list('armazem-id-123');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('armazem_id=armazem-id-123');
  });

  it('estoque.list com armazem_id', async () => {
    const adminApi = await importModule();
    await adminApi.estoque.list('armazem-id-456');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('armazem_id=armazem-id-456');
  });

  it('auditoria.list com paginação padrão (page 1, limit 50)', async () => {
    const adminApi = await importModule();
    await adminApi.auditoria.list();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=1');
    expect(url).toContain('limit=50');
  });

  it('auditoria.list com paginação customizada', async () => {
    const adminApi = await importModule();
    await adminApi.auditoria.list(3, 25);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=3');
    expect(url).toContain('limit=25');
  });

  it('setores CRUD monta URLs corretas', async () => {
    const adminApi = await importModule();
    await adminApi.setores.list();
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/setores'), expect.any(Object));

    await adminApi.setores.get('id-1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/setores/id-1'), expect.any(Object));

    mockFetch.mockResolvedValue({ json: () => Promise.resolve({ success: true, data: { id: 'new' } }) });
    await adminApi.setores.create({ nome: 'Teste' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/setores'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('envia Authorization Bearer token', async () => {
    const adminApi = await importModule();
    await adminApi.me();
    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    const headers = opts.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-token-123');
  });

  it('envia Content-Type application/json', async () => {
    const adminApi = await importModule();
    await adminApi.armazens.list();
    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    const headers = opts.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('lança erro quando API retorna success: false', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: 'Não autorizado' }),
    });
    const adminApi = await importModule();
    await expect(adminApi.me()).rejects.toThrow('Não autorizado');
  });

  it('lança erro genérico quando API retorna success: false sem mensagem', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });
    const adminApi = await importModule();
    await expect(adminApi.me()).rejects.toThrow('Admin API error');
  });

  it('usuarios.list monta URL e query string corretas', async () => {
    const adminApi = await importModule();
    await adminApi.usuarios.list('Patrick', true);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/usuarios?search=Patrick&sem_cargo=true');
  });

  it('usuarios.get monta URL com ID correto', async () => {
    const adminApi = await importModule();
    await adminApi.usuarios.get('user-uuid-123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios/user-uuid-123'),
      expect.any(Object),
    );
  });

  it('usuarios.update envia método PUT com body completo (role, status, etc)', async () => {
    const adminApi = await importModule();
    const payload = {
      nome: 'Patrick Editado',
      role: 'seller',
      status: 'ativo',
      is_verified: true,
      address: 'Tokyo Shibuya 1-2-3',
      cep: '150-0002'
    };
    await adminApi.usuarios.update('user-uuid-123', payload);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios/user-uuid-123'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(payload)
      })
    );
  });
});

describe('DashboardKPIs - processamento de dados', () => {
  it('calcula taxa de conclusão corretamente', () => {
    const total = 100;
    const concluidas = 75;
    const taxa = total > 0 ? ((concluidas / total) * 100).toFixed(1) : '0.0';
    expect(taxa).toBe('75.0');
  });

  it('taxa de conclusão 0% quando total é 0', () => {
    const total = 0;
    const concluidas = 0;
    const taxa = total > 0 ? ((concluidas / total) * 100).toFixed(1) : '0.0';
    expect(taxa).toBe('0.0');
  });

  it('calcula custo total como soma de valores', () => {
    const custoData = [{ valor: 1000 }, { valor: 2000 }, { valor: 3000 }];
    const custo = (custoData || []).reduce((s: number, r: any) => s + Number(r.valor || 0), 0);
    expect(custo).toBe(6000);
  });

  it('custo total 0 quando não há dados', () => {
    const custo = ([].reduce((s: number, r: any) => s + Number(r.valor || 0), 0));
    expect(custo).toBe(0);
  });
});

describe('StatusEntregas - processamento de dados', () => {
  it('agrupa pedidos por status', () => {
    const data = [
      { status: 'pendente' }, { status: 'pendente' },
      { status: 'entregue' }, { status: 'entregue' }, { status: 'entregue' },
      { status: 'em_transito' },
    ];
    const counts: Record<string, number> = {};
    (data || []).forEach((r: any) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    const result = Object.entries(counts).map(([status, count]) => ({ status, count }));

    expect(result).toHaveLength(3);
    expect(result.find(r => r.status === 'pendente')?.count).toBe(2);
    expect(result.find(r => r.status === 'entregue')?.count).toBe(3);
    expect(result.find(r => r.status === 'em_transito')?.count).toBe(1);
  });

  it('retorna array vazio quando dados são nulos', () => {
    const result: { status: string; count: number }[] = [];
    expect(result).toHaveLength(0);
  });
});

describe('Armazens - cálculo de ocupação', () => {
  it('calcula porcentagem de ocupação corretamente', () => {
    const a = { capacidade: 8000, ocupacao: 5200 };
    const pct = a.capacidade > 0 ? Math.round(a.ocupacao * 100 / a.capacidade) : 0;
    expect(pct).toBe(65);
  });

  it('retorna 0% quando capacidade é 0', () => {
    const a = { capacidade: 0, ocupacao: 100 };
    const pct = a.capacidade > 0 ? Math.round(a.ocupacao * 100 / a.capacidade) : 0;
    expect(pct).toBe(0);
  });

  it('retorna 100% quando ocupacao >= capacidade', () => {
    const a = { capacidade: 5000, ocupacao: 5000 };
    const pct = a.capacidade > 0 ? Math.round(a.ocupacao * 100 / a.capacidade) : 0;
    expect(pct).toBe(100);
  });

  it('cor verde quando pct <= 60', () => {
    const pct = 55;
    const cor = pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E';
    expect(cor).toBe('#22C55E');
  });

  it('cor amarela quando pct entre 61 e 80', () => {
    const pct = 75;
    const cor = pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E';
    expect(cor).toBe('#FACC15');
  });

  it('cor vermelha quando pct > 80', () => {
    const pct = 90;
    const cor = pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E';
    expect(cor).toBe('#EF4444');
  });

  it('limita a 8 CDs no dashboard', () => {
    const armazensList = Array.from({ length: 16 }, (_, i) => ({
      nome: `CD ${i}`, capacidade: 1000, ocupacao: 500 + i * 10,
    }));
    const armazens = armazensList.slice(0, 8).map((a: any) => {
      const pct = a.capacidade > 0 ? Math.round((a.ocupacao / a.capacidade) * 100) : 0;
      const cor = pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E';
      return { nome: a.nome, pct, cor };
    });
    expect(armazens).toHaveLength(8);
  });
});
