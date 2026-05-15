import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

const COMMISSION_RATE = 0.10;
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FEE_FIXED = 30;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'create-checkout') {
      return await createCheckoutSession(req);
    }

    if (action === 'create-connected-account') {
      return await createConnectedAccount(req);
    }

    if (action === 'account-link') {
      return await createAccountLink(req);
    }

    if (action === 'portal') {
      return await createPortalSession(req);
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Stripe error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createCheckoutSession(req: Request) {
  const { transaction_id, part_id, buyer_id, seller_id, amount, shipping } = await req.json();

  if (!transaction_id || !amount) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Stripe não configurado. Use o modo demo para testar.',
      demo_mode: true
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const fees = calculateFees(Number(amount));
  const applicationFeeAmount = Math.round(fees.commission_amount + fees.stripe_fee);

  const { data: part } = await supabase
    .from('parts')
    .select('title, images')
    .eq('id', part_id)
    .single();

  const lineItems: Record<string, string> = {
    'mode': 'payment',
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'jpy',
    'line_items[0][price_data][product_data][name]': part?.title || 'Peça automotiva',
    'line_items[0][price_data][unit_amount]': String(Math.round(amount)),
    'line_items[0][quantity]': '1',
    'success_url': `${APP_URL}/dashboard?payment=success&transaction=${transaction_id}`,
    'cancel_url': `${APP_URL}/dashboard?payment=cancelled`,
    'metadata[transaction_id]': transaction_id,
    'metadata[part_id]': part_id || '',
    'metadata[buyer_id]': buyer_id || '',
    'metadata[seller_id]': seller_id || '',
  };

  if (part?.images?.[0]) {
    lineItems['line_items[0][price_data][product_data][images][0]'] = part.images[0];
  }

  if (seller_id) {
    const { data: seller } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', seller_id)
      .single();

    if (seller?.stripe_account_id) {
      lineItems['transfer_data[destination]'] = seller.stripe_account_id;
      lineItems['application_fee_amount'] = String(applicationFeeAmount);
    }
  }

  if (shipping) {
    lineItems['shipping[name]'] = shipping.name || '';
    lineItems['shipping[address][line1]'] = shipping.address || '';
    lineItems['shipping[address][city]'] = shipping.city || '';
    lineItems['shipping[address][state]'] = shipping.state || '';
    lineItems['shipping[address][postal_code]'] = shipping.zip || '';
    lineItems['shipping[address][country]'] = 'JP';
  }

  const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(lineItems).toString(),
  });

  const sessionData = await session.json();

  if (sessionData.error) {
    return new Response(JSON.stringify({ error: sessionData.error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    url: sessionData.url,
    session_id: sessionData.id,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createConnectedAccount(req: Request) {
  const { seller_id, email } = await req.json();

  if (!seller_id) {
    return new Response(JSON.stringify({ error: 'seller_id required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const account = await fetch('https://api.stripe.com/v1/accounts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'type': 'express',
      'country': 'JP',
      'email': email || '',
      'capabilities[card_payments][requested]': 'true',
      'capabilities[transfers][requested]': 'true',
      'metadata[seller_id]': seller_id,
    }).toString(),
  });

  const accountData = await account.json();

  if (accountData.error) {
    return new Response(JSON.stringify({ error: accountData.error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await supabase
    .from('profiles')
    .update({ stripe_account_id: accountData.id })
    .eq('id', seller_id);

  return new Response(JSON.stringify({
    success: true,
    account_id: accountData.id,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createAccountLink(req: Request) {
  const { account_id, seller_id } = await req.json();

  if (!account_id) {
    return new Response(JSON.stringify({ error: 'account_id required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const accountLink = await fetch('https://api.stripe.com/v1/account_links', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'account': account_id,
      'refresh_url': `${APP_URL}/profile?stripe=refresh`,
      'return_url': `${APP_URL}/profile?stripe=success`,
      'type': 'account_onboarding',
    }).toString(),
  });

  const linkData = await accountLink.json();

  if (linkData.error) {
    return new Response(JSON.stringify({ error: linkData.error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    url: linkData.url,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createPortalSession(req: Request) {
  const { seller_id } = await req.json();

  if (!seller_id) {
    return new Response(JSON.stringify({ error: 'seller_id required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', seller_id)
    .single();

  if (!profile?.stripe_account_id) {
    return new Response(JSON.stringify({ error: 'No Stripe account found' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const portal = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'customer': profile.stripe_account_id,
      'return_url': `${APP_URL}/dashboard`,
    }).toString(),
  });

  const portalData = await portal.json();

  if (portalData.error) {
    return new Response(JSON.stringify({ error: portalData.error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    url: portalData.url,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

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