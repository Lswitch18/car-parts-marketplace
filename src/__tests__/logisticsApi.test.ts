import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'logistics-token-456' } },
        error: null,
      }),
    },
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

async function importModule() {
  const { logisticsApi } = await import('../lib/logisticsApi');
  return logisticsApi;
}

describe('logisticsApi - URL, pipeline and status updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { status: 'success' } }),
    });
  });

  it('shipments.create envia POST para /oms/shipments com payload correto', async () => {
    const logisticsApi = await importModule();
    const payload = { pedido_id: 'ped-123', transportadora: 'Yamato Transport' };
    
    await logisticsApi.shipments.create(payload);
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/oms/shipments'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Authorization: 'Bearer logistics-token-456'
        })
      })
    );
  });

  it('shipments.update envia PUT para /oms/shipments/:id com novos dados da pipeline', async () => {
    const logisticsApi = await importModule();
    const updatePayload = { etapa: 'DELIVERING', status: 'in_transit' };
    
    await logisticsApi.shipments.update('ship-789', updatePayload);
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/oms/shipments/ship-789'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatePayload)
      })
    );
  });

  it('wms.receive dispara escaneamento e move status na pipeline para recebido', async () => {
    const logisticsApi = await importModule();
    const scanPayload = { codigo_barras: 'BARCODE12345', armazem_id: 'cd-tokyo' };
    
    await logisticsApi.wms.receive(scanPayload);
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/wms/receive'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(scanPayload)
      })
    );
  });

  it('wms.sort atualiza zona de triagem na pipeline', async () => {
    const logisticsApi = await importModule();
    const sortPayload = { inventory_id: 'inv-111', zona_id: 'zona-sul' };
    
    await logisticsApi.wms.sort(sortPayload);
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/wms/sort'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(sortPayload)
      })
    );
  });

  it('tracking.get consulta o status atual de rastreamento por codigo', async () => {
    const logisticsApi = await importModule();
    
    await logisticsApi.tracking.get('#SHIP-TOYOTA-101');
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/tracking/%23SHIP-TOYOTA-101'),
      expect.any(Object)
    );
  });
});
