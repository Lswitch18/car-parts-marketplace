import { describe, it, expect } from 'vitest';

describe('Visualization3D Module - Math Helpers', () => {
  it('should convert degrees to radians correctly', () => {
    const degToRad = (degrees: number) => degrees * (Math.PI / 180);
    expect(degToRad(180)).toBeCloseTo(Math.PI);
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
  });
});
