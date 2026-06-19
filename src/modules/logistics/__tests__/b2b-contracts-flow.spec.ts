import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Define a global mock WebSocket to satisfy Supabase client initialization under Node.js
if (typeof (globalThis as any).WebSocket === 'undefined') {
  class MockWebSocket {
    url = '';
    readyState = 0;
    send() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  (globalThis as any).WebSocket = MockWebSocket;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://clqubcryhbrjlupkgeva.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

describe('B2B Contracts & Activation Flow', () => {
  it('should automatically activate a B2B API key when the associated contract becomes active', async () => {
    // 1. Create a dummy inactive B2B API Key using admin client
    const testPrefix = 'test_' + Math.random().toString(36).substring(2, 6);
    const { data: apiKey, error: keyErr } = await supabaseAdmin
      .from('b2b_api_keys')
      .insert({
        partner_name: 'Test Partner Logistics',
        partner_email: 'test@partner.jp',
        api_key_hash: 'hash_' + Math.random().toString(36).substring(2, 10),
        api_key_prefix: testPrefix,
        scopes: ['read'],
        is_active: false // INACTIVE initially
      })
      .select()
      .single();

    expect(keyErr).toBeNull();
    expect(apiKey).toBeDefined();
    expect(apiKey.is_active).toBe(false);

    // 2. Create a contract linked to this API Key using admin client
    const contractNumber = 'TEST-CTR-' + Math.floor(1000 + Math.random() * 9000);
    const { data: contract, error: contractErr } = await supabaseAdmin
      .from('legal_contracts')
      .insert({
        contract_number: contractNumber,
        partner_name: 'Test Partner Logistics',
        partner_email: 'test@partner.jp',
        service_type: 'b2b_logistix',
        status: 'pending_signature',
        contract_value: 60000.00,
        api_key_id: apiKey.id
      })
      .select()
      .single();

    expect(contractErr).toBeNull();
    expect(contract).toBeDefined();
    expect(contract.status).toBe('pending_signature');

    // 3. Simulating Signature
    const { data: signedContract, error: signErr } = await supabaseAdmin
      .from('legal_contracts')
      .update({ status: 'signed', signed_at: new Date().toISOString() })
      .eq('id', contract.id)
      .select()
      .single();

    expect(signErr).toBeNull();
    expect(signedContract.status).toBe('signed');

    // Verify key remains inactive
    const { data: keyAfterSign } = await supabaseAdmin
      .from('b2b_api_keys')
      .select('is_active')
      .eq('id', apiKey.id)
      .single();
    expect(keyAfterSign?.is_active).toBe(false);

    // 4. Simulating Payment (Updates status to active, which triggers activation of the B2B Key)
    const { data: activeContract, error: payErr } = await supabaseAdmin
      .from('legal_contracts')
      .update({ status: 'active', paid_at: new Date().toISOString() })
      .eq('id', contract.id)
      .select()
      .single();

    expect(payErr).toBeNull();
    expect(activeContract.status).toBe('active');

    // 5. Assert database trigger activated the API key!
    const { data: keyAfterPayment } = await supabaseAdmin
      .from('b2b_api_keys')
      .select('is_active')
      .eq('id', apiKey.id)
      .single();
    
    expect(keyAfterPayment?.is_active).toBe(true);

    // Cleanup test data
    await supabaseAdmin.from('legal_contracts').delete().eq('id', contract.id);
    await supabaseAdmin.from('b2b_api_keys').delete().eq('id', apiKey.id);
  }, 15000);
});
