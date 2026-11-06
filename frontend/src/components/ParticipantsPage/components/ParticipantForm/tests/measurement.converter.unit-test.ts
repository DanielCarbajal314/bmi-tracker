import { describe, expect, it } from 'vitest';
import { convertHeight, convertWeight } from '../measurement.converter';

describe('convertWeight', () => {
  it('converts kilos to pounds and back, rounded to 2 decimals', () => {
    expect(convertWeight(70, 'metric', 'imperial')).toBe(154.32);
    expect(convertWeight(154.32, 'imperial', 'metric')).toBe(70);
  });

  it('leaves the value alone when the system does not change', () => {
    expect(convertWeight(70.123, 'metric', 'metric')).toBe(70.123);
  });
});

describe('convertHeight', () => {
  it('converts meters to inches and back, rounded to 2 decimals', () => {
    expect(convertHeight(1.75, 'metric', 'imperial')).toBe(68.9);
    expect(convertHeight(69, 'imperial', 'metric')).toBe(1.75);
  });

  it('leaves the value alone when the system does not change', () => {
    expect(convertHeight(1.755, 'imperial', 'imperial')).toBe(1.755);
  });
});
