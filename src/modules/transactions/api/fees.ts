export const COMMISSION_RATE = 0.074;
export const STRIPE_FEE_RATE = 0.029;
export const STRIPE_FEE_FIXED = 30;
export const CURRENCY = 'jpy';

export interface FeeBreakdown {
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  stripe_fee: number;
  platform_fee: number;
  seller_net: number;
}

export function calculateFees(amount: number): FeeBreakdown {
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

export function formatJPY(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function formatBRL(amount: number): string {
  return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}
