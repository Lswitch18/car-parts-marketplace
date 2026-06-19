import { describe, it, expect } from 'vitest';

describe('Backoffice Module - Dashboard Utils', () => {
  it('should calculate growth percentage', () => {
    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return 100;
      return ((current - previous) / previous) * 100;
    };

    expect(calcGrowth(150, 100)).toBe(50);
    expect(calcGrowth(100, 100)).toBe(0);
    expect(calcGrowth(50, 100)).toBe(-50);
  });
});
