import type { INestApplication } from '@nestjs/common';

export type TestResponse = {
  status: number;
  body: unknown;
};

export type TestApp = {
  app: INestApplication;
  // The body is not typed: validate it against a contract with `bodyOf`.
  request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<TestResponse>;
  query(sql: string): Promise<Record<string, unknown>[]>;
  // Empties every table except the migration history and restarts the ids.
  reset(): Promise<void>;
  close(): Promise<void>;
};
