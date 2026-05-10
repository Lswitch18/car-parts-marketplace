import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata?: {
        transaction_id?: string;
        part_id?: string;
        buyer_id?: string;
        seller_id?: string;
      };
    };
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

async function verifyStripeSignature(payload: string, signature: string): Promise<StripeEvent | null> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(STRIPE_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const payloadBytes = encoder.encode(payload);
    const signatureBytes = encoder.encode(signature.replace('sha256=', ''));
    
    const isValid = await crypto.subtle.verify('HMAC', key, payloadBytes, signatureBytes);
    
    if (!isValid) return null;
    
    return JSON.parse(payload) as StripeEvent;
  } catch (e) {
    console.error('Stripe signature verification error:', e);
    return null;
  }
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
    const event = await verifyStripeSignature(payload, signature);

    if (!event) {
      return errorResponse('Invalid Stripe signature', 400);
    }

    console.log('Stripe event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { transaction_id, part_id, buyer_id } = session.metadata || {};

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

          console.log(`Payment completed for transaction ${transaction_id}`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const payment = event.data.object;
        console.log(`Payment succeeded: ${payment.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const payment = event.data.object;
        console.log(`Payment failed: ${payment.id}`);
        
        if (payment.metadata?.transaction_id) {
          await supabase
            .from('transactions')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.metadata.transaction_id);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log(`Charge refunded: ${charge.id}`);
        
        if (charge.payment_intent) {
          const { data: transaction } = await supabase
            .from('transactions')
            .select('id')
            .eq('stripe_payment_id', charge.payment_intent)
            .single();

          if (transaction) {
            await supabase
              .from('transactions')
              .update({
                payment_status: 'refunded',
                updated_at: new Date().toISOString(),
              })
              .eq('id', transaction.id);
          }
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object;
        console.log(`Connected account updated: ${account.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return successResponse({ received: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return errorResponse(`Webhook error: ${err.message}`, 500);
  }
});