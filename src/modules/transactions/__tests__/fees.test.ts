import { describe, it, expect } from 'vitest';
import { calculateFees, COMMISSION_RATE, STRIPE_FEE_RATE, STRIPE_FEE_FIXED } from '@/modules/transactions/api/fees';

describe('calculateFees', () => {
  it('calcula fees corretamente para ¥10000', () => {
    const result = calculateFees(10000);

    expect(result.gross_amount).toBe(10000);
    expect(result.commission_amount).toBe(600);
    expect(result.stripe_fee).toBe(10000 * STRIPE_FEE_RATE + STRIPE_FEE_FIXED);
    expect(result.platform_fee).toBe(result.commission_amount + result.stripe_fee);
    expect(result.seller_net).toBe(10000 - result.platform_fee);
  });

  it('calcula fees corretamente para ¥0', () => {
    const result = calculateFees(0);
    expect(result.gross_amount).toBe(0);
    expect(result.commission_amount).toBe(0);
    expect(result.stripe_fee).toBe(STRIPE_FEE_FIXED);
    expect(result.platform_fee).toBe(STRIPE_FEE_FIXED);
    expect(result.seller_net).toBe(-STRIPE_FEE_FIXED);
  });

  it('calcula fees corretamente para valor pequeno ¥500', () => {
    const result = calculateFees(500);
    expect(result.commission_amount).toBe(30);
    expect(result.seller_net).toBe(500 - 30 - (500 * STRIPE_FEE_RATE + STRIPE_FEE_FIXED));
  });

  it('commission_rate é 6%', () => {
    expect(COMMISSION_RATE).toBe(0.06);
  });

  it('stripe fee rate é 2.9% + ¥30', () => {
    expect(STRIPE_FEE_RATE).toBe(0.029);
    expect(STRIPE_FEE_FIXED).toBe(30);
  });
});
