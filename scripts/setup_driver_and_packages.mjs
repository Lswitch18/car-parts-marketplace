import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://clqubcryhbrjlupkgeva.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no ambiente (.env).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function run() {
  console.log("=== INICIANDO CRIAÇÃO DE MOTORISTA E PACOTES DE TESTE ===");

  const email = 'development@daig.jp';
  const password = 'password123';

  // 1. Criar ou recuperar usuário no Auth
  console.log(`\n1. Verificando usuário auth para: ${email}...`);
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error("Erro ao listar usuários:", usersError.message);
    return;
  }

  let user = usersData.users.find(u => u.email === email);
  let userId;

  if (user) {
    console.log(`Usuário já existe com ID: ${user.id}`);
    userId = user.id;
  } else {
    console.log("Criando novo usuário...");
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Carlos Silva (Exemplo)' }
    });

    if (createError) {
      console.error("Erro ao criar usuário:", createError.message);
      return;
    }

    userId = createData.user.id;
    console.log(`Usuário criado com sucesso! ID: ${userId}`);
  }

  // 2. Atualizar perfil correspondente
  console.log("\n2. Atualizando perfil correspondente na tabela profiles...");
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: 'Carlos Silva (Exemplo)',
    role: 'admin',
    is_verified: true,
    phone: '(11) 98888-7777'
  });

  if (profileError) {
    console.error("Erro ao atualizar profiles:", profileError.message);
    return;
  }
  console.log("Perfil atualizado/criado como admin!");

  // 3. Vincular motorista na tabela admin_motoristas
  console.log("\n3. Vinculando motorista na tabela admin_motoristas...");
  // Verificando se já existe motorista para esse usuário
  const { data: existingMotorista } = await supabase
    .from('admin_motoristas')
    .select('*')
    .eq('usuario_id', userId)
    .maybeSingle();

  if (existingMotorista) {
    console.log("Motorista já vinculado:", existingMotorista);
  } else {
    // Vamos inserir com o ID de teste esperado pelo app, ou deixar gerar e vincular
    const motoristaId = 'a0000003-0000-0000-0000-000000000009'; // ID hardcoded no app
    
    // Verificamos se o ID hardcoded já está em uso
    const { data: checkId } = await supabase.from('admin_motoristas').select('*').eq('id', motoristaId).maybeSingle();
    
    const motoristaInsert = {
      usuario_id: userId,
      nome: 'Carlos Silva (Exemplo)',
      telefone: '(11) 98888-7777',
      cnh: '98765432100',
      transportadora: 'DAIG',
      ativo: true
    };

    if (checkId) {
      // Se já existe um com este ID, atualizamos o usuario_id para o nosso novo
      console.log(`ID ${motoristaId} já existe. Atualizando para apontar para o novo usuário...`);
      const { error: updateErr } = await supabase.from('admin_motoristas').update({ usuario_id: userId }).eq('id', motoristaId);
      if (updateErr) console.error("Erro ao atualizar motorista existente:", updateErr.message);
    } else {
      console.log("Criando novo motorista com ID hardcoded...");
      const { error: insertErr } = await supabase.from('admin_motoristas').insert({
        id: motoristaId,
        ...motoristaInsert
      });
      if (insertErr) {
        console.log("Erro ao inserir com ID hardcoded, tentando inserir sem ID...", insertErr.message);
        const { error: insertErr2 } = await supabase.from('admin_motoristas').insert(motoristaInsert);
        if (insertErr2) console.error("Erro final ao criar motorista:", insertErr2.message);
      }
    }
  }

  // 4. Habilitar dois pacotes para coleta com o endereço do vendedor
  console.log("\n4. Criando dois pacotes de coleta com endereço do vendedor...");
  
  // Resgatando CDs e Clientes
  const { data: armazens } = await supabase.from('admin_armazens').select('id, nome').limit(2);
  const { data: clientes } = await supabase.from('admin_clientes').select('id, nome').limit(2);

  if (!armazens || armazens.length === 0 || !clientes || clientes.length === 0) {
    console.error("Não foram encontrados armazens ou clientes para vincular as coletas.");
    return;
  }

  const armazemId = armazens[0].id;
  const clienteId = clientes[0].id;

  // Criando pedidos
  const pedidosData = [
    {
      codigo: `PED-COL-${Math.floor(1000 + Math.random() * 9000)}`,
      cliente_id: clienteId,
      armazem_origem_id: armazemId,
      armazem_destino_id: armazemId,
      destino_cidade: 'Tokyo',
      destino_estado: 'Tokyo',
      peso_kg: 3.5,
      valor: 8500,
      status: 'pendente'
    },
    {
      codigo: `PED-COL-${Math.floor(1000 + Math.random() * 9000)}`,
      cliente_id: clienteId,
      armazem_origem_id: armazemId,
      armazem_destino_id: armazemId,
      destino_cidade: 'Osaka',
      destino_estado: 'Osaka',
      peso_kg: 5.2,
      valor: 12000,
      status: 'pendente'
    }
  ];

  console.log("Inserindo pedidos na tabela admin_pedidos...");
  const { data: createdPedidos, error: pedidosErr } = await supabase.from('admin_pedidos').insert(pedidosData).select();
  if (pedidosErr) {
    console.error("Erro ao criar pedidos:", pedidosErr.message);
    return;
  }
  console.log("Pedidos criados:", createdPedidos.map(p => p.codigo));

  // Criando coletas associadas aos pedidos criados
  const coletasData = createdPedidos.map((pedido, index) => ({
    pedido_id: pedido.id,
    motorista_id: userId, // Motorista que fará a coleta
    status: 'pendente',
    endereco: index === 0 ? 'Vendedor JDM Shop, Chiyoda-ku, Tokyo 100-0001' : 'Vendedor Osaka Motors, Naniwa-ku, Osaka 556-0011',
    latitude: index === 0 ? 35.6812 : 34.6612,
    longitude: index === 0 ? 139.7671 : 135.5021
  }));

  console.log("Inserindo coletas na tabela admin_coletas...");
  const { data: createdColetas, error: coletasErr } = await supabase.from('admin_coletas').insert(coletasData).select();
  if (coletasErr) {
    console.error("Erro ao criar coletas:", coletasErr.message);
  } else {
    console.log("Coletas criadas com sucesso:", createdColetas);
  }

  console.log("\n=== TUDO CONCLUÍDO COM SUCESSO! ===");
}

run();
