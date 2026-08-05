import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000;

function getWebhookSecret(): string {
  return Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

function successResponse(data: unknown) {
  return new Response(JSON.stringify({ success: true, data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function jsonFetch(url: string, options: Record<string, unknown>) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      ...(options.headers || {}) as Record<string, string>,
    },
  });
}

async function callLogistixSync(transactionId: string) {
  try {
    const { data: tx } = await supabase
      .from('transactions')
      .select('*, profiles!transactions_buyer_id_fkey(email), parts!transactions_part_id_fkey(*)')
      .eq('id', transactionId)
      .single();

    if (!tx) return;

    const syncPayload = {
      transaction_id: tx.id,
      buyer_email: tx.profiles?.email || '',
      shipping_address: {
        cidade: tx.shipping_city || 'São Paulo',
        estado: tx.shipping_state || 'SP',
        cep: tx.shipping_zip || '',
      },
    };

    const syncRes = await jsonFetch(
      `${supabaseUrl}/functions/v1/logistix-sync`,
      { method: 'POST', body: JSON.stringify(syncPayload) }
    );
    const syncResult = await syncRes.json();
    console.log('[Webhook] Logistix sync result:', syncResult);
  } catch (err) {
    console.error('[Webhook] Logistix sync error:', err);
  }
}

async function notifyKonbiniPending(transactionId: string) {
  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer:profiles!transactions_buyer_id_fkey(email, full_name),
      seller:profiles!transactions_seller_id_fkey(email, full_name),
      parts!transactions_part_id_fkey(title)
    `)
    .eq('id', transactionId)
    .single();

  if (!tx) return;

  const buyerId = tx.buyer_id;
  const sellerId = tx.seller_id;
  const partTitle = tx.parts?.title || 'Peça';
  const buyerName = tx.buyer?.full_name || 'Comprador';

  const message = {
    sender_id: buyerId,
    receiver_id: sellerId,
    product_id: tx.part_id,
    transaction_id: tx.id,
    content: `Aguardando pagamento do pedido via Konbini (Loja de Conveniência Japonesa). Peça reservada. 🏪`,
    message_type: 'system',
  };

  try {
    await supabase.from('messages').insert(message);
  } catch (e: any) {
    console.error('[Webhook] Erro ao criar mensagem de Konbini pendente:', e);
  }

  try {
    if (tx.buyer?.email) {
      await jsonFetch(`${supabaseUrl}/functions/v1/notifications`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'email',
          to: tx.buyer.email,
          subject: `Pedido Aguardando Pagamento Konbini - ${partTitle}`,
          body: `
            <h2>Olá, ${buyerName}!</h2>
            <p>Seu pedido para a autopeça <strong>${partTitle}</strong> foi recebido com sucesso.</p>
            <p>O método de pagamento escolhido foi <strong>Konbini (Loja de Conveniência no Japão)</strong>.</p>
            <p>Por favor, utilize as instruções de pagamento enviadas pelo Stripe ou no caixa da loja para concluir o pagamento em até 3 dias. Assim que o pagamento for realizado, seu pedido será processado e o vendedor será notificado para envio.</p>
            <p>Atenciosamente,<br/>Equipe JDM Car Parts</p>
          `,
          metadata: { transaction_id: tx.id },
        }),
      });
    }
  } catch (err) {
    console.error('[Webhook] Konbini pending email error:', err);
  }
}

async function notifyPaymentConfirmed(tx: any) {
  if (!tx) return;

  const buyerId = tx.buyer_id;
  const sellerId = tx.seller_id;
  const partTitle = tx.parts?.title || 'Peça';
  const buyerName = tx.buyer?.full_name || 'Comprador';
  const sellerName = tx.seller?.full_name || 'Vendedor';

  const messages = [
    {
      sender_id: sellerId,
      receiver_id: buyerId,
      product_id: tx.part_id,
      transaction_id: tx.id,
      content: `Obrigado pela compra! Recebi seu pagamento para "${partTitle}". Vou preparar o envio em breve. 🚚`,
      message_type: 'system',
    },
    {
      sender_id: buyerId,
      receiver_id: sellerId,
      product_id: tx.part_id,
      transaction_id: tx.id,
      content: `Pagamento confirmado para "${partTitle}"! 🎉`,
      message_type: 'system',
    },
  ];

  try {
    const { error: msgErr } = await supabase.from('messages').insert(messages);
    if (msgErr) console.error('[Webhook] Erro ao criar mensagens em batch:', msgErr);
  } catch (e: any) {
    console.error('[Webhook] Erro ao criar mensagens de pagamento confirmado:', e);
  }

  // Email para o comprador
  try {
    if (tx.buyer?.email) {
      await jsonFetch(`${supabaseUrl}/functions/v1/notifications`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'email',
          to: tx.buyer.email,
          subject: `Pagamento Confirmado - ${partTitle}`,
          body: `
            <h2>Pagamento Confirmado!</h2>
            <p>Olá, ${buyerName}.</p>
            <p>Seu pagamento para a autopeça <strong>${partTitle}</strong> foi confirmado com sucesso!</p>
            <p>Os fundos estão sob custódia segura da plataforma (escrow) e o vendedor já foi notificado para preparar o envio.</p>
            <p>Atenciosamente,<br/>Equipe JDM Car Parts</p>
          `,
          metadata: { transaction_id: tx.id },
        }),
      });
    }
  } catch (err) {
    console.error('[Webhook] Buyer confirmation email error:', err);
  }

  // Email para o vendedor
  try {
    if (tx.seller?.email) {
      await jsonFetch(`${supabaseUrl}/functions/v1/notifications`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'email',
          to: tx.seller.email,
          subject: `Nova Venda Realizada! - ${partTitle}`,
          body: `
            <h2>Parabéns, ${sellerName}!</h2>
            <p>Você realizou a venda da peça <strong>${partTitle}</strong>!</p>
            <p>Os fundos estão em custódia segura na plataforma. Por favor, prepare e envie o pacote para o comprador.</p>
            <p>Assim que o comprador receber o item e confirmar a entrega, os fundos serão liberados para o seu saldo.</p>
            <p>Atenciosamente,<br/>Equipe JDM Car Parts</p>
          `,
          metadata: { transaction_id: tx.id },
        }),
      });
    }
  } catch (err) {
    console.error('[Webhook] Seller confirmation email error:', err);
  }
}

async function notifyKonbiniExpired(tx: any) {
  if (!tx) return;

  const partTitle = tx.parts?.title || 'Peça';
  const buyerName = tx.buyer?.full_name || 'Comprador';
  const buyerId = tx.buyer_id;
  const sellerId = tx.seller_id;

  const messages = [
    {
      sender_id: buyerId,
      receiver_id: sellerId,
      product_id: tx.part_id,
      transaction_id: tx.id,
      content: `O prazo de pagamento do Konbini expirou. O pedido foi cancelado e a peça voltou ao catálogo. ❌`,
      message_type: 'system',
    }
  ];

  for (const msg of messages) {
    try {
      await supabase.from('messages').insert(msg);
    } catch (e: any) {
      console.error('[Webhook] Erro ao criar mensagem de cancelamento de Konbini:', e);
    }
  }

  // Email para o comprador
  try {
    if (tx.buyer?.email) {
      await jsonFetch(`${supabaseUrl}/functions/v1/notifications`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'email',
          to: tx.buyer.email,
          subject: `Pedido Cancelado (Pagamento Expirado) - ${partTitle}`,
          body: `
            <h2>Seu pedido foi cancelado</h2>
            <p>Olá, ${buyerName}.</p>
            <p>O prazo para pagamento do Konbini para a peça <strong>${partTitle}</strong> expirou e a transação correspondente foi cancelada.</p>
            <p>A autopeça foi devolvida ao catálogo ativo da plataforma.</p>
            <p>Atenciosamente,<br/>Equipe JDM Car Parts</p>
          `,
          metadata: { transaction_id: tx.id },
        }),
      });
    }
  } catch (err) {
    console.error('[Webhook] Buyer expired email error:', err);
  }
}

async function confirmPayment(transaction_id: string, part_id: string, seller_id: string, stripe_payment_id: string, auction_id?: string) {
  await supabase
    .from('transactions')
    .update({
      payment_status: 'escrow',
      stripe_payment_id: stripe_payment_id,
    })
    .eq('id', transaction_id);

  if (part_id) {
    await supabase
      .from('parts')
      .update({
        status: 'sold',
        ...(auction_id ? { winner_notified: true } : {}),
      })
      .eq('id', part_id);
  }

  if (seller_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_sales')
      .eq('id', seller_id)
      .single();

    await supabase
      .from('profiles')
      .update({ total_sales: (profile?.total_sales || 0) + 1 })
      .eq('id', seller_id);
  }

  console.log(`[Webhook] Payment confirmed for transaction ${transaction_id}`);

  await callLogistixSync(transaction_id);

  const { data: tx } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer:profiles!transactions_buyer_id_fkey(email, full_name),
      seller:profiles!transactions_seller_id_fkey(email, full_name),
      parts!transactions_part_id_fkey(title)
    `)
    .eq('id', transaction_id)
    .single();

  await notifyPaymentConfirmed(tx);
}

