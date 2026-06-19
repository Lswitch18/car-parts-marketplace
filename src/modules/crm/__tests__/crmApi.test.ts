import { describe, it, expect } from 'vitest';

describe('CRM Module - Logic', () => {
  it('should categorize B2B and B2C correctly', () => {
    const isB2B = (cnpj: string | null) => cnpj !== null && cnpj.length === 14;
    expect(isB2B('12345678901234')).toBe(true);
    expect(isB2B(null)).toBe(false);
  });
});
