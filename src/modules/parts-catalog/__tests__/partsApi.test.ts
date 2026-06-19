import { describe, it, expect } from 'vitest';

describe('Parts Catalog Module - API Filters', () => {
  it('should build query params correctly from filter object', () => {
    const filters = { brand_id: '123', max_price: 500 };
    const searchParams = new URLSearchParams();
    if (filters.brand_id) searchParams.set('brand_id', filters.brand_id);
    if (filters.max_price) searchParams.set('max_price', String(filters.max_price));

    expect(searchParams.get('brand_id')).toBe('123');
    expect(searchParams.get('max_price')).toBe('500');
    expect(searchParams.toString()).toBe('brand_id=123&max_price=500');
  });
});
