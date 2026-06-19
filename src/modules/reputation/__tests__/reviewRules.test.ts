import { describe, it, expect } from 'vitest';

describe('Reputation Module - Review Rules', () => {
  it('should flag reviews with inappropriate words', () => {
    const badWords = ['scam', 'fake', 'fraude'];
    const content = 'This is a scam and a fraude!';
    const isFlagged = badWords.some(word => content.toLowerCase().includes(word));
    
    expect(isFlagged).toBe(true);
  });

  it('should correctly calculate the average rating', () => {
    const reviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 4 }
    ];
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    expect(avg).toBeCloseTo(4.333, 2);
  });
});
