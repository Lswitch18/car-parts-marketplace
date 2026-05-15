import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from './_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return { ...user, profile };
}

async function trackingEvent(pedido_id: string, tipo: string, descricao: string, local = 'Sistema') {
  await supabase.from('admin_rastreamento').insert({ pedido_id, tipo, descricao, local }).then().catch();
}

function auditLog(usuario_id: string, acao: string, tabela: string, registro_id: string | null, detalhes: string | null) {
  supabase.from('admin_auditoria').insert({ usuario_id, acao, tabela, registro_id, detalhes }).then().catch();
}

function gerarCodigoRastreamento(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `#DAIG-${ts}${rand}`;
}

function calcularPrazo(estado: string): number {
  const prazos: Record<string, number> = {
    'Tokyo': 24, 'Kanagawa': 24, 'Saitama': 24, 'Chiba': 24,
    'Aichi': 48, 'Shizuoka': 48, 'Gifu': 48,
    'Osaka': 48, 'Hyogo': 48, 'Kyoto': 48,
    'Fukuoka': 72, 'Hiroshima': 72, 'Okayama': 72,
    'Hokkaido': 96, 'Okinawa': 120,
  };
  return prazos[estado] || 72;
}

// ─── OMS: SHIPMENTS ────────────────────────────────────────────────────────

async function criarShipment(body: any, userId: string) {
  const { pedido_id, cliente_id, armazem_origem_id, destino_cidade, destino_estado, peso_kg } = body;
  if (!pedido_id) return json({ error: 'pedido_id obrigatório' }, 400);

  const codigo = gerarCodigoRastreamento();
  const sla = calcularPrazo(destino_estado || '');
  const prazo = new Date(Date.now() + sla * 60 * 60 * 1000).toISOString();

  const { data: shipment, error } = await supabase.from('admin_shipments').insert({
    codigo, pedido_id, cliente_id, armazem_origem_id,
    peso_kg, sla_horas: sla, data_prazo: prazo,
    etapa: 'CREATED', status: 'pending',
  }).select().single();

  if (error) return json({ error: error.message }, 400);

  await supabase.from('admin_packages').insert({
    shipment_id: shipment.id, codigo_barras: codigo,
    pedido_id, descricao: `Shipment ${codigo}`, peso_kg,
  });

  await trackingEvent(pedido_id, 'CREATED', `Shipment criado - Código: ${codigo}`);
  auditLog(userId, 'CREATE', 'admin_shipments', shipment.id, `codigo: ${codigo}`);

  return json(shipment, 201);
}

async function listShipments(req: Request) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);
  const url = new URL(req.url);
  const etapa = url.searchParams.get('etapa') || '';
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let q = supabase.from('admin_shipments').select('*, pedido:admin_pedidos!pedido_id(codigo), cliente:admin_clientes!cliente_id(nome), origem:admin_armazens!armazem_origem_id(nome)', { count: 'exact' });
  if (etapa) q = q.eq('etapa', etapa);
  if (search) q = q.or(`codigo.ilike.%${search}%`);
  const { data, count } = await q.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  return json({ rows: data || [], total: count || 0, page, pages: Math.ceil((count || 0) / limit) });
}

async function getShipment(id: string) {
  const { data, error } = await supabase.from('admin_shipments')
    .select('*, pedido:admin_pedidos!pedido_id(*), cliente:admin_clientes!cliente_id(*), origem:admin_armazens!armazem_origem_id(*), packages:admin_packages(*)')
    .eq('id', id).single();
  if (error || !data) return json({ error: 'Não encontrado' }, 404);
  return json(data);
}

async function updateShipment(id: string, body: any, userId: string) {
  const { data, error } = await supabase.from('admin_shipments').update(body).eq('id', id).select().single();
  if (error) return json({ error: error.message }, 400);
  auditLog(userId, 'UPDATE', 'admin_shipments', id, null);
  return json(data);
}

// ─── OMS: LABELS ──────────────────────────────────────────────────────────

async function gerarEtiquetas(req: Request) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);
  const url = new URL(req.url);
  const ids = url.searchParams.get('ids') || '';

  const idList = ids.split(',').filter(Boolean);
  if (!idList.length) return json({ error: 'Informe os IDs dos shipments' }, 400);

  const { data: shipments } = await supabase.from('admin_shipments')
    .select('*, pedido:admin_pedidos!pedido_id(*), cliente:admin_clientes!cliente_id(*), origem:admin_armazens!armazem_origem_id(*)')
    .in('id', idList);

  return json(shipments || []);
}

// ─── OMS: DROPOFF ──────────────────────────────────────────────────────────

