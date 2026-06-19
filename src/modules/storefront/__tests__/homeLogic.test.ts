import { describe, it, expect } from 'vitest';

describe('Storefront Module - Home Logic', () => {
  it('should return featured brands', () => {
    const brands = ['Toyota', 'Nissan', 'Honda', 'Subaru', 'Mazda'];
    const featured = brands.slice(0, 3);
    expect(featured).toHaveLength(3);
    expect(featured).toContain('Toyota');
  });
});
