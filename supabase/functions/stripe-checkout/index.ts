import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireAuth } from '../utils/base.ts';

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

  // Security: Require auth for all stripe operations
  const { response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (action === 'create-checkout') {
      return await createCheckoutSession(req);
    }

    if (action === 'create-contract-subscription') {
      return await createContractSubscription(req);
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
  const { transaction_id, part_id: clientPartId, buyer_id: clientBuyerId, seller_id: clientSellerId, amount: clientAmount, shipping, auction_id, title: customTitle } = await req.json();

  if (!transaction_id) {
    return new Response(JSON.stringify({ error: 'Missing transaction_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Buscar transação no banco de dados como fonte da verdade (segurança contra adulteração de preço)
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select('amount, buyer_id, seller_id, part_id')
    .eq('id', transaction_id)
    .single();

  if (txError || !tx) {
    return new Response(JSON.stringify({ error: 'Transação não encontrada no banco de dados' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const amount = tx.amount;
  const part_id = tx.part_id;
  const buyer_id = tx.buyer_id;
  const seller_id = tx.seller_id;

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

  // ── Buscar taxa de comissão customizada do banco de dados
  let customRate = COMMISSION_RATE;
  try {
    const { data: configData } = await supabase
      .from('admin_configuracoes')
      .select('valor')
      .eq('chave', 'comissao_taxa')
      .single();
    if (configData?.valor) {
      const parsed = parseFloat(configData.valor);
      if (!isNaN(parsed)) {
        customRate = parsed / 100;
      }
    }
  } catch (e) {
    console.warn('Falha ao obter taxa customizada de comissão, usando padrão de 10%:', e);
  }

  const fees = calculateFees(Number(amount), customRate);
  const applicationFeeAmount = Math.round(fees.commission_amount + fees.stripe_fee);

  const { data: part } = await supabase
    .from('parts')
    .select('title, images')
    .eq('id', part_id)
    .single();

  const productName = customTitle || part?.title || 'Peça automotiva';

  const lineItems: Record<string, string> = {
    'mode': 'payment',
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'jpy',
    'line_items[0][price_data][product_data][name]': productName,
    'line_items[0][price_data][unit_amount]': String(Math.round(amount)),
    'line_items[0][quantity]': '1',
    'success_url': `${APP_URL}/dashboard?payment=success&transaction=${transaction_id}`,
    'cancel_url': `${APP_URL}/dashboard?payment=cancelled`,
    'metadata[transaction_id]': transaction_id,
    'metadata[part_id]': part_id || '',
    'metadata[buyer_id]': buyer_id || '',
    'metadata[seller_id]': seller_id || '',
  };

  if (auction_id) {
    lineItems['metadata[auction_id]'] = auction_id;
  }

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
    lineItems['shipping_address_collection[allowed_countries][0]'] = 'JP';
    Object.entries(shipping).forEach(([k, v]) => {
      if (v) lineItems[`metadata[shipping_${k}]`] = String(v);
    });
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

function calculateFees(amount: number, rate: number = COMMISSION_RATE) {
  const commission = amount * rate;
  const stripeFee = (amount * STRIPE_FEE_RATE) + STRIPE_FEE_FIXED;
  const platformFee = commission + stripeFee;
  const sellerNet = amount - platformFee;

  return {
    gross_amount: amount,
    commission_rate: rate,
    commission_amount: commission,
    stripe_fee: stripeFee,
    platform_fee: platformFee,
    seller_net: sellerNet,
  };
}

async function createContractSubscription(req: Request) {
  const { contract_id } = await req.json();

  if (!contract_id) {
    return new Response(JSON.stringify({ error: 'Missing contract_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 1. Fetch the contract details from database
  const { data: contract, error: contractErr } = await supabase
    .from('legal_contracts')
    .select('*')
    .eq('id', contract_id)
    .single();

  if (contractErr || !contract) {
    return new Response(JSON.stringify({ error: 'Contrato não encontrado' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_') {
    // Demo Mode Checkout simulation URL or mock response
    return new Response(JSON.stringify({ 
      success: true, 
      demo_mode: true,
      url: `${APP_URL}/admin/logistix?payment=success&contract_id=${contract_id}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Create product in Stripe
    const productParams = new URLSearchParams({
      'name': `JDM Logistix WMS Partnership - ${contract.partner_name}`,
      'description': `Contrato B2B Nº ${contract.contract_number}. Serviços: ${contract.service_type}`,
    });
    
    const productRes = await fetch('https://api.stripe.com/v1/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: productParams.toString()
    });
    const productData = await productRes.json();
    if (productData.error) throw new Error(productData.error.message);

    // 3. Create price in Stripe
    const interval = contract.periodicity === 'anual' ? 'year' : 'month';
    const priceParams = new URLSearchParams({
      'product': productData.id,
      'unit_amount': String(Math.round(contract.contract_value)),
      'currency': 'jpy',
      'recurring[interval]': interval,
    });

    const priceRes = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: priceParams.toString()
    });
    const priceData = await priceRes.json();
    if (priceData.error) throw new Error(priceData.error.message);

    // 4. Create Stripe Checkout Session in subscription mode
    const sessionParams = new URLSearchParams({
      'mode': 'subscription',
      'payment_method_types[]': 'card',
      'line_items[0][price]': priceData.id,
      'line_items[0][quantity]': '1',
      'success_url': `${APP_URL}/admin/logistix?payment=success&contract_id=${contract_id}`,
      'cancel_url': `${APP_URL}/admin/logistix?payment=cancelled`,
      'metadata[contract_id]': contract_id,
      'metadata[contract_number]': contract.contract_number,
      'metadata[partner_email]': contract.partner_email,
    });

    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sessionParams.toString(),
    });
    const sessionData = await sessionRes.json();
    if (sessionData.error) throw new Error(sessionData.error.message);

    return new Response(JSON.stringify({
      success: true,
      url: sessionData.url,
      session_id: sessionData.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}