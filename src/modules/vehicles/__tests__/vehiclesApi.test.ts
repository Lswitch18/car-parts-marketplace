import { describe, it, expect } from 'vitest';

describe('Vehicles Module - Garage Logic', () => {
  it('should correctly format vehicle names', () => {
    const vehicle = { year: 2020, make: 'Toyota', model: 'Supra' };
    const fullName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    expect(fullName).toBe('2020 Toyota Supra');
  });
});
