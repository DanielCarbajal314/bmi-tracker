import { describe, expect, it } from 'vitest';
import { buildParticipant } from '../../../../../tests/participant.fixture';
import { formatDate, formatHeight, formatWeight } from '../participant.formatter';

describe('participant formatter', () => {
  it('shows a metric participant in kg and m', () => {
    const participant = buildParticipant({ unitPicked: 'metric' });

    expect(formatWeight(participant)).toBe('70 kg');
    expect(formatHeight(participant)).toBe('1.75 m');
  });

  it('shows an imperial participant in lb and in', () => {
    const participant = buildParticipant({
      unitPicked: 'imperial',
      weightInLbs: 154.3,
      heightInInches: 69,
    });

    expect(formatWeight(participant)).toBe('154.3 lb');
    expect(formatHeight(participant)).toBe('69 in');
  });

  it('formats the date in UTC', () => {
    expect(formatDate('2026-11-05T21:00:00.000Z')).toBe('Nov 5, 2026');
  });
});
