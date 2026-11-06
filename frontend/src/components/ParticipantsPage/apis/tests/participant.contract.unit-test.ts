import { describe, expect, it } from 'vitest';
import { buildPage, buildParticipant } from '../../tests/participant.fixture';
import {
  CreateParticipantSchema,
  ParticipantPageSchema,
  ParticipantSchema,
} from '../participant.contract';

const valid = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 123 4567',
  unitPicked: 'metric',
  weight: 70,
  height: 1.75,
  age: 30,
};

function issuesOf(input: unknown): { path: string; message: string }[] {
  const result = CreateParticipantSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

describe('CreateParticipantSchema', () => {
  it('accepts a valid payload', () => {
    expect(CreateParticipantSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ['firstName', { firstName: '' }],
    ['lastName', { lastName: '   ' }],
    ['email', { email: 'nope' }],
    ['phone', { phone: 'abc' }],
    ['weight', { weight: Number.NaN }],
    ['height', { height: -1 }],
    ['age', { age: 30.5 }],
    ['age', { age: 121 }],
  ])('rejects an invalid %s', (field, override) => {
    expect(issuesOf({ ...valid, ...override }).map((issue) => issue.path)).toContain(field);
  });

  it('names the allowed range in the unit of the chosen system', () => {
    expect(issuesOf({ ...valid, weight: 5000 })).toEqual([
      { path: 'weight', message: 'Must be between 1 and 700 kg' },
    ]);
    expect(issuesOf({ ...valid, unitPicked: 'imperial', weight: 154, height: 1.75 })).toEqual([
      { path: 'height', message: 'Must be between 10 and 120 in' },
    ]);
  });

  it('accepts imperial values within range', () => {
    const input = { ...valid, unitPicked: 'imperial', weight: 154.3, height: 69 };
    expect(CreateParticipantSchema.safeParse(input).success).toBe(true);
  });
});

describe('response schemas', () => {
  it('accept what the backend sends', () => {
    expect(ParticipantSchema.safeParse(buildParticipant()).success).toBe(true);
    expect(ParticipantPageSchema.safeParse(buildPage([buildParticipant()])).success).toBe(true);
  });

  it('reject a participant with an unknown unit system', () => {
    expect(
      ParticipantSchema.safeParse({ ...buildParticipant(), unitPicked: 'stone' }).success,
    ).toBe(false);
  });
});