async function handleCheckoutCompleted(session: any) {
  const { transaction_id, part_id, buyer_id, seller_id, auction_id, contract_id } = session.metadata || {};

  if (contract_id && session.payment_status === 'paid') {
    const { error: contractErr } = await supabase
      .from('legal_contracts')
      .update({
        status: 'active',
        paid_at: new Date().toISOString()
      })
      .eq('id', contract_id);
    if (contractErr) {
      console.error(`[Webhook] Error activating contract ${contract_id}:`, contractErr);
    } else {
      console.log(`[Webhook] Contract ${contract_id} activated via Stripe`);
    }
  }

  if (transaction_id) {
    if (session.payment_status === 'paid') {
      await confirmPayment(transaction_id, part_id, seller_id, session.id, auction_id);
    } else {
      // Pagamento pendente (Konbini)
      await supabase
        .from('transactions')
        .update({
          payment_status: 'pending_payment',
          stripe_payment_id: session.id,
        })
        .eq('id', transaction_id);

      console.log(`[Webhook] Konbini checkout completed. Awaiting payment for transaction ${transaction_id}`);
      await notifyKonbiniPending(transaction_id);
    }
  }

  const userId = session.metadata?.user_id;
  if (userId && session.mode === 'subscription' && session.payment_status === 'paid') {
    await verifySubscription(userId, session.id);
  }
}

