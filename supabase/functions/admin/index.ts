import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

function json(data: unknown, status = 200) {
  const wrapped = status >= 200 && status < 300
    ? { success: true, data }
    : { success: false, error: data };
  return new Response(JSON.stringify(wrapped), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function getAuthUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { ...user, profile };
}

async function requireAdmin(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return null;
  if (user.profile?.role !== 'admin') return null;
  return user;
}

function auditLog(usuario_id: string, acao: string, tabela: string, registro_id: string | null, detalhes: string | null, ip: string | null) {
  supabase.from('admin_auditoria').insert({ usuario_id, acao, tabela, registro_id, detalhes, ip }).then().catch();
}

async function trackingEvent(pedido_id: string, tipo: string, descricao: string, local = 'Sistema', status = 'registrado') {
  await supabase.from('admin_rastreamento').insert({ pedido_id, tipo, descricao, local, status }).then().catch();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function listResource(table: string, req: Request, searchFields: string[] = []) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';
  const offset = (page - 1) * limit;

  let query = supabase.from(table).select('*', { count: 'exact' });
  if (status) query = query.eq('status', status);
  if (search && searchFields.length) {
    const searchCond = searchFields.map(f => `${f}.ilike.%${search}%`).join(',');
    query = query.or(searchCond);
  }
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  if (error) return json({ error: error.message }, 500);
  return json({ rows: data, total: count || 0, page, pages: Math.ceil((count || 0) / limit) });
}

async function getResource(table: string, req: Request, id: string) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error || !data) return json({ error: 'Não encontrado' }, 404);
  return json(data);
}

async function createResource(table: string, req: Request, body: Record<string, unknown>) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);
  const { data, error } = await supabase.from(table).insert(body).select().single();
  if (error) return json({ error: error.message }, 400);
  auditLog(user.id, 'CREATE', table, data.id, table, null);
  return json(data, 201);
}

async function updateResource(table: string, req: Request, id: string, body: Record<string, unknown>) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);
  const { data, error } = await supabase.from(table).update(body).eq('id', id).select().single();
  if (error) return json({ error: error.message }, 400);
  auditLog(user.id, 'UPDATE', table, id, table, null);
  return json(data);
}

async function deleteResource(table: string, req: Request, id: string) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return json({ error: error.message }, 400);
  auditLog(user.id, 'DELETE', table, id, table, null);
  return json({ ok: true });
}

async function calcularCustos(supabase: any) {
  const mesAtual = new Date().toISOString().slice(0, 7);
  const { data: entregas } = await supabase.from('admin_entregas').select('id', { count: 'exact', head: true }).eq('status', 'entregue');
  const { data: motoristas } = await supabase.from('admin_motoristas').select('id', { count: 'exact', head: true }).eq('ativo', true);
  const { data: dropoffs } = await supabase.from('admin_dropoffs').select('id', { count: 'exact', head: true }).eq('status', 'recebido');
  const { data: ativos } = await supabase.from('admin_armazens').select('id', { count: 'exact', head: true }).eq('ativo', true);
  const { data: params } = await supabase.from('admin_custos_parametros').select('*');

  const p = params && params.length > 0 ? params[0] : {};
  const qtdEntregas = entregas?.count || 0;
  const qtdMotoristas = motoristas?.count || 0;
  const qtdDropoffs = dropoffs?.count || 0;
  const qtdArmazens = ativos?.count || 0;

  const custoEntregas = qtdEntregas * Number(p.custo_por_entrega || 25);
  const custoMotoristas = qtdMotoristas * Number(p.custo_mensal_motorista || 2500);
  const custoDropoffs = qtdDropoffs * Number(p.custo_por_dropoff || 8);
  const custoFixo = qtdArmazens * Number(p.custo_fixo_mensal_armazem || 50000);
  const custoTotal = custoEntregas + custoMotoristas + custoDropoffs + custoFixo;

  // Upsert no log
  const { data: existing } = await supabase.from('admin_custos_log').select('id').eq('periodo', mesAtual).limit(1);
  if (existing && existing.length > 0) {
    await supabase.from('admin_custos_log').update({
      custo_entregas: custoEntregas, custo_motoristas: custoMotoristas,
      custo_dropoffs: custoDropoffs, custo_fixo_armazens: custoFixo,
      custo_total: custoTotal, qtd_entregas: qtdEntregas,
      qtd_motoristas: qtdMotoristas, qtd_dropoffs: qtdDropoffs,
    }).eq('id', existing[0].id);
  } else {
    await supabase.from('admin_custos_log').insert({
      periodo: mesAtual, custo_entregas: custoEntregas,
      custo_motoristas: custoMotoristas, custo_dropoffs: custoDropoffs,
      custo_fixo_armazens: custoFixo, custo_total: custoTotal,
      qtd_entregas: qtdEntregas, qtd_motoristas: qtdMotoristas, qtd_dropoffs: qtdDropoffs,
    });
  }
}

