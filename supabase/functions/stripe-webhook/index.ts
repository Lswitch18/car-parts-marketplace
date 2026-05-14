import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

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

async function notifyBuyerAndSeller(tx: any) {
  if (!tx) return;

  const buyerId = tx.buyer_id;
  const sellerId = tx.seller_id;
  const partTitle = tx.parts?.title || 'Peça';

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

  for (const msg of messages) {
    await supabase.from('messages').insert(msg).then().catch(e =>
      console.error('[Webhook] Erro ao criar mensagem:', e)
    );
  }

  try {
    await jsonFetch(`${supabaseUrl}/functions/v1/notifications`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'email',
        to: tx.profiles?.email || '',
        subject: `Pagamento confirmado - ${partTitle}`,
        body: `Seu pagamento para "${partTitle}" foi confirmado com sucesso!`,
        metadata: { transaction_id: tx.id },
      }),
    });
  } catch (err) {
    console.error('[Webhook] Notification error:', err);
  }
}

async function handleCheckoutCompleted(session: any) {
  const { transaction_id, part_id, buyer_id, seller_id } = session.metadata || {};

  if (transaction_id) {
    await supabase
      .from('transactions')
      .update({
        payment_status: 'paid',
        stripe_payment_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction_id);

    if (part_id) {
      await supabase
        .from('parts')
        .update({ status: 'sold' })
        .eq('id', part_id);
    }

    if (seller_id) {
      await supabase
        .from('profiles')
        .update({ total_sales: supabase.rpc('increment', { x: 1 }) })
        .eq('id', seller_id);
    }

    console.log(`[Webhook] Payment completed for transaction ${transaction_id}`);

    await callLogistixSync(transaction_id);

    const { data: tx } = await supabase
      .from('transactions')
      .select('*, profiles!transactions_buyer_id_fkey(email), parts!transactions_part_id_fkey(title)')
      .eq('id', transaction_id)
      .single();

    await notifyBuyerAndSeller(tx);
  }
}

async function handlePaymentFailed(payment: any) {
  const transactionId = payment.metadata?.transaction_id;
  if (transactionId) {
    await supabase
      .from('transactions')
      .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
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
        .update({ payment_status: 'refunded', updated_at: new Date().toISOString() })
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
        .update({ payment_status: 'disputed', updated_at: new Date().toISOString() })
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

async function handlePayoutPaid(payout: any) {
  console.log(`[Webhook] Payout paid: ${payout.id} amount: ${payout.amount}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return errorResponse('Stripe signature missing', 400);
    }

    const payload = await req.text();

    if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET === 'whsec_') {
      const event = JSON.parse(payload) as StripeEvent;
      console.log('[Webhook] DEMO MODE - skipping signature verification');
      console.log('[Webhook] Event received:', event.type);

      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object);
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
        case 'payout.paid':
          await handlePayoutPaid(event.data.object);
          break;
        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      return successResponse({ received: true });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(STRIPE_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigParts = signature.split('=');
    const sigValue = sigParts.length > 1 ? sigParts[1] : signature;
    const payloadBytes = encoder.encode(payload);
    const signatureBytes = encoder.encode(sigValue);
    const isValid = await crypto.subtle.verify('HMAC', key, payloadBytes, signatureBytes);

    if (!isValid) {
      return errorResponse('Invalid Stripe signature', 400);
    }

    const event = JSON.parse(payload) as StripeEvent;
    console.log('[Webhook] Event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
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
      case 'payout.paid':
        await handlePayoutPaid(event.data.object);
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return successResponse({ received: true });

  } catch (err) {
    console.error('[Webhook] Error:', err);
    return errorResponse(`Webhook error: ${err.message}`, 500);
  }
});
