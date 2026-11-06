import { describe, expect, test } from 'bun:test';
import { ServiceUnavailableException } from '@nestjs/common';
import { DatabaseCheck } from '#persistency/checks/database/database.check';
import { HealthRouter } from '../health.router';

// A database that cannot be reached: the one status the integration suite cannot provoke.
class UnreachableDatabaseCheck extends DatabaseCheck {
  ping(): Promise<void> {
    return Promise.reject(new Error('connection refused'));
  }
}

describe('HealthRouter', () => {
  test('answers 503 when the database does not respond', async () => {
    const router = new HealthRouter(new UnreachableDatabaseCheck());

    const error = await router.check().catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(ServiceUnavailableException);
  });
});
