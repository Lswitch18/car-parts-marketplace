import { supabase, successResponse, errorResponse, corsHeaders, getAuthUser, verifyToken } from '../utils/base.ts';
import { z } from 'https://esm.sh/zod@3.22.4';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;

const COMMISSION_RATE = 0.074;
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FEE_FIXED = 30;

function calculateFees(amount: number) {
  const commission = amount * COMMISSION_RATE;
  const stripeFee = (amount * STRIPE_FEE_RATE) + STRIPE_FEE_FIXED;
  const platformFee = commission + stripeFee;
  const sellerNet = amount - platformFee;
  
  return {
    gross_amount: amount,
    commission_rate: COMMISSION_RATE,
    commission_amount: commission,
    stripe_fee: stripeFee,
    platform_fee: platformFee,
    seller_net: sellerNet,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (req.method === 'GET') {
      if (action === 'list') return await listTransactions(req);
      if (action === 'calculate') return calculateFeesEndpoint(req);
      const txId = action?.match(/^[0-9a-f-]{36}$/) ? action : url.searchParams.get('id');
      if (txId) return await getTransaction(txId);
    }

    if (req.method === 'POST') {
      if (action === 'create') {
        const body = await req.json();
        return await createTransaction(req, body);
      }
      if (action === 'recover') {
        const body = await req.json();
        return await recoverTransaction(req, body);
      }
    }

    if (req.method === 'PUT') {
      const txId = action?.match(/^[0-9a-f-]{36}$/) ? action : url.searchParams.get('id');
      if (txId) {
        const body = await req.json();
        return await updateTransaction(req, txId, body);
      }
    }

    return new Response(JSON.stringify(errorResponse('Endpoint não encontrado')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify(errorResponse(errMsg)), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});

async function listTransactions(req: Request) {
  const token = getAuthUser(req);
  if (!token) {
    return new Response(JSON.stringify(errorResponse('Token required')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyToken(token);
  if (!user) {
    return new Response(JSON.stringify(errorResponse('Invalid token')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const role = url.searchParams.get('role');
  const status = url.searchParams.get('status');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  let query = supabase
    .from('transactions')
    .select(`
      *,
      part:parts(id, title, images, price),
      buyer:profiles!transactions_buyer_id_fkey(id, full_name, email),
      seller:profiles!transactions_seller_id_fkey(id, full_name, email)
    `, { count: 'exact' });

  if (!profile?.role?.includes('admin')) {
    if (role === 'buyer') {
      query = query.eq('buyer_id', user.id);
    } else {
      query = query.eq('seller_id', user.id);
    }
  }

  if (status) query = query.eq('payment_status', status);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse({
    transactions: data,
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function getTransaction(txId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      part:parts(*),
      buyer:profiles!transactions_buyer_id_fkey(id, full_name, email, phone),
      seller:profiles!transactions_seller_id_fkey(id, full_name, email, phone)
    `)
    .eq('id', txId)
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse('Transação não encontrada')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(successResponse(data)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function expireOldPendingTransactions() {
  const expiryTime = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutos atrás
  try {
    // Busca transações pendentes que expiraram
    const { data: expiredTxs } = await supabase
      .from('transactions')
      .select('id, part_id')
      .eq('payment_status', 'pending')
      .lt('created_at', expiryTime);

    if (expiredTxs && expiredTxs.length > 0) {
      const txIds = expiredTxs.map(t => t.id);
      const partIds = expiredTxs.map(t => t.part_id);

      // Marca as transações como falhas
      await supabase
        .from('transactions')
        .update({ payment_status: 'failed' })
        .in('id', txIds);

      // Devolve os itens para ativos
      await supabase
        .from('parts')
        .update({ status: 'active' })
        .in('id', partIds);
        
      console.log(`[Transactions] Expiradas ${expiredTxs.length} transações pendentes.`);
    }
  } catch (err) {
    console.error('[Transactions] Falha ao expirar transações antigas:', err);
  }
}

const shippingSchema = z.object({
  name: z.string().min(2, "Nome do destinatário muito curto").max(100).optional(),
  email: z.string().email("E-mail de envio inválido").optional(),
  phone: z.string().regex(/^(?:\+?81|0)\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{4}$/, "Telefone de envio inválido (formato do Japão esperado)").optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip: z.string().regex(/^\d{3}-\d{4}$|^\d{7}$/, "CEP de envio inválido (deve ser 123-4567 ou 1234567)").optional(),
});

const createTransactionSchema = z.object({
  part_id: z.string().uuid("ID de peça inválido"),
  amount: z.number().positive("O valor deve ser maior que zero"),
  currency: z.string().optional(),
  shipping: shippingSchema.optional(),
  idempotency_key: z.string().optional(),
  confirmed_message_id: z.string().uuid("ID de proposta inválido").optional(),
});

async function createTransaction(req: Request, body: Record<string, unknown>) {
  const token = getAuthUser(req);
  if (!token) {
    return new Response(JSON.stringify(errorResponse('Token required')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyToken(token);
  if (!user) {
    return new Response(JSON.stringify(errorResponse('Invalid token')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // Validar corpo com Zod
  const parseResult = createTransactionSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(JSON.stringify(errorResponse(`Validação falhou: ${parseResult.error.errors.map((e: any) => e.message).join(', ')}`)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { part_id, amount, currency, shipping, idempotency_key, confirmed_message_id } = parseResult.data;

  // Limpa transações pendentes antigas antes de criar ou validar nova transação
  await expireOldPendingTransactions();


  if (!part_id || !amount) {
    return new Response(JSON.stringify(errorResponse('part_id e amount são obrigatórios')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // ── Idempotência: retorna transação existente se a chave já foi usada ──────
  if (idempotency_key) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('*')
      .eq('idempotency_key', idempotency_key)
      .maybeSingle();

    if (existing) {
      const fees = calculateFees(existing.amount);
      return new Response(JSON.stringify(successResponse({
        transaction: existing,
        fees,
        idempotent: true,
      }, 'Transação já existente (idempotente).')), {
        status: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
  }

  // ── Verificação: transação ativa já existe para este (comprador, peça) ─────
  const { data: activeTx } = await supabase
    .from('transactions')
    .select('id, payment_status, amount')
    .eq('buyer_id', user.id)
    .eq('part_id', part_id)
    .in('payment_status', ['pending', 'paid'])
    .maybeSingle();

  if (activeTx) {
    if (activeTx.payment_status === 'pending') {
      // Se já existe uma transação pendente do mesmo usuário, cancela a antiga e permite criar a nova
      await supabase
        .from('transactions')
        .update({ payment_status: 'failed' })
        .eq('id', activeTx.id);

      // Devolve a peça ao status 'active' para que a validação abaixo passe com sucesso
      await supabase
        .from('parts')
        .update({ status: 'active' })
        .eq('id', part_id);

      console.log(`[Transactions] Cancelada transação pendente antiga do mesmo comprador: ${activeTx.id} e reativada a peça ${part_id}`);
    } else {
      const fees = calculateFees(activeTx.amount);
      return new Response(JSON.stringify(successResponse({
        transaction: activeTx,
        fees,
        idempotent: true,
      }, 'Transação ativa já existe para esta peça.')), {
        status: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
  }

  // ── Validação do preço negociado via mensagem confirmada ──────────────────
  // Se confirmed_message_id foi fornecido, valida que o preço bate com a proposta real.
  // Impede manipulação de ?price=X na URL.
  let validatedAmount = Number(amount);

  if (confirmed_message_id) {
    const { data: confirmedMsg } = await supabase
      .from('messages')
      .select('id, message_type, price_confirmed, proposed_price, receiver_id')
      .eq('id', confirmed_message_id)
      .maybeSingle();

    if (!confirmedMsg) {
      return new Response(JSON.stringify(errorResponse('Mensagem de proposta não encontrada')), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    if (confirmedMsg.message_type !== 'price_proposal' || !confirmedMsg.price_confirmed) {
      return new Response(JSON.stringify(errorResponse('Proposta de preço não confirmada')), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // O comprador que inicia o pagamento deve ser quem recebeu a proposta (i.e., o vendedor confirmou)
    // Na arquitetura: comprador ENVIOU a proposta, vendedor CONFIRMOU.
    // Portanto confirmed_message.receiver_id deve ser o vendedor (= part.seller_id).
    // O user autenticado é o comprador, então apenas garantimos que o preço bate.
    const realPrice = Number(confirmedMsg.proposed_price);
    if (Math.abs(realPrice - validatedAmount) > 0.01) {
      return new Response(JSON.stringify(errorResponse(
        `Valor inválido. O preço confirmado da proposta é ¥${realPrice.toLocaleString('ja-JP')}`
      )), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    // Usa o preço do banco (fonte de verdade), não o da URL
    validatedAmount = realPrice;
  }

  // ── Validação da peça ─────────────────────────────────────────────────────
  const { data: part } = await supabase
    .from('parts')
    .select('id, seller_id, price, status')
    .eq('id', part_id)
    .single();

  if (!part || part.status !== 'active') {
    return new Response(JSON.stringify(errorResponse('Peça não disponível para compra')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (part.seller_id === user.id) {
    return new Response(JSON.stringify(errorResponse('Você não pode comprar sua própria peça')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // Se não há proposta negociada, usa o preço original da peça (também como fonte de verdade)
  if (!confirmed_message_id) {
    validatedAmount = part.price;
  }

  const fees = calculateFees(validatedAmount);

  const insertData: Record<string, unknown> = {
    part_id,
    buyer_id: user.id,
    seller_id: part.seller_id,
    amount: validatedAmount,
    currency: currency || 'jpy',
    commission_rate: COMMISSION_RATE,
    commission_amount: fees.commission_amount,
    platform_fee: fees.platform_fee,
    seller_net: fees.seller_net,
    payment_status: 'pending',
    fulfillment_status: 'pending',
    ...(idempotency_key ? { idempotency_key } : {}),
    ...(confirmed_message_id ? { confirmed_message_id } : {}),
  };

  if (shipping && typeof shipping === 'object') {
    const s = shipping as Record<string, string>;
    insertData.shipping_name = s.name || null;
    insertData.shipping_email = s.email || null;
    insertData.shipping_phone = s.phone || null;
    insertData.shipping_address = s.address || null;
    insertData.shipping_city = s.city || null;
    insertData.shipping_state = s.state || null;
    insertData.shipping_zip = s.zip || null;
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // Conflict por unique index (race condition): busca e retorna a existente
    if (error.code === '23505') {
      const { data: raceExisting } = await supabase
        .from('transactions')
        .select('*')
        .eq('idempotency_key', idempotency_key as string)
        .maybeSingle();
      if (raceExisting) {
        return new Response(JSON.stringify(successResponse({
          transaction: raceExisting,
          fees,
          idempotent: true,
        }, 'Transação já existente (race condition resolvida).')), {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  await supabase
    .from('parts')
    .update({ status: 'pending' })
    .eq('id', part_id);

  return new Response(JSON.stringify(successResponse({
    transaction: data,
    fees,
  }, 'Transação criada. Aguardando pagamento.')), {
    status: 201,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

const updateTransactionSchema = z.object({
  payment_status: z.enum(['pending', 'escrow', 'paid', 'completed', 'failed', 'refunded', 'disputed']).optional(),
  fulfillment_status: z.enum(['pending', 'shipped', 'delivered', 'received', 'completed']).optional(),
  stripe_payment_id: z.string().optional(),
});

async function updateTransaction(req: Request, txId: string, body: Record<string, unknown>) {
  const token = getAuthUser(req);
  if (!token) {
    return new Response(JSON.stringify(errorResponse('Token required')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const user = await verifyToken(token);
  if (!user) {
    return new Response(JSON.stringify(errorResponse('Invalid token')), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // Validar corpo com Zod
  const parseResult = updateTransactionSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(JSON.stringify(errorResponse(`Validação falhou: ${parseResult.error.errors.map(e => e.message).join(', ')}`)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  let { payment_status, fulfillment_status, stripe_payment_id } = parseResult.data;

  // Buscar transação atual
  const { data: existingTx, error: fetchErr } = await supabase
    .from('transactions')
    .select('buyer_id, seller_id, payment_status, seller_net, stripe_transfer_id, currency')
    .eq('id', txId)
    .single();

  if (fetchErr || !existingTx) {
    return new Response(JSON.stringify(errorResponse('Transação não encontrada')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // ── Automação Escrow: se o comprador confirmar o recebimento, ativa automaticamente completed ──
  if ((fulfillment_status === 'received' || fulfillment_status === 'delivered') && (!payment_status || payment_status === 'escrow')) {
    payment_status = 'completed';
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role?.includes('admin');
  const isBuyer = existingTx.buyer_id === user.id;
  const isSeller = existingTx.seller_id === user.id;

  if (!isAdmin && !isBuyer && !isSeller) {
    return new Response(JSON.stringify(errorResponse('Não autorizado')), {
      status: 403,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // ── Liberação de Custódia Automática (Escrow Release via Stripe Connect) ──────────────────
  let transferId: string | null = null;
  if (payment_status === 'completed' && (!existingTx.payment_status || existingTx.payment_status === 'escrow' || existingTx.payment_status === 'paid') && !existingTx.stripe_transfer_id) {
    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', existingTx.seller_id)
      .single();

    if (!sellerProfile?.stripe_account_id) {
      return new Response(JSON.stringify(errorResponse('Vendedor não possui conta Stripe vinculada para transferência de fundos')), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }

    if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_') {
      console.log(`[Stripe Connect] Demo Mode: Simulating transfer of ${existingTx.currency || 'jpy'} ${existingTx.seller_net} to ${sellerProfile.stripe_account_id}`);
      transferId = `tr_mock_${crypto.randomUUID()}`;
    } else {
      try {
        const transferRes = await fetch('https://api.stripe.com/v1/transfers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            amount: String(Math.round(existingTx.seller_net)),
            currency: existingTx.currency || 'jpy',
            destination: sellerProfile.stripe_account_id,
            description: `Liberação de escrow para transação ${txId}`,
          }).toString(),
        });
        const transferData = await transferRes.json();
        if (transferData.error) {
          throw new Error(transferData.error.message);
        }
        transferId = transferData.id;
        console.log(`[Stripe Connect] Transferência concluída: ${transferId}`);
      } catch (err: any) {
        console.error('[Stripe Connect] Erro na transferência:', err);
        return new Response(JSON.stringify(errorResponse(`Erro ao transferir fundos no Stripe: ${err.message}`)), {
          status: 500,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }
    }
  }

  const updates: Record<string, unknown> = {};
  if (payment_status) updates.payment_status = payment_status;
  if (fulfillment_status) updates.fulfillment_status = fulfillment_status;
  if (stripe_payment_id) updates.stripe_payment_id = stripe_payment_id;
  if (transferId) updates.stripe_transfer_id = transferId;

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', txId)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  if (payment_status === 'paid') {
    const { data: tx } = await supabase
      .from('transactions')
      .select('part_id, seller_id, buyer_id')
      .eq('id', txId)
      .single();

    if (tx) {
      await supabase
        .from('parts')
        .update({ status: 'sold' })
        .eq('id', tx.part_id);

      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('total_sales')
        .eq('id', tx.seller_id)
        .single();

      await supabase
        .from('profiles')
        .update({ total_sales: (sellerProfile?.total_sales || 0) + 1 })
        .eq('id', tx.seller_id);

      await supabase.from('messages').insert({
        sender_id: tx.seller_id,
        receiver_id: tx.buyer_id,
        product_id: tx.part_id,
        transaction_id: txId,
        content: 'Pagamento confirmado! Pedido será processado em breve.',
        message_type: 'system',
      });

      try {
        const syncRes = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/logistix-sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({ transaction_id: txId }),
          }
        );
        const syncData = await syncRes.json();
        console.log('[Transactions] Logistix sync result:', syncData);
      } catch (err) {
        console.error('[Transactions] Logistix sync error:', err);
      }
    }
  }

  return new Response(JSON.stringify(successResponse(data, 'Transação atualizada')), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

function calculateFeesEndpoint(req: Request) {
  const url = new URL(req.url);
  const amount = parseFloat(url.searchParams.get('amount') || '0');

  if (amount <= 0) {
    return new Response(JSON.stringify(errorResponse('Amount inválido')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const fees = calculateFees(amount);
  return new Response(JSON.stringify(successResponse(fees)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function recoverTransaction(req: Request, body: any) {
  const { transaction_id } = body || {};
  if (!transaction_id) {
    return new Response(JSON.stringify(errorResponse('transaction_id é obrigatório')), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // Fetch transaction details
  const { data: tx, error: fetchErr } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      payment_status,
      created_at,
      buyer:profiles!transactions_buyer_id_fkey(email, full_name),
      seller:profiles!transactions_seller_id_fkey(email, full_name),
      part:parts!transactions_part_id_fkey(title, images, price)
    `)
    .eq('id', transaction_id)
    .single();

  if (fetchErr || !tx) {
    return new Response(JSON.stringify(errorResponse('Transação não encontrada')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const buyerEmail = tx.buyer?.email;
  const buyerName = tx.buyer?.full_name || buyerEmail || 'Cliente DAIG';
  const partTitle = tx.part?.title || 'Peça Automotiva JDM';
  const amountStr = `¥ ${new Intl.NumberFormat('ja-JP').format(tx.amount || 0)}`;
  const appUrl = Deno.env.get('APP_URL') || 'https://daig.jp';
  const checkoutUrl = `${appUrl}/payment/${tx.id}`;

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  let emailSent = false;
  let providerUsed = 'in-app-notification';

  if (resendApiKey && buyerEmail) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DAIG Japan Escrow <suporte@daig.jp>',
          to: [buyerEmail],
          subject: `🛒 Lembrete de Compra: ${partTitle} (${amountStr})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d14; color: #ededed; padding: 30px; border-radius: 12px;">
              <h2 style="color: #00e5ff; margin-top: 0;">Lembrete de Pedido Pendente — DAIG Japan</h2>
              <p>Olá <strong>${buyerName}</strong>,</p>
              <p>Notamos que você não finalizou o pagamento do item abaixo:</p>
              <div style="background: #18181b; padding: 15px; border-radius: 8px; border: 1px solid #27272a; margin: 20px 0;">
                <h3 style="color: #ffffff; margin: 0 0 5px 0;">${partTitle}</h3>
                <p style="color: #00e5ff; font-size: 20px; font-weight: bold; margin: 0;">${amountStr}</p>
              </div>
              <p>Garantimos a reserva por tempo limitado através do nosso sistema seguro de <strong>Custódia Escrow JPY</strong>.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${checkoutUrl}" style="background: #00e5ff; color: #000; padding: 12px 30px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Finalizar Pagamento Agora 🚀
                </a>
              </div>
              <hr style="border: 0; border-top: 1px solid #27272a; margin: 25px 0;" />
              <p style="font-size: 11px; color: #71717a; text-align: center;">Digital A.I. Garage Co., Ltd. • Nagoya / Tokyo, Japan</p>
            </div>
          `,
        }),
      });

      if (resendRes.ok) {
        emailSent = true;
        providerUsed = 'resend';
      } else {
        console.error('[Transactions] Resend error:', await resendRes.text());
      }
    } catch (err) {
      console.error('[Transactions] Resend exception:', err);
    }
  }

  // Always log notification / message in system inbox as well
  await supabase.from('messages').insert({
    sender_id: tx.seller?.id || tx.id,
    receiver_id: tx.buyer?.id || tx.id,
    product_id: tx.part_id,
    transaction_id: tx.id,
    content: `📧 Lembrete de recuperação enviado para ${buyerName} (${buyerEmail || 'In-App'}): Peça ${partTitle} - ${amountStr}.`,
    message_type: 'system',
  });

  return new Response(
    JSON.stringify(
      successResponse({
        transaction_id: tx.id,
        buyer_email: buyerEmail,
        email_sent: emailSent,
        provider: providerUsed,
        checkout_url: checkoutUrl,
      }, 'E-mail e notificação de recuperação de venda processados')
    ),
    { headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
  );
}