async function registrarDropoff(body: any, userId: string) {
  const { shipment_id, agencia_id } = body;
  if (!shipment_id || !agencia_id) return json({ error: 'shipment_id e agencia_id obrigatórios' }, 400);

  const { data: agencia } = await supabase.from('admin_armazens').select('*').eq('id', agencia_id).single();
  if (!agencia) return json({ error: 'Agência não encontrada' }, 404);

  const codigo = `DO-${Date.now().toString(36).toUpperCase()}`;
  const { data: dropoff, error } = await supabase.from('admin_dropoffs').insert({
    shipment_id, agencia_id, codigo_agencia: codigo,
    status: 'received', data_recebimento: new Date().toISOString(),
    recebido_por: user.profile?.full_name || 'Sistema',
  }).select().single();

  if (error) return json({ error: error.message }, 400);

  await supabase.from('admin_shipments').update({ etapa: 'DROPOFF', dropoff_agencia_id: agencia_id, dropoff_data: new Date().toISOString(), dropoff_confirmado_por: userId }).eq('id', shipment_id);

  const { data: shipment } = await supabase.from('admin_shipments').select('pedido_id').eq('id', shipment_id).single();
  if (shipment) await trackingEvent(shipment.pedido_id, 'DROPOFF', `Recebido na agência ${agencia.nome}`, agencia.nome);

  auditLog(userId, 'CREATE', 'admin_dropoffs', dropoff.id, agencia.nome);
  return json(dropoff, 201);
}

async function listDropoffs(agenciaId?: string) {
  let q = supabase.from('admin_dropoffs').select('*, shipment:admin_shipments!shipment_id(codigo), agencia:admin_armazens!agencia_id(nome)');
  if (agenciaId) q = q.eq('agencia_id', agenciaId);
  const { data } = await q.order('created_at', { ascending: false });
  return json(data || []);
}

// ─── TMS: ROTAS ────────────────────────────────────────────────────────────

async function criarRota(body: any, userId: string) {
  const { tipo, origem_id, destino_id, distancia_km, tempo_estimado_min, transportadora, motorista_id, veiculo_id, data_programada } = body;
  if (!tipo || !origem_id || !destino_id) return json({ error: 'tipo, origem_id e destino_id obrigatórios' }, 400);

  const codigo = `RTA-${Date.now().toString(36).toUpperCase()}`;
  const { data: rota, error } = await supabase.from('admin_rotas').insert({
    codigo, tipo, origem_id, destino_id, distancia_km, tempo_estimado_min,
    transportadora, motorista_id, veiculo_id, data_programada,
  }).select().single();

  if (error) return json({ error: error.message }, 400);

  const { data: paradas } = await supabase.from('admin_shipments')
    .select('id, armazem_destino_id, cliente_id')
    .eq('rota_id', 'pending').is('rota_id', null);

  if (paradas) {
    for (let i = 0; i < paradas.length; i++) {
      await supabase.from('admin_rotas_paradas').insert({
        rota_id: rota.id, ordem: i + 1,
        armazem_id: paradas[i].armazem_destino_id,
        cliente_id: paradas[i].cliente_id,
        shipment_id: paradas[i].id,
      });
    }
  }

  auditLog(userId, 'CREATE', 'admin_rotas', rota.id, codigo);
  return json(rota, 201);
}

async function listRotas(req: Request) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);
  const url = new URL(req.url);
  const tipo = url.searchParams.get('tipo') || '';
  const data = url.searchParams.get('data') || '';

  let q = supabase.from('admin_rotas').select('*, origem:admin_armazens!origem_id(nome), destino:admin_armazens!destino_id(nome), motorista:profiles!motorista_id(full_name)');
  if (tipo) q = q.eq('tipo', tipo);
  if (data) q = q.eq('data_programada', data);
  const result = await q.order('created_at', { ascending: false });
  return json(result.data || []);
}

// ─── TMS: ATRIBUIR MOTORISTA ────────────────────────────────────────────────

async function atribuirMotorista(body: any, userId: string) {
  const { shipment_id, motorista_id, veiculo_id, transportadora } = body;
  if (!shipment_id || !motorista_id) return json({ error: 'shipment_id e motorista_id obrigatórios' }, 400);

  const { data: motorista } = await supabase.from('admin_motoristas').select('*').eq('id', motorista_id).single();
  if (!motorista) return json({ error: 'Motorista não encontrado' }, 404);

  const updates: any = {
    motorista_id, etapa: 'LAST_MILE',
    transportadora: transportadora || motorista.transportadora,
  };
  if (veiculo_id) updates.veiculo_id = veiculo_id;

  const { error } = await supabase.from('admin_shipments').update(updates).eq('id', shipment_id);
  if (error) return json({ error: error.message }, 400);

  const { data: shipment } = await supabase.from('admin_shipments').select('pedido_id').eq('id', shipment_id).single();
  if (shipment) await trackingEvent(shipment.pedido_id, 'OUT_FOR_DELIVERY', `Saiu para entrega - ${motorista.nome}`, motorista.nome);

  auditLog(userId, 'UPDATE', 'admin_shipments', shipment_id, `motorista: ${motorista_id}`);
  return json({ ok: true });
}

