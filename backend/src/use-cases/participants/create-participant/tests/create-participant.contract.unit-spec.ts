import { describe, expect, test } from 'bun:test';
import { CreateParticipantSchema } from '../create-participant.contract';

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

function failingPaths(input: unknown): string[] {
  const result = CreateParticipantSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('CreateParticipantSchema', () => {
  test('accepts a valid payload', () => {
    expect(CreateParticipantSchema.safeParse(valid).success).toBe(true);
  });

  test('trims names', () => {
    const result = CreateParticipantSchema.parse({ ...valid, firstName: '  Ada ' });
    expect(result.firstName).toBe('Ada');
  });

  test.each([
    ['firstName', { firstName: '' }],
    ['lastName', { lastName: undefined }],
    ['email', { email: 'not-an-email' }],
    ['phone', { phone: 'abc' }],
    ['unitPicked', { unitPicked: 'stone' }],
    ['weight', { weight: -1 }],
    ['height', { height: 0 }],
    ['age', { age: 121 }],
    ['age', { age: 30.5 }],
  ])('rejects an invalid %s', (field, override) => {
    expect(failingPaths({ ...valid, ...override })).toContain(field);
  });

  test('rejects a weight outside the metric range', () => {
    expect(failingPaths({ ...valid, weight: 5000 })).toEqual(['weight']);
  });

  test('rejects metric values entered under the imperial system', () => {
    expect(failingPaths({ ...valid, unitPicked: 'imperial', weight: 70, height: 1.75 })).toEqual([
      'height',
    ]);
  });

  test('accepts imperial values within range', () => {
    const input = { ...valid, unitPicked: 'imperial', weight: 154.3, height: 69 };
    expect(CreateParticipantSchema.safeParse(input).success).toBe(true);
  });
});
