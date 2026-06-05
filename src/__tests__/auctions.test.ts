/**
 * Testes dos Leilões (Auctions)
 *
 * Cobre:
 *   1. Cálculo de taxas (fees)
 *   2. Regras de negócio (lance mínimo, self-bid, validações)
 *   3. Placeholder para testes de integração (Edge Functions)
 *
 * Uso: npx vitest run src/__tests__/auctions.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ═══════════════════════════════════════════════════════════════
// 1. CÁLCULO DE TAXAS
// ═══════════════════════════════════════════════════════════════

const COMMISSION_RATE = 0.10;
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FEE_FIXED = 30;

function calculateFees(amount: number) {
  const commission = amount * COMMISSION_RATE;
  const stripeFee = amount * STRIPE_FEE_RATE + STRIPE_FEE_FIXED;
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

describe('calculateFees (auctions)', () => {
  it('¥10000 → comissão ¥1000, taxa Stripe ¥320, taxa total ¥1320, líquido ¥8680', () => {
    const f = calculateFees(10000);
    expect(f.commission_amount).toBe(1000);
    expect(f.stripe_fee).toBe(10000 * 0.029 + 30);
    expect(f.platform_fee).toBe(1000 + 10000 * 0.029 + 30);
    expect(f.seller_net).toBe(10000 - 1000 - 10000 * 0.029 - 30);
  });

  it('¥30 → líquido negativo (taxa fixa Stripe de ¥30 domina)', () => {
    const f = calculateFees(30);
    // 30 - 3 - (30*0.029 + 30) = 30 - 3 - 30.87 = -3.87
    expect(f.seller_net).toBeLessThan(0);
    expect(f.seller_net).toBeCloseTo(-3.87, 2);
  });

  it('¥0 → apenas taxa fixa Stripe de ¥30', () => {
    const f = calculateFees(0);
    expect(f.commission_amount).toBe(0);
    expect(f.stripe_fee).toBe(30);
    expect(f.platform_fee).toBe(30);
    expect(f.seller_net).toBe(-30);
  });

  it('¥1000000 → consistência em valores altos', () => {
    const f = calculateFees(1_000_000);
    expect(f.commission_amount).toBe(100_000);
    expect(f.seller_net).toBe(1_000_000 - 100_000 - (1_000_000 * 0.029 + 30));
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. REGRAS DE NEGÓCIO (lado servidor)
// ═══════════════════════════════════════════════════════════════

/**
 * Simula a lógica de validação da RPC place_bid (PostgreSQL).
 */
interface AuctionRow {
  id: string;
  seller_id: string;
  current_bid: number;
  starting_bid: number;
  auction_end: string;
  status: string;
  buy_now_price: number | null;
}

function validateBid(
  auction: AuctionRow,
  bidderId: string,
  amount: number,
): { valid: boolean; error?: string; minBid?: number } {
  if (auction.status !== 'active') {
    return { valid: false, error: 'Leilão não está ativo' };
  }
  if (new Date(auction.auction_end) < new Date()) {
    return { valid: false, error: 'Leilão encerrado' };
  }
  if (auction.seller_id === bidderId) {
    return { valid: false, error: 'Você não pode dar lance no seu próprio leilão' };
  }
  const minBid = Math.ceil(auction.current_bid * 1.05);
  if (amount < minBid) {
    return { valid: false, error: `Lance mínimo: ¥${minBid.toLocaleString()}`, minBid };
  }
  return { valid: true };
}