// ─── TRACKING ──────────────────────────────────────────────────────────────

async function trackingPublico(codigo: string) {
  const { data: shipment } = await supabase.from('admin_shipments')
    .select('*, pedido:admin_pedidos!pedido_id(codigo, destino_cidade, destino_estado), cliente:admin_clientes!cliente_id(nome)')
    .eq('codigo', codigo).maybeSingle();

  if (!shipment) return json({ error: 'Shipment não encontrado' }, 404);

  const { data: eventos } = await supabase.from('admin_rastreamento')
    .select('*').eq('pedido_id', shipment.pedido_id).order('created_at', { ascending: false });

  return json({
    shipment: {
      codigo: shipment.codigo, etapa: shipment.etapa, status: shipment.status,
      data_prazo: shipment.data_prazo, data_coleta: shipment.data_coleta,
      data_entregue: shipment.data_entregue,
      peso_kg: shipment.peso_kg,
    },
    cliente: shipment.cliente,
    pedido: shipment.pedido,
    eventos: eventos || [],
  });
}

// ─── QUICK STATS ──────────────────────────────────────────────────────────

async function dashboard() {
  const [shipments, drops, rotas, motoristas] = await Promise.all([
    supabase.from('admin_shipments').select('etapa', { count: 'exact', head: true }),
    supabase.from('admin_dropoffs').select('status', { count: 'exact', head: true }).eq('status', 'received'),
    supabase.from('admin_rotas').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('admin_motoristas').select('id', { count: 'exact', head: true }).eq('ativo', true),
  ]);

  return json({
    shipments: shipments.count || 0,
    dropoffs_pendentes: drops.count || 0,
    rotas_ativas: rotas.count || 0,
    motoristas_ativos: motoristas.count || 0,
  });
}

// ─── ROUTER ────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });

  const url = new URL(req.url);
  const path = url.pathname.replace(/^(\/functions\/v1)?\/logistics/, '').replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);

  let body: Record<string, unknown> = {};
  try { if (req.body) body = await req.json(); } catch {}

  try {
    // OMS: shipments
    if (path.startsWith('/oms/shipments') && req.method === 'POST' && !segments[2]) {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);
      return await criarShipment(body, user.id);
    }
    if (path.startsWith('/oms/shipments') && req.method === 'GET' && !segments[2]) {
      return await listShipments(req);
    }
    if (segments[0] === 'oms' && segments[1] === 'shipments' && segments[2] && req.method === 'GET') {
      return await getShipment(segments[2]);
    }
    if (segments[0] === 'oms' && segments[1] === 'shipments' && segments[2] && req.method === 'PUT') {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);
      return await updateShipment(segments[2], body, user.id);
    }

    // OMS: labels
    if (path === '/oms/labels' && req.method === 'GET') {
      return await gerarEtiquetas(req);
    }

    // DROPOFF
    if (path === '/dropoff' && req.method === 'POST') {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);
      return await registrarDropoff(body, user.id);
    }
    if (path.startsWith('/dropoff')) {
      const agenciaId = segments[1] === 'agency' ? segments[2] : undefined;
      return await listDropoffs(agenciaId);
    }

    // TMS: rotas
    if (path === '/tms/routes' && req.method === 'POST') {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);
      return await criarRota(body, user.id);
    }
    if (path === '/tms/routes' && req.method === 'GET') {
      return await listRotas(req);
    }

    // TMS: atribuir motorista
    if (path === '/tms/assign' && req.method === 'POST') {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);
      return await atribuirMotorista(body, user.id);
    }

    // Tracking público (sem auth)
    if (path.startsWith('/tracking/') && req.method === 'GET') {
      return await trackingPublico(segments[1]);
    }

    // Dashboard
    if (path === '/dashboard' && req.method === 'GET') {
      return await dashboard();
    }

    return json({ error: 'Rota não encontrada: ' + path }, 404);
  } catch (err) {
    console.error('[Logistics]', err);
    return json({ error: 'Erro interno: ' + (err.message || '') }, 500);
  }
});
