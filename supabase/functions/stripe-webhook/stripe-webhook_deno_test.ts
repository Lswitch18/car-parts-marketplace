import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';

const TEST_SECRET = 'whsec_test_secret_1234567890';

function setEnv(secret: string) {
  Deno.env.set('SUPABASE_URL', 'http://localhost:0');
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
  Deno.env.set('STRIPE_WEBHOOK_SECRET', secret);
}

async function signPayload(
  payload: string,
  secret: string,
  timestampSec: number,
): Promise<string> {
  const signedPayload = `${timestampSec}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `t=${timestampSec},v1=${hex}`;
}

async function webhookRequest(payload: unknown, signature?: string): Promise<Response> {
  const headers = new Headers();
  headers.set('content-type', 'application/json');
  if (signature) headers.set('stripe-signature', signature);
  return await handler(new Request('http://localhost/stripe-webhook', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  }));
}

setEnv(TEST_SECRET);
const { handler } = await import('./index.ts');

Deno.test('webhook aceita payload com assinatura válida', async () => {
  const payload = JSON.stringify({ id: 'evt_test', type: 'test.event', data: { object: {} } });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await signPayload(payload, TEST_SECRET, timestamp);

  const res = await webhookRequest(JSON.parse(payload), signature);
  const body = await res.json();
  assertEquals(res.status, 200);
  assertEquals(body.success, true);
});

Deno.test('webhook rejeita assinatura inválida (400)', async () => {
  const payload = JSON.stringify({ id: 'evt_test', type: 'test.event', data: { object: {} } });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await signPayload(payload, 'whsec_wrong_secret', timestamp);

  const res = await webhookRequest(JSON.parse(payload), signature);
  assertEquals(res.status, 400);
});

Deno.test('webhook rejeita header stripe-signature ausente (400)', async () => {
  const payload = { id: 'evt_test', type: 'test.event', data: { object: {} } };
  const res = await webhookRequest(payload);
  assertEquals(res.status, 400);
});

Deno.test('webhook rejeita assinatura com timestamp fora da janela (400)', async () => {
  const payload = JSON.stringify({ id: 'evt_test', type: 'test.event', data: { object: {} } });
  const oldTimestamp = Math.floor(Date.now() / 1000) - 10 * 60;
  const signature = await signPayload(payload, TEST_SECRET, oldTimestamp);

  const res = await webhookRequest(JSON.parse(payload), signature);
  assertEquals(res.status, 400);
});

Deno.test('webhook falha fechado (503) quando STRIPE_WEBHOOK_SECRET ausente', async () => {
  Deno.env.delete('STRIPE_WEBHOOK_SECRET');
  const payload = { id: 'evt_test', type: 'test.event', data: { object: {} } };
  const res = await webhookRequest(payload, 't=1,v1=abc');
  assertEquals(res.status, 503);
});