async function handlePaymentFailed(payment: any) {
  const transactionId = payment.metadata?.transaction_id;
  if (transactionId) {
    await supabase
      .from('transactions')
      .update({ payment_status: 'failed' })
      .eq('id', transactionId);
    console.log(`[Webhook] Payment failed for transaction ${transactionId}`);
  }
}

async function handleChargeRefunded(charge: any) {
  if (charge.payment_intent) {
    const { data: transaction } = await supabase
      .from('transactions')
      .select('id, part_id')
      .eq('stripe_payment_id', charge.payment_intent)
      .single();

    if (transaction) {
      await supabase
        .from('transactions')
        .update({ payment_status: 'refunded' })
        .eq('id', transaction.id);

      if (transaction.part_id) {
        await supabase
          .from('parts')
          .update({ status: 'active' })
          .eq('id', transaction.part_id);
      }

      console.log(`[Webhook] Charge refunded for transaction ${transaction.id}`);
    }
  }
}

async function handleDisputeCreated(dispute: any) {
  const paymentIntent = dispute.payment_intent;
  if (paymentIntent) {
    const { data: transaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('stripe_payment_id', paymentIntent)
      .single();

    if (transaction) {
      await supabase
        .from('transactions')
        .update({ payment_status: 'disputed' })
        .eq('id', transaction.id);
      console.log(`[Webhook] Dispute created for transaction ${transaction.id}`);
    }
  }
}

async function handleTransferCreated(transfer: any) {
  const sellerId = transfer.metadata?.seller_id;
  if (sellerId) {
    console.log(`[Webhook] Transfer created for seller ${sellerId}: ${transfer.amount}`);
  }
}

async function verifySubscription(userId: string, sessionId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!profile) {
    console.warn(`[Webhook] Subscription paid for unknown user ${userId}; skipping verification`);
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      store_verified: true,
      store_status: 'approved',
      store_approved_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error(`[Webhook] Error verifying store for user ${userId}:`, error);
  } else {
    console.log(`[Webhook] Store verified for user ${userId} (checkout ${sessionId})`);
  }
}

