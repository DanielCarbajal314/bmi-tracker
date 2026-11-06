import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { startTestApp } from '../support/test-app';
import type { TestApp } from '../support/types/test-app.types';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await startTestApp();
});

afterAll(async () => {
  await testApp.close();
});

describe('GET /health', () => {
  test('answers 200 while the database responds', async () => {
    const response = await testApp.request('GET', '/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
