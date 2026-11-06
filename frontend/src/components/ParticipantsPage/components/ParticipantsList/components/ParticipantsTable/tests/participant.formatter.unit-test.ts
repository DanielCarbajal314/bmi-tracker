import { describe, expect, it } from 'vitest';
import { formatBmi, formatDate, formatMeasure } from '../participant.formatter';

describe('participant formatter', () => {
  it('shows weight and height with two decimals', () => {
    expect(formatMeasure(85)).toBe('85.00');
    expect(formatMeasure(154.3)).toBe('154.30');
  });

  it('rounds the BMI to one decimal', () => {
    expect(formatBmi(20.49)).toBe('20.5');
    expect(formatBmi(27.98)).toBe('28.0');
  });

  it('formats date and time in the timezone of the test run (UTC, see test setup)', () => {
    expect(formatDate('2026-11-05T21:00:00.000Z')).toBe('11/5/2026, 9:00:00 PM');
  });
});