// ── Dashboard ────────────────────────────────────────────────────────────────

async function handleDashboard(req: Request, path: string) {
  const user = await requireAdmin(req);
  if (!user) return json({ error: 'Não autorizado' }, 401);

  if (path === '/kpis') {
    const { data: total } = await supabase.from('admin_pedidos').select('*', { count: 'exact', head: true });
    const { data: concluidas } = await supabase.from('admin_pedidos').select('*', { count: 'exact', head: true }).eq('status', 'entregue');
    const { data: atrasos } = await supabase.from('admin_pedidos').select('*', { count: 'exact', head: true }).eq('status', 'atrasado');
    const { data: cancelados } = await supabase.from('admin_pedidos').select('*', { count: 'exact', head: true }).eq('status', 'cancelado');
    const { data: emTransito } = await supabase.from('admin_pedidos').select('*', { count: 'exact', head: true }).eq('status', 'em_transito');
    const totalCount = total?.count || 0;

    // Custos logísticos reais
    const { data: custoLog } = await supabase.from('admin_custos_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (custoLog) {
      return json({
        total: totalCount,
        concluidas: concluidas?.count || 0,
        atrasos: atrasos?.count || 0,
        cancelados: cancelados?.count || 0,
        emTransito: emTransito?.count || 0,
        taxa: totalCount > 0 ? ((concluidas?.count || 0) / totalCount * 100).toFixed(1) : '0.0',
        custo: custoLog.custo_total?.toFixed(2) || '0.00',
      });
    }

    // Fallback: calcular ao vivo
    const { data: entregas } = await supabase.from('admin_entregas').select('id', { count: 'exact', head: true }).eq('status', 'entregue');
    const { data: motoristas } = await supabase.from('admin_motoristas').select('id', { count: 'exact', head: true }).eq('ativo', true);
    const { data: dropoffs } = await supabase.from('admin_dropoffs').select('id', { count: 'exact', head: true }).eq('status', 'recebido');
    const { data: ativos } = await supabase.from('admin_armazens').select('id', { count: 'exact', head: true }).eq('ativo', true);
    const { data: params } = await supabase.from('admin_custos_parametros').select('*');

    const p = params && params.length > 0 ? params[0] : {};
    const qtdEntregas = entregas?.count || 0;
    const qtdMotoristas = motoristas?.count || 0;
    const qtdDropoffs = dropoffs?.count || 0;
    const qtdArmazens = ativos?.count || 0;

    const custoEntregas = qtdEntregas * Number(p.custo_por_entrega || 25);
    const custoMotoristas = qtdMotoristas * Number(p.custo_mensal_motorista || 2500);
    const custoDropoffs = qtdDropoffs * Number(p.custo_por_dropoff || 8);
    const custoFixo = qtdArmazens * Number(p.custo_fixo_mensal_armazem || 50000);
    const custoTotal = custoEntregas + custoMotoristas + custoDropoffs + custoFixo;

    return json({
      total: totalCount,
      concluidas: concluidas?.count || 0,
      atrasos: atrasos?.count || 0,
      cancelados: cancelados?.count || 0,
      emTransito: emTransito?.count || 0,
      taxa: totalCount > 0 ? ((concluidas?.count || 0) / totalCount * 100).toFixed(1) : '0.0',
      custo: custoTotal.toFixed(2),
    });
  }

  if (path === '/custos') {
    const { data: log } = await supabase.from('admin_custos_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);
    const { data: params } = await supabase.from('admin_custos_parametros')
      .select('*, admin_armazens(nome, cidade)');
    return json({ historico: log || [], parametros: params || [] });
  }

  if (path === '/custos/calcular') {
    await calcularCustos(supabase);
    return json({ success: true, message: 'Custos calculados' });
  }

  if (path?.startsWith('/custos-parametros/') && req.method === 'PUT') {
    const id = path.replace('/custos-parametros/', '');
    const body: any = await req.json();
    const { data, error } = await supabase.from('admin_custos_parametros').update(body).eq('id', id).select();
    if (error) return json({ error: error.message }, 400);
    return json(data?.[0] || {});
  }

  if (path === '/custos-parametros' && req.method === 'GET') {
    const { data } = await supabase.from('admin_custos_parametros').select('*, admin_armazens(nome, cidade)');
    return json(data || []);
  }

  if (path === '/status-entregas') {
    const { data } = await supabase.from('admin_pedidos').select('status');
    const counts: Record<string, number> = {};
    (data || []).forEach((r: any) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return json(Object.entries(counts).map(([status, count]) => ({ status, count })));
  }

  if (path === '/performance') {
    const { data } = await supabase.from('admin_performance_diaria').select('*').order('id');
    return json(data || []);
  }

  if (path === '/pedidos-recentes') {
    const { data } = await supabase.from('admin_pedidos')
      .select('codigo, cliente:admin_clientes!cliente_id(nome), armazem:admin_armazens!armazem_origem_id(nome), destino_cidade, destino_estado, status, previsao')
      .order('created_at', { ascending: false }).limit(10);
    return json((data || []).map((r: any) => ({
      codigo: r.codigo,
      cliente: r.cliente?.nome || 'N/A',
      origem: r.armazem?.nome || 'N/A',
      destino_cidade: r.destino_cidade,
      destino_estado: r.destino_estado,
      status: r.status,
      previsao: r.previsao,
    })));
  }

  return json({ error: 'Rota não encontrada' }, 404);
}

// ── Router ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });

  const url = new URL(req.url);
  const path = url.pathname.replace(/^(\/functions\/v1)?\/admin/, '').replace(/\/$/, '');
  const body = req.method === 'GET' || req.method === 'DELETE' ? {} : await req.json().catch(() => ({}));
  const segments = path.split('/').filter(Boolean);

  try {
    // Dashboard
    if (segments[0] === 'dashboard') {
      return await handleDashboard(req, '/' + segments.slice(1).join('/'));
    }

    // Setores
    if (segments[0] === 'setores') {
      if (req.method === 'GET' && !segments[1]) return await listResource('admin_setores', req, ['nome']);
      if (req.method === 'GET' && segments[1]) return await getResource('admin_setores', req, segments[1]);
      if (req.method === 'POST') return await createResource('admin_setores', req, body);
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_setores', req, segments[1], body);
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_setores', req, segments[1]);
    }

    // Cargos
    if (segments[0] === 'cargos') {
      if (req.method === 'GET' && !segments[1]) {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const { data } = await supabase.from('admin_cargos').select('*, setor:admin_setores!setor_id(nome)').order('setor_id').order('nivel', { ascending: false });
        return json(data || []);
      }
      if (req.method === 'GET' && segments[1]) return await getResource('admin_cargos', req, segments[1]);
      if (req.method === 'POST') return await createResource('admin_cargos', req, { ...body, permissoes: JSON.stringify(body.permissoes || []) });
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_cargos', req, segments[1], { ...body, permissoes: JSON.stringify(body.permissoes || []) });
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_cargos', req, segments[1]);
    }

    // Permissoes
    if (segments[0] === 'permissoes') {
      if (req.method === 'GET') {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const setor_id = url.searchParams.get('setor_id');
        let q = supabase.from('admin_permissoes').select('*');
        if (setor_id) q = q.eq('setor_id', setor_id);
        const { data } = await q;
        return json(data || []);
      }
      if (req.method === 'POST') return await createResource('admin_permissoes', req, body);
    }

    // Usuarios (profiles)
    if (segments[0] === 'usuarios') {
      if (req.method === 'GET' && !segments[1]) {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const search = url.searchParams.get('search') || '';
        const semCargo = url.searchParams.get('sem_cargo') === 'true';
        let q = supabase.from('profiles').select('*, cargo:admin_cargos!cargo_id(nome), setor:admin_setores!setor_id(nome)');
        if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        if (semCargo) q = q.is('cargo_id', null);
        const { data } = await q.order('full_name');
        return json(data || []);
      }
      if (req.method === 'GET' && segments[1]) {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const { data: profile } = await supabase.from('profiles').select('*, cargo:admin_cargos!cargo_id(nome,permissoes), setor:admin_setores!setor_id(nome)').eq('id', segments[1]).single();
        if (!profile) return json({ error: 'Não encontrado' }, 404);
        const { data: armazens } = await supabase.from('admin_usuarios_armazens').select('*, armazem:admin_armazens!armazem_id(*)').eq('usuario_id', segments[1]);
        return json({ ...profile, armazens: armazens || [] });
      }
      if (req.method === 'POST') {
        const authUser = await requireAdmin(req);
        if (!authUser) return json({ error: 'Não autorizado' }, 401);
        const { usuario_id, cargo_id, setor_id, telefone, status, armazens } = body as any;
        if (!usuario_id) return json({ error: 'usuario_id é obrigatório' }, 400);
        const updates: Record<string, unknown> = {};
        if (cargo_id) updates.cargo_id = cargo_id;
        if (setor_id) updates.setor_id = setor_id;
        if (telefone) updates.telefone = telefone;
        if (status) updates.status = status;
        updates.role = 'admin';
        const { error } = await supabase.from('profiles').update(updates).eq('id', usuario_id);
        if (error) return json({ error: error.message }, 400);
        if (armazens && Array.isArray(armazens)) {
          await supabase.from('admin_usuarios_armazens').delete().eq('usuario_id', usuario_id);
          for (const a of armazens) {
            await supabase.from('admin_usuarios_armazens').insert({ usuario_id, armazem_id: a.id || a.armazem_id, acesso_admin: a.acesso_admin || false });
          }
        }
        auditLog(authUser.id, 'CREATE', 'usuarios', usuario_id, 'Vinculado ao Logistix', null);
        return json({ ok: true }, 201);
      }
      if (req.method === 'PUT' && segments[1]) {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const updates: Record<string, unknown> = {};
        if (body.nome) updates.full_name = body.nome;
        if (body.email) updates.email = body.email;
        if (body.cargo_id) updates.cargo_id = body.cargo_id;
        if (body.setor_id) updates.setor_id = body.setor_id;
        if (body.telefone) updates.telefone = body.telefone;
        if (body.status) updates.status = body.status;
        const { error } = await supabase.from('profiles').update(updates).eq('id', segments[1]);
        if (error) return json({ error: error.message }, 400);

        if (body.armazens) {
          await supabase.from('admin_usuarios_armazens').delete().eq('usuario_id', segments[1]);
          for (const a of body.armazens as any[]) {
            await supabase.from('admin_usuarios_armazens').insert({ usuario_id: segments[1], armazem_id: a.id || a.armazem_id, acesso_admin: a.acesso_admin || false });
          }
        }
        auditLog(user.id, 'UPDATE', 'profiles', segments[1], body.nome as string || 'usuário', null);
        return json({ ok: true });
      }
    }

    // Armazens
    if (segments[0] === 'armazens') {
      if (req.method === 'GET' && !segments[1]) {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const { data } = await supabase.from('admin_armazens').select('*').eq('ativo', true).order('nome');
        return json((data || []).map((a: any) => ({ ...a, pct: a.capacidade > 0 ? Math.round(a.ocupacao * 100 / a.capacidade) : 0 })));
      }
      if (req.method === 'GET' && segments[1]) return await getResource('admin_armazens', req, segments[1]);
      if (req.method === 'POST') return await createResource('admin_armazens', req, body);
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_armazens', req, segments[1], body);
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_armazens', req, segments[1]);
    }

    // Clientes
    if (segments[0] === 'clientes') {
      if (req.method === 'GET' && !segments[1]) return await listResource('admin_clientes', req, ['nome', 'cnpj']);
      if (req.method === 'GET' && segments[1]) return await getResource('admin_clientes', req, segments[1]);
      if (req.method === 'POST') return await createResource('admin_clientes', req, body);
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_clientes', req, segments[1], body);
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_clientes', req, segments[1]);
    }

    // Pedidos
    if (segments[0] === 'pedidos') {
      if (req.method === 'GET' && !segments[1]) {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const search = url.searchParams.get('search') || '';
        const status = url.searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        let countQuery = supabase.from('admin_pedidos').select('*', { count: 'exact', head: true });
        let dataQuery = supabase.from('admin_pedidos')
          .select('*, cliente:admin_clientes!cliente_id(nome), armazem:admin_armazens!armazem_origem_id(nome)');
        if (status) { countQuery = countQuery.eq('status', status); dataQuery = dataQuery.eq('status', status); }
        if (search) {
          countQuery = countQuery.or(`codigo.ilike.%${search}%`);
          dataQuery = dataQuery.or(`codigo.ilike.%${search}%`);
        }
        const { count } = await countQuery;
        const { data } = await dataQuery.order('id', { ascending: false }).range(offset, offset + limit - 1);
        return json({ rows: data || [], total: count || 0, page, pages: Math.ceil((count || 0) / limit) });
      }
      if (req.method === 'GET' && segments[1]) return await getResource('admin_pedidos', req, segments[1]);
      if (req.method === 'POST') return await createResource('admin_pedidos', req, body);
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_pedidos', req, segments[1], body);
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_pedidos', req, segments[1]);
    }

    // Entregas
    if (segments[0] === 'entregas') {
      if (req.method === 'GET' && !segments[1]) return await listResource('admin_entregas', req);
      if (req.method === 'GET' && segments[1]) return await getResource('admin_entregas', req, segments[1]);
      if (req.method === 'POST') return await createResource('admin_entregas', req, body);
      if (req.method === 'PUT' && segments[1]) {
        const r = await updateResource('admin_entregas', req, segments[1], body);
        if (body.status === 'entregue') {
          const { data: entrega } = await supabase.from('admin_entregas').select('*, pedido:admin_pedidos!pedido_id(codigo)').eq('id', segments[1]).single();
          if (entrega?.pedido) await trackingEvent(entrega.pedido_id, 'ENTREGA', `Entrega confirmada - ${entrega.pedido.codigo}`, entrega.pedido.codigo, 'entregue');
        }
        if (body.status === 'em_transito') {
          const { data: entrega } = await supabase.from('admin_entregas').select('*, pedido:admin_pedidos!pedido_id(codigo)').eq('id', segments[1]).single();
          if (entrega?.pedido) await trackingEvent(entrega.pedido_id, 'ROTA', `Saiu para entrega - ${entrega.pedido.codigo}`, entrega.pedido.codigo, 'em_transito');
        }
        return r;
      }
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_entregas', req, segments[1]);
    }

    // Transportes
    if (segments[0] === 'transportes') {
      if (req.method === 'GET' && !segments[1]) {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const armazem_id = url.searchParams.get('armazem_id');
        let q = supabase.from('admin_transportes').select('*, armazem:admin_armazens!armazem_id(nome)');
        if (armazem_id) q = q.eq('armazem_id', armazem_id);
        const { data } = await q.order('id');
        return json(data || []);
      }
      if (req.method === 'GET' && segments[1]) return await getResource('admin_transportes', req, segments[1]);
      if (req.method === 'POST') return await createResource('admin_transportes', req, body);
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_transportes', req, segments[1], body);
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_transportes', req, segments[1]);
    }

    // Estoque
    if (segments[0] === 'estoque') {
      if (req.method === 'GET') {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const armazem_id = url.searchParams.get('armazem_id');
        let q = supabase.from('admin_estoque').select('*, armazem:admin_armazens!armazem_id(nome)');
        if (armazem_id) q = q.eq('armazem_id', armazem_id);
        const { data } = await q.order('produto');
        return json(data || []);
      }
      if (req.method === 'POST') return await createResource('admin_estoque', req, body);
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_estoque', req, segments[1], body);
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_estoque', req, segments[1]);
    }

    // Coletas
    if (segments[0] === 'coletas') {
      if (req.method === 'GET' && !segments[1]) return await listResource('admin_coletas', req);
      if (req.method === 'GET' && segments[1]) return await getResource('admin_coletas', req, segments[1]);
      if (req.method === 'POST') return await createResource('admin_coletas', req, body);
      if (req.method === 'PUT' && segments[1]) {
        const r = await updateResource('admin_coletas', req, segments[1], body);
        if (body.status === 'coletado') {
          const { data: coleta } = await supabase.from('admin_coletas').select('*, pedido:admin_pedidos!pedido_id(codigo)').eq('id', segments[1]).single();
          if (coleta?.pedido) await trackingEvent(coleta.pedido_id, 'COLETA', `Coleta confirmada - ${coleta.pedido.codigo}`, coleta.pedido.codigo, 'coletado');
        }
        if (body.status === 'em_transito') {
          const { data: coleta } = await supabase.from('admin_coletas').select('*, pedido:admin_pedidos!pedido_id(codigo)').eq('id', segments[1]).single();
          if (coleta?.pedido) await trackingEvent(coleta.pedido_id, 'SAIDA', `Saiu para coleta - ${coleta.pedido.codigo}`, coleta.pedido.codigo, 'em_transito');
        }
        return r;
      }
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_coletas', req, segments[1]);
    }

    // Transferencias
    if (segments[0] === 'transferencias') {
      if (req.method === 'GET') {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const { data } = await supabase.from('admin_transferencias')
          .select('*, origem:admin_armazens!armazem_origem_id(nome), destino:admin_armazens!armazem_destino_id(nome)')
          .order('id', { ascending: false });
        return json(data || []);
      }
      if (req.method === 'POST') return await createResource('admin_transferencias', req, body);
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_transferencias', req, segments[1], body);
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_transferencias', req, segments[1]);
    }

    // Ocorrencias
    if (segments[0] === 'ocorrencias') {
      if (req.method === 'GET') {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const statusFilter = url.searchParams.get('status') || '';
        let q = supabase.from('admin_ocorrencias').select('*, pedido:admin_pedidos!pedido_id(codigo)');
        if (statusFilter) q = q.eq('status', statusFilter);
        const { data } = await q.order('id', { ascending: false });
        return json(data || []);
      }
      if (req.method === 'POST') return await createResource('admin_ocorrencias', req, body);
      if (req.method === 'PUT' && segments[1]) return await updateResource('admin_ocorrencias', req, segments[1], body);
      if (req.method === 'DELETE' && segments[1]) return await deleteResource('admin_ocorrencias', req, segments[1]);
    }

    // Rastreamento - busca pública por código (não requer admin)
    if (segments[0] === 'rastreamento' && !segments[1] && req.method === 'GET') {
      const codigo = url.searchParams.get('codigo') || '';
      if (!codigo) {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const { data } = await supabase.from('admin_rastreamento').select('*, pedido:admin_pedidos!pedido_id(codigo)').order('created_at', { ascending: false }).limit(50);
        return json(data || []);
      }
      const { data: pedido } = await supabase.from('admin_pedidos').select('id, codigo, destino_cidade, destino_estado, status, peso_kg, valor, cliente:admin_clientes!cliente_id(nome)').eq('codigo', codigo).maybeSingle();
      if (!pedido) return json({ error: 'Pedido não encontrado' }, 404);
      const { data: eventos } = await supabase.from('admin_rastreamento').select('*').eq('pedido_id', pedido.id).order('created_at', { ascending: false });
      return json({ pedido, eventos: eventos || [] });
    }

    // Rastreamento - criar evento (requer admin)
    if (segments[0] === 'rastreamento' && segments[1] === 'evento' && req.method === 'POST') {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);
      const { pedido_id, tipo, descricao, local, status } = body as any;
      if (!pedido_id || !tipo || !descricao) return json({ error: 'pedido_id, tipo e descricao obrigatórios' }, 400);
      const evt: any = { pedido_id, tipo, descricao, local: local || 'Sistema', status: status || 'registrado' };
      const { data, error } = await supabase.from('admin_rastreamento').insert(evt).select().single();
      if (error) return json({ error: error.message }, 400);
      auditLog(user.id, 'CREATE', 'rastreamento', data.id, `Evento: ${tipo} - ${descricao}`, null);
      return json(data, 201);
    }

    // Etiqueta (label) - dados para impressão
    if (segments[0] === 'etiqueta' && segments[1]) {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);
      const { data: pedido } = await supabase.from('admin_pedidos')
        .select('*, cliente:admin_clientes!cliente_id(*), armazem_origem:admin_armazens!armazem_origem_id(nome,cidade,estado), armazem_destino:admin_armazens!armazem_destino_id(nome,cidade,estado)')
        .eq('id', segments[1]).single();
      if (!pedido) return json({ error: 'Pedido não encontrado' }, 404);
      return json(pedido);
    }

    // Configuracoes
    if (segments[0] === 'configuracoes') {
      if (req.method === 'GET') {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const { data } = await supabase.from('admin_configuracoes').select('*');
        const config: Record<string, string> = {};
        (data || []).forEach((r: any) => { config[r.chave] = r.valor; });
        return json(config);
      }
      if (req.method === 'PUT') {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const { chave, valor } = body as any;
        if (!chave) return json({ error: 'chave é obrigatória' }, 400);
        const { error } = await supabase.from('admin_configuracoes').upsert({ chave, valor, updated_at: new Date().toISOString() });
        if (error) return json({ error: error.message }, 400);
        auditLog(user.id, 'UPDATE', 'configuracoes', null, chave, null);
        return json({ ok: true });
      }
    }

    // Auditoria
    if (segments[0] === 'auditoria') {
      if (req.method === 'GET') {
        const user = await requireAdmin(req);
        if (!user) return json({ error: 'Não autorizado' }, 401);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;
        const { data } = await supabase.from('admin_auditoria')
          .select('*, usuario:profiles!usuario_id(nome:full_name)')
          .order('id', { ascending: false }).range(offset, offset + limit - 1);
        return json(data || []);
      }
    }

    // Envio (Shipping)
    if (segments[0] === 'envio') {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);

      // POST /envio - criar/remeter pedido
      if (req.method === 'POST') {
        const { pedido_id, transporter_id, data_envio, obs } = body as any;
        if (!pedido_id) return json({ error: 'pedido_id é obrigatório' }, 400);

        // Atualizar status do pedido para "em_transito"
        await supabase.from('admin_pedidos').update({ status: 'em_transito' }).eq('id', pedido_id);

        // Criar registro de entrega
        const { data: entrega, error } = await supabase.from('admin_entregas')
          .insert({
            pedido_id,
            transporte_id: transporter_id || null,
            status: 'em_transito',
            entregue_em: null
          })
          .select()
          .single();

        if (error) return json({ error: error.message }, 400);

        // Criar evento de rastreamento
        await supabase.from('admin_rastreamento').insert({
          pedido_id,
          tipo: 'ENVIO',
          descricao: `Pedido remetido${obs ? ': ' + obs : ''}`,
          local: '',
          status: 'em_transito'
        });

        auditLog(user.id, 'CREATE', 'envio', entrega.id, `Pedido ${pedido_id} remetido`, null);
        return json(entrega, 201);
      }

      // PUT /envio/:id - atualizar status do envio
      if (req.method === 'PUT' && segments[1]) {
        const { status, data_entrega } = body as any;
        
        const { data: entrega, error } = await supabase.from('admin_entregas')
          .update({ status, entregue_em: data_entrega })
          .eq('id', segments[1])
          .select()
          .single();

        if (error) return json({ error: error.message }, 400);

        // Atualizar status do pedido
        if (status === 'entregue') {
          const { data: e } = await supabase.from('admin_entregas').select('pedido_id').eq('id', segments[1]).single();
          if (e?.pedido_id) {
            await supabase.from('admin_pedidos').update({ status: 'entregue' }).eq('id', e.pedido_id);
            
            // Criar evento de rastreamento de entrega
            await supabase.from('admin_rastreamento').insert({
              pedido_id: e.pedido_id,
              tipo: 'ENTREGA',
              descricao: 'Pedido entregue ao destinatário',
              local: '',
              status: 'entregue'
            });
          }
        }

        auditLog(user.id, 'UPDATE', 'envio', segments[1], `Status: ${status}`, null);
        return json(entrega);
      }
    }

    // Recebimento (Receipt)
    if (segments[0] === 'recebimento') {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);

      // GET /recebimento?armazem_id=xxx - listar recebimentos pendentes
      if (req.method === 'GET') {
        const armazem_id = url.searchParams.get('armazem_id');
        
        // Buscar pedidos que estão em trânsito com destino ao armazém especificado
        let q = supabase.from('admin_pedidos')
          .select('*, cliente:admin_clientes(nome), armazem:admin_armazens(nome)')
          .eq('status', 'em_transito');
        
        if (armazem_id) q = q.eq('armazem_origem_id', armazem_id);
        
        const { data } = await q.order('created_at', { ascending: false });
        return json(data || []);
      }

      // POST /recebimento - confirmar recebimento
      if (req.method === 'POST') {
        const { pedido_id, armazem_id, observacoes, itens } = body as any;
        if (!pedido_id) return json({ error: 'pedido_id é obrigatório' }, 400);

        // Criar registro de recebimento
        const { data: recebimento, error } = await supabase.from('admin_recebimentos')
          .insert({
            pedido_id,
            armazem_id: armazem_id || null,
            status: 'recebido',
            observacoes: observacoes || '',
            recebido_em: new Date().toISOString()
          })
          .select()
          .single();

        if (error) return json({ error: error.message }, 400);

        // Atualizar status do pedido para "recebido"
        await supabase.from('admin_pedidos').update({ status: 'recebido' }).eq('id', pedido_id);

        // Criar evento de rastreamento
        await supabase.from('admin_rastreamento').insert({
          pedido_id,
          tipo: 'RECEBIMENTO',
          descricao: `Pedido recebido no armazém${observacoes ? ': ' + observacoes : ''}`,
          local: '',
          status: 'recebido'
        });

        // Se houver itens, criar entradas no estoque
        if (itens && Array.isArray(itens)) {
          for (const item of itens) {
            await supabase.from('admin_estoque').insert({
              armazem_id: armazem_id || null,
              produto: item.produto || 'Item',
              sku: item.sku || '',
              quantidade: item.quantidade || 1
            });
          }
        }

        auditLog(user.id, 'CREATE', 'recebimento', recebimento.id, `Pedido ${pedido_id} recebido`, null);
        return json(recebimento, 201);
      }
    }

    // Me (current user with admin profile)
    if (segments[0] === 'me') {
      const user = await requireAdmin(req);
      if (!user) return json({ error: 'Não autorizado' }, 401);
      const { data: setor } = await supabase.from('admin_setores').select('*').eq('id', user.profile.setor_id).single();
      const { data: cargo } = await supabase.from('admin_cargos').select('*').eq('id', user.profile.cargo_id).single();
      const { data: permissoes } = await supabase.from('admin_permissoes').select('*');
      const { data: armazens } = await supabase.from('admin_usuarios_armazens')
        .select('*, armazem:admin_armazens!armazem_id(*)').eq('usuario_id', user.id);
      return json({
        id: user.id,
        nome: user.profile.full_name,
        email: user.email,
        setor,
        cargo,
        permissoes: permissoes || [],
        armazens: armazens || [],
        permissoes_cargo: cargo?.permissoes || [],
      });
    }

    return json({ error: 'Rota não encontrada: ' + path }, 404);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno' }, 500);
  }
});
