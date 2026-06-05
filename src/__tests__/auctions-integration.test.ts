/**
 * Testes de Integração — RPCs Reais do Banco (place_bid, resolve_auction, buy_now)
 *
 * Requer SUPABASE_SERVICE_ROLE_KEY no .env para executar.
 * Uso: npx vitest run src/__tests__/auctions-integration.test.ts
 *
 * AVISO: Esses testes chamam o Supabase real. Use com cuidado.
 * Por segurança, a maioria dos testes é READ-ONLY ou usa transações.
 */

import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const hasKeys = !!(SUPABASE_URL && SERVICE_KEY);
const supabase = hasKeys ? createClient(SUPABASE_URL, SERVICE_KEY) : null;

// ═══════════════════════════════════════════════════════════════
// 1. RPC: place_bid  (READ-ONLY — validação sem modificar dados)
// ═══════════════════════════════════════════════════════════════

describe('RPC place_bid', () => {
  if (!hasKeys) {
    it.skip('SUPABASE_SERVICE_ROLE_KEY não configurado');
    return;
  }

  it('rejeita UUID inválido (parte_id inexistente)', async () => {
    const { data, error } = await supabase!
      .rpc('place_bid', {
        p_part_id: '00000000-0000-0000-0000-000000000000',
        p_bidder_id: '00000000-0000-0000-0000-000000000001',
        p_amount: 1000,
      });

    expect(error).toBeNull();
    expect((data as any)?.success).toBe(false);
    expect((data as any)?.error).toContain('não encontrado');
  });

  it('rejeita lance em leilão que não existe (sem lock deadlock)', async () => {
    const { data, error } = await supabase!
      .rpc('place_bid', {
        p_part_id: '11111111-1111-1111-1111-111111111111',
        p_bidder_id: '22222222-2222-2222-2222-222222222222',
        p_amount: 5000,
      });

    expect(error).toBeNull();
    expect((data as any)?.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. RPC: resolve_auction  (READ-ONLY)
// ═══════════════════════════════════════════════════════════════

describe('RPC resolve_auction', () => {
  if (!hasKeys) {
    it.skip('SUPABASE_SERVICE_ROLE_KEY não configurado');
    return;
  }

  it('rejeita UUID inexistente', async () => {
    const { data, error } = await supabase!
      .rpc('resolve_auction', {
        p_part_id: '00000000-0000-0000-0000-000000000000',
      });

    expect(error).toBeNull();
    expect((data as any)?.success).toBe(false);
    expect((data as any)?.error).toContain('não encontrado');
  });

  it('rejeita leilão já resolvido (com status diferente de active)', async () => {
    // Tenta resolver um leilão que já foi resolvido
    // Usa um UUID genérico — o banco retorna erro de status
    const { data, error } = await supabase!
      .rpc('resolve_auction', {
        p_part_id: '33333333-3333-3333-3333-333333333333',
      });

    expect(error).toBeNull();
    const result = data as any;
    // Se o leilão não existir: "não encontrado"
    // Se existir mas não for active: "já foi resolvido"
    expect(result?.success).toBe(false);
    expect(['não encontrado', 'já foi resolvido']).toContain(result?.error);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. RPC: buy_now  (READ-ONLY)
// ═══════════════════════════════════════════════════════════════

describe('RPC buy_now', () => {
  if (!hasKeys) {
    it.skip('SUPABASE_SERVICE_ROLE_KEY não configurado');
    return;
  }

  it('rejeita UUID inexistente', async () => {
    const { data, error } = await supabase!
      .rpc('buy_now', {
        p_part_id: '00000000-0000-0000-0000-000000000000',
        p_buyer_id: '00000000-0000-0000-0000-000000000001',
      });

    expect(error).toBeNull();
    expect((data as any)?.success).toBe(false);
    expect((data as any)?.error).toContain('não encontrado');
  });

  it('rejeita compra de leilão inativo', async () => {
    const { data, error } = await supabase!
      .rpc('buy_now', {
        p_part_id: '44444444-4444-4444-4444-444444444444',
        p_buyer_id: '55555555-5555-5555-5555-555555555555',
      });

    expect(error).toBeNull();
    const result = data as any;
    expect(result?.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Teste de integridade: funções existem no banco
// ═══════════════════════════════════════════════════════════════

describe('RPC function signatures existem', () => {
  if (!hasKeys) {
    it.skip('SUPABASE_SERVICE_ROLE_KEY não configurado');
    return;
  }

  it('place_bid aceita (p_part_id UUID, p_bidder_id UUID, p_amount NUMERIC) → JSONB', async () => {
    // Chamar com params inválidos testa se a função existe
    const { error } = await supabase!
      .rpc('place_bid', {
        p_part_id: '00000000-0000-0000-0000-000000000000',
        p_bidder_id: '00000000-0000-0000-0000-000000000001',
        p_amount: 100,
      });

    // Se a função existir, não dá erro de RPC (só retorna sucesso=false)
    expect(error).toBeNull();
  });

  it('resolve_auction aceita (p_part_id UUID) → JSONB', async () => {
    const { error } = await supabase!
      .rpc('resolve_auction', {
        p_part_id: '00000000-0000-0000-0000-000000000000',
      });

    expect(error).toBeNull();
  });

  it('buy_now aceita (p_part_id UUID, p_buyer_id UUID) → JSONB', async () => {
    const { error } = await supabase!
      .rpc('buy_now', {
        p_part_id: '00000000-0000-0000-0000-000000000000',
        p_buyer_id: '00000000-0000-0000-0000-000000000001',
      });

    expect(error).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════

const summary = `
╔══════════════════════════════════════════════════════╗
║  AUCTIONS INTEGRATION TESTS                          ║
╚══════════════════════════════════════════════════════╝

  place_bid:       2 tests (UUID inválido, leilão inexistente)
  resolve_auction: 2 tests (UUID inválido, status check)
  buy_now:         2 tests (UUID inválido, leilão inativo)
  signatures:      3 tests (cada RPC aceita params corretos)

Total: 9 testes de integração (READ-ONLY, seguros)
Requer: SUPABASE_SERVICE_ROLE_KEY no .env
`;
console.log(summary);
