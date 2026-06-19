import { describe, it, expect } from 'vitest';

describe('Shared Module - Redis Cache Dummy', () => {
  it('should format redis key safely', () => {
    const key = 'catalog:page=1&limit=50';
    const encoded = encodeURIComponent(key);
    expect(encoded).toBe('catalog%3Apage%3D1%26limit%3D50');
  });
});
