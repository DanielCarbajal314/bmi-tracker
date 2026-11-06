import { describe, expect, test } from 'bun:test';
import { birthdayFromAge } from '../birthday.calculator';

describe('birthdayFromAge', () => {
  const today = new Date('2026-11-05T15:30:00.000Z');

  test('goes back `age` years to the same day, at midnight UTC', () => {
    expect(birthdayFromAge(30, today).toISOString()).toBe('1996-11-05T00:00:00.000Z');
  });

  test('age 0 is today at midnight UTC', () => {
    expect(birthdayFromAge(0, today).toISOString()).toBe('2026-11-05T00:00:00.000Z');
  });
});