async function revokeSubscription(subscription: any) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.warn('[Webhook] Subscription cancelled without user_id metadata; skipping revocation');
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      store_verified: false,
      store_status: 'pending',
    })
    .eq('id', userId);

  if (error) {
    console.error(`[Webhook] Error revoking store for user ${userId}:`, error);
  } else {
    console.log(`[Webhook] Store verification revoked for user ${userId}`);
  }
}

async function handlePayoutPaid(payout: any) {
  console.log(`[Webhook] Payout paid: ${payout.id} amount: ${payout.amount}`);
}

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts = sigHeader.split(',');
  let timestamp = '';
  let sigValue = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') sigValue = value;
  }

  if (!timestamp || !sigValue) return false;

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > SIGNATURE_TOLERANCE_MS) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const hmacResult = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const hmacHex = Array.from(new Uint8Array(hmacResult))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const sigBuffer = hexToBytes(sigValue);
  const hmacBuffer = new Uint8Array(hmacResult);

  if (sigBuffer.length !== hmacBuffer.length) return false;

  return constantTimeCompare(sigBuffer, hmacBuffer);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

async function handleAsyncPaymentFailed(session: any) {
  const { transaction_id, part_id } = session.metadata || {};

  if (transaction_id) {
    await supabase
      .from('transactions')
      .update({ payment_status: 'failed' })
      .eq('id', transaction_id);

    if (part_id) {
      await supabase
        .from('parts')
        .update({ status: 'active' })
        .eq('id', part_id);
    }

    console.log(`[Webhook] Async payment failed (Konbini expired) for transaction ${transaction_id}`);

    const { data: tx } = await supabase
      .from('transactions')
      .select(`
        *,
        buyer:profiles!transactions_buyer_id_fkey(email, full_name),
        parts!transactions_part_id_fkey(title)
      `)
      .eq('id', transaction_id)
      .single();

    await notifyKonbiniExpired(tx);
  }
}

async function handleEvent(event: StripeEvent) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;
      const { transaction_id, part_id, seller_id, auction_id } = session.metadata || {};
      if (transaction_id) {
        await confirmPayment(transaction_id, part_id, seller_id, session.id, auction_id);
      }
      break;
    }
    case 'checkout.session.async_payment_failed':
      await handleAsyncPaymentFailed(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object);
      break;
    case 'charge.dispute.created':
    case 'charge.dispute.updated':
      await handleDisputeCreated(event.data.object);
      break;
    case 'transfer.created':
      await handleTransferCreated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await revokeSubscription(event.data.object);
      break;
    case 'payout.paid':
      await handlePayoutPaid(event.data.object);
      break;
    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const webhookSecret = getWebhookSecret();
  if (!webhookSecret || webhookSecret === 'whsec_') {
    return errorResponse('Webhook not configured: STRIPE_WEBHOOK_SECRET is required', 503);
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return errorResponse('Stripe signature missing', 400);
    }

    const payload = await req.text();

    const isValid = await verifyStripeSignature(payload, signature, webhookSecret);
    if (!isValid) {
      return errorResponse('Invalid Stripe signature', 400);
    }

    const event = JSON.parse(payload) as StripeEvent;
    console.log('[Webhook] Event received:', event.type);

    await handleEvent(event);

    return successResponse({ received: true });

  } catch (err) {
    console.error('[Webhook] Error:', err);
    const errMsg = err instanceof Error ? err.message : String(err);
    return errorResponse(`Webhook error: ${errMsg}`, 500);
  }
}

Deno.serve(handler);
