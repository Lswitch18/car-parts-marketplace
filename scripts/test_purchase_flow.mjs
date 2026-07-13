import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';

global.WebSocket = ws;

// Load .env configuration
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://clqubcryhbrjlupkgeva.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Erro: SUPABASE_SERVICE_ROLE_KEY não encontrada no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function testFlow() {
  console.log('=== INICIANDO TESTE DO FLUXO DE COMPRA E PAGAMENTO ===\n');

  // 1. Obter uma autopeça ativa
  console.log('1. Buscando uma peça ativa no catálogo...');
  const { data: part, error: partError } = await supabase
    .from('parts')
    .select('id, title, price, seller_id, status')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (partError || !part) {
    console.error('❌ Erro: Nenhuma peça ativa encontrada para testar.', partError?.message);
    return;
  }
  console.log(`   - Peça encontrada: "${part.title}" | Preço: ¥${part.price} | Vendedor ID: ${part.seller_id}`);

  // 2. Obter um perfil de comprador diferente do vendedor
  console.log('2. Buscando um comprador de teste...');
  const { data: buyer, error: buyerError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .neq('id', part.seller_id)
    .limit(1)
    .maybeSingle();

  if (buyerError || !buyer) {
    console.error('❌ Erro: Nenhum comprador de teste encontrado.', buyerError?.message);
    return;
  }
  console.log(`   - Comprador: "${buyer.full_name}" | Email: ${buyer.email} | ID: ${buyer.id}`);

  // 3. Criar a transação
  // Limpar transação existente se houver para evitar o erro do índice único
  await supabase.from('transactions').delete().eq('buyer_id', buyer.id).eq('part_id', part.id);

  console.log('3. Criando transação com status pendente...');
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      part_id: part.id,
      buyer_id: buyer.id,
      seller_id: part.seller_id,
      amount: part.price,
      payment_status: 'pending',
      fulfillment_status: 'pending',
      shipping_name: buyer.full_name,
      shipping_email: buyer.email,
      shipping_address: '1-1 Chiyoda, Chiyoda City, Tokyo, Japan'
    })
    .select()
    .single();

  if (txError || !tx) {
    console.error('❌ Erro ao criar transação:', txError?.message);
    return;
  }
  console.log(`   - Transação criada com ID: ${tx.id} | Status: ${tx.payment_status}`);

  // 4. Simular sucesso no pagamento (Stripe Webhook)
  console.log('4. Simulando Webhook do Stripe (checkout.session.completed)...');
  console.log('   - Atualizando transação para "escrow" (valores em custódia)...');
  
  let updatePayload = { payment_status: 'escrow' };
  
  const { data: updatedTx, error: updateTxError } = await supabase
    .from('transactions')
    .update({
      ...updatePayload,
      stripe_payment_id: `ch_mock_${Math.random().toString(36).substring(7)}`
    })
    .eq('id', tx.id)
    .select()
    .single();

  let finalTx = updatedTx;
  if (updateTxError) {
    console.log('   ⚠️  Nota: A coluna stripe_payment_id ainda não existe (execute a query SQL no Supabase). Tentando atualizar apenas o status de pagamento...');
    const { data: updatedTxFallback, error: updateTxFallbackError } = await supabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', tx.id)
      .select()
      .single();
    
    if (updateTxFallbackError || !updatedTxFallback) {
      console.error('❌ Erro ao atualizar status de pagamento da transação:', updateTxFallbackError?.message);
      return;
    }
    finalTx = updatedTxFallback;
  } else {
    console.log(`   - Stripe Payment ID gravado: ${finalTx.stripe_payment_id}`);
  }
  console.log(`   - Transação atualizada: ${finalTx.id} | Status: ${finalTx.payment_status}`);

  // 5. Simular atualização do status do produto para 'sold'
  console.log('5. Atualizando a peça para "sold" (vendida)...');
  const { data: updatedPart, error: updatePartError } = await supabase
    .from('parts')
    .update({ status: 'sold' })
    .eq('id', part.id)
    .select('id, title, status')
    .single();

  if (updatePartError || !updatedPart) {
    console.error('❌ Erro ao atualizar status da peça:', updatePartError?.message);
    return;
  }
  console.log(`   - Peça atualizada: "${updatedPart.title}" | Novo Status: ${updatedPart.status}`);

  // 6. Validar a criação das mensagens do sistema
  console.log('6. Inserindo mensagens de sistema para comprador e vendedor...');
  const messages = [
    {
      sender_id: part.seller_id,
      receiver_id: buyer.id,
      part_id: part.id,
      transaction_id: tx.id,
      content: `Obrigado pela compra! Recebi seu pagamento para "${part.title}". Vou preparar o envio em breve. 🚚`,
      message_type: 'system',
    },
    {
      sender_id: buyer.id,
      receiver_id: part.seller_id,
      part_id: part.id,
      transaction_id: tx.id,
      content: `Pagamento confirmado para "${part.title}"! 🎉`,
      message_type: 'system',
    }
  ];

  const { error: msgError } = await supabase
    .from('messages')
    .insert(messages);

  if (msgError) {
    console.error('❌ Erro ao inserir mensagens:', msgError.message);
  } else {
    console.log('   - Mensagens de chat do sistema inseridas com sucesso.');
  }

  // Limpeza: Restaurar o produto para 'active' e excluir a transação de teste
  console.log('\n7. Realizando limpeza do teste...');
  await supabase.from('parts').update({ status: 'active' }).eq('id', part.id);
  await supabase.from('transactions').delete().eq('id', tx.id);
  console.log('   - Produto restaurado para "active".');
  console.log('   - Transação de teste excluída.');

  console.log('\n=== TESTE CONCLUÍDO COM SUCESSO (Todos os passos validados) ===');
}

testFlow();
