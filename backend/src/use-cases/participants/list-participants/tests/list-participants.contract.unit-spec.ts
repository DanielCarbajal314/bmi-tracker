import { describe, expect, test } from 'bun:test';
import { ListParticipantsSchema } from '../list-participants.contract';

describe('ListParticipantsSchema', () => {
  test('defaults to page 1, 20 per page, no BMI filter', () => {
    expect(ListParticipantsSchema.parse({})).toEqual({ page: 1, limit: 20 });
  });

  test('coerces query strings to numbers', () => {
    const parsed = ListParticipantsSchema.parse({
      minBmi: '18.5',
      maxBmi: '24.9',
      page: '2',
      limit: '5',
    });
    expect(parsed).toEqual({ minBmi: 18.5, maxBmi: 24.9, page: 2, limit: 5 });
  });

  test('accepts equal min and max', () => {
    expect(ListParticipantsSchema.safeParse({ minBmi: '25', maxBmi: '25' }).success).toBe(true);
  });

  test('rejects minBmi greater than maxBmi', () => {
    expect(ListParticipantsSchema.safeParse({ minBmi: '30', maxBmi: '20' }).success).toBe(false);
  });

  test.each([
    { page: '0' },
    { limit: '0' },
    { limit: '101' },
    { minBmi: '-1' },
    { minBmi: 'abc' },
  ])('rejects %o', (query) => {
    expect(ListParticipantsSchema.safeParse(query).success).toBe(false);
  });
});