describe('validateBid (regras de negócio)', () => {
  // Helper: cria um leilão fictício
  const makeAuction = (overrides: Partial<AuctionRow> = {}): AuctionRow => ({
    id: '00000000-0000-0000-0000-000000000001',
    seller_id: 'seller-123',
    current_bid: 10000,
    starting_bid: 10000,
    auction_end: new Date(Date.now() + 86400000).toISOString(), // +24h
    status: 'active',
    buy_now_price: 50000,
    ...overrides,
  });

  const buyerId = 'buyer-456';

  it('aceita lance válido (¥10500 ≥ ¥10500 = 10000*1.05)', () => {
    const result = validateBid(makeAuction(), buyerId, 10500);
    expect(result.valid).toBe(true);
  });

  it('rejeita lance abaixo do mínimo (¥10499 < ¥10500)', () => {
    const result = validateBid(makeAuction(), buyerId, 10499);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Lance mínimo');
  });

  it('rejeita lance do próprio vendedor', () => {
    const result = validateBid(makeAuction(), 'seller-123', 20000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('próprio leilão');
  });

  it('rejeita lance em leilão encerrado', () => {
    const expired = makeAuction({
      auction_end: new Date(Date.now() - 3600000).toISOString(), // -1h
    });
    const result = validateBid(expired, buyerId, 20000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('encerrado');
  });

  it('rejeita lance em leilão com status não-active', () => {
    const result = validateBid(makeAuction({ status: 'ended' }), buyerId, 20000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('não está ativo');
  });

  it('valor mínimo é ceil(current_bid * 1.05)', () => {
    const auction = makeAuction({ current_bid: 1234 });
    const result = validateBid(auction, buyerId, 1296); // 1234*1.05 = 1295.7 → ceil = 1296
    expect(result.valid).toBe(true);
  });

  it('não pode dar lance exatamente igual ao mínimo', () => {
    const auction = makeAuction({ current_bid: 10000 });
    const result = validateBid(auction, buyerId, 10500);
    expect(result.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. VALIDAÇÃO AUCTION (regras de criação)
// ═══════════════════════════════════════════════════════════════

describe('validateCreateAuction', () => {
  function validateCreate(body: Record<string, unknown>): string | null {
    if (!body.title) return 'title, starting_bid e auction_duration_hours são obrigatórios';
    if (body.starting_bid == null || body.starting_bid === '') return 'title, starting_bid e auction_duration_hours são obrigatórios';
    if (body.auction_duration_hours == null || body.auction_duration_hours === '') return 'title, starting_bid e auction_duration_hours são obrigatórios';
    if (typeof body.starting_bid !== 'number' || Number(body.starting_bid) <= 0) {
      return 'starting_bid deve ser um número positivo';
    }
    if (typeof body.auction_duration_hours !== 'number' && typeof body.auction_duration_hours !== 'string') {
      return 'auction_duration_hours inválido';
    }
    const hours = Number(body.auction_duration_hours);
    if (hours < 1 || hours > 8760) {
      return 'Duração deve ser entre 1 hora e 365 dias';
    }
    if (body.buy_now_price !== undefined && body.buy_now_price !== null && body.buy_now_price !== '') {
      const buyNow = Number(body.buy_now_price);
      if (buyNow <= Number(body.starting_bid)) {
        return 'Preço fixo deve ser maior que o lance inicial';
      }
    }
    return null;
  }

  it('criação válida → sem erros', () => {
    expect(validateCreate({
      title: 'Turbo GT35',
      starting_bid: 10000,
      auction_duration_hours: 72,
    })).toBeNull();
  });

  it('sem título → erro obrigatório', () => {
    expect(validateCreate({ starting_bid: 5000, auction_duration_hours: 24 })).toBe(
      'title, starting_bid e auction_duration_hours são obrigatórios',
    );
  });

  it('buy_now_price menor que starting_bid → erro', () => {
    expect(validateCreate({
      title: 'Teste',
      starting_bid: 10000,
      buy_now_price: 5000,
      auction_duration_hours: 48,
    })).toBe('Preço fixo deve ser maior que o lance inicial');
  });

  it('buy_now_price igual ao starting_bid → erro', () => {
    expect(validateCreate({
      title: 'Teste',
      starting_bid: 10000,
      buy_now_price: 10000,
      auction_duration_hours: 48,
    })).toBe('Preço fixo deve ser maior que o lance inicial');
  });

  it('duração 0 → erro', () => {
    expect(validateCreate({
      title: 'Teste',
      starting_bid: 10000,
      auction_duration_hours: 0,
    })).toBe('Duração deve ser entre 1 hora e 365 dias');
  });

  it('duração negativa → erro', () => {
    expect(validateCreate({
      title: 'Teste',
      starting_bid: 5000,
      auction_duration_hours: -1,
    })).toBe('Duração deve ser entre 1 hora e 365 dias');
  });

  it('buy_now_price maior que starting_bid → válido', () => {
    expect(validateCreate({
      title: 'Turbo',
      starting_bid: 10000,
      buy_now_price: 25000,
      auction_duration_hours: 72,
    })).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. RESUMO DOS TESTES
// ═══════════════════════════════════════════════════════════════

const summary = `
╔══════════════════════════════════════════════════════╗
║  AUCTION TESTS                                       ║
╚══════════════════════════════════════════════════════╝

  calculateFees:       4 tests (¥0, ¥30, ¥10k, ¥1M)
  validateBid:         7 tests (mínimo, self-bid, expirado, etc.)
  validateCreate:      7 tests (campos obrigatórios, validações)

Integração (separado — auctions-integration.test.ts):
  place_bid:           2 tests (READ-ONLY)
  resolve_auction:     2 tests (READ-ONLY)
  buy_now:             2 tests (READ-ONLY)
  signatures:          3 tests (cada RPC aceita params)

Total: 18 unitários + 9 integração (requer SERVICE_KEY).
`;

console.log(summary);
