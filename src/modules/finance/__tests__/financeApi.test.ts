import { describe, it, expect } from 'vitest';

describe('Finance Module - Accounts Payable', () => {
  it('should calculate total due from payable items', () => {
    const items = [
      { id: 1, amount: 100.50, status: 'pending' },
      { id: 2, amount: 200.00, status: 'paid' },
      { id: 3, amount: 50.25, status: 'pending' }
    ];

    const totalPending = items
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + i.amount, 0);

    expect(totalPending).toBe(150.75);
  });
});
