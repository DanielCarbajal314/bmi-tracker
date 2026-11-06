import { describe, expect, test } from 'bun:test';
import { EnvSchema } from '../env.schema';

const required = {
  DB_HOST: 'database',
  DB_USER: 'bmi',
  DB_PASSWORD: 'secret',
  DB_NAME: 'bmi',
};

describe('EnvSchema', () => {
  test('fills the defaults', () => {
    expect(EnvSchema.parse(required)).toEqual({
      ...required,
      NODE_ENV: 'development',
      PORT: 3000,
      DB_PORT: 5432,
      DB_SSL: false,
      CORS_ORIGINS: [],
    });
  });

  test('splits CORS_ORIGINS on commas and drops blanks', () => {
    const env = EnvSchema.parse({ ...required, CORS_ORIGINS: ' https://a.example , https://b.example,' });

    expect(env.CORS_ORIGINS).toEqual(['https://a.example', 'https://b.example']);
  });

  test('reads numbers and booleans from strings', () => {
    const env = EnvSchema.parse({ ...required, PORT: '4000', DB_PORT: '6543', DB_SSL: 'true' });

    expect(env).toMatchObject({ PORT: 4000, DB_PORT: 6543, DB_SSL: true });
  });

  test.each(['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'])('requires %s', (name) => {
    const { [name]: _removed, ...rest } = required as Record<string, string>;

    expect(EnvSchema.safeParse(rest).success).toBe(false);
  });

  test('rejects a DB_SSL that is not a boolean', () => {
    expect(EnvSchema.safeParse({ ...required, DB_SSL: 'maybe' }).success).toBe(false);
  });
});
