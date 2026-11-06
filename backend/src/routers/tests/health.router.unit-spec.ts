import { describe, expect, test } from 'bun:test';
import { ServiceUnavailableException } from '@nestjs/common';
import { DatabaseProbe } from '#persistency/probes/database/database.probe';
import { HealthRouter } from '../health.router';

// A database that cannot be reached: the one status the integration suite cannot provoke.
class UnreachableDatabaseProbe extends DatabaseProbe {
  ping(): Promise<void> {
    return Promise.reject(new Error('connection refused'));
  }
}

describe('HealthRouter', () => {
  test('answers 503 when the database does not respond', async () => {
    const router = new HealthRouter(new UnreachableDatabaseProbe());

    const error = await router.check().catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(ServiceUnavailableException);
  });
});
