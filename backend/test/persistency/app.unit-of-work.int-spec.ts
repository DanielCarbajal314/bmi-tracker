import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { AppUnitOfWork } from '#persistency/transactions/app/app.unit-of-work';
import { rejectionOf } from '../support/rejection';
import { startTestApp } from '../support/test-app';
import type { TestApp } from '../support/types/test-app.types';

const draft = {
  firstName: 'Ada',
  email: 'ada@example.com',
  phone: '5551234567',
  unitPicked: 'metric',
  weightInLibs: 154.32,
  weightInKilos: 70,
  heightInInches: 68.9,
  heigntInMeters: 1.75,
  bmi: 22.86,
  birthday: new Date('1996-11-05T00:00:00.000Z'),
};

let testApp: TestApp;
let unitOfWork: AppUnitOfWork;

const countRows = async () => (await testApp.query('SELECT 1 FROM participants')).length;

beforeAll(async () => {
  testApp = await startTestApp();
  unitOfWork = testApp.app.get(AppUnitOfWork, { strict: false });
});

beforeEach(async () => {
  await testApp.reset();
});

afterAll(async () => {
  await testApp.close();
});

describe('AppUnitOfWork.execute', () => {
  test('commits what the work wrote', async () => {
    await unitOfWork.execute(({ participants }) => participants.create(draft));

    expect(await countRows()).toBe(1);
  });

  test('rolls back every write when the work throws', async () => {
    const failing = unitOfWork.execute(async ({ participants }) => {
      await participants.create(draft);
      await participants.create({ ...draft, email: 'second@example.com' });
      throw new Error('boom');
    });

    expect(await rejectionOf(failing)).toMatchObject({ message: 'boom' });
    expect(await countRows()).toBe(0);
  });

  test('a nested execute joins the outer transaction', async () => {
    const failing = unitOfWork.execute(async ({ participants }) => {
      await participants.create(draft);
      await unitOfWork.execute(({ participants: inner }) =>
        inner.create({ ...draft, email: 'inner@example.com' }),
      );
      throw new Error('boom');
    });

    expect(await rejectionOf(failing)).toMatchObject({ message: 'boom' });
    expect(await countRows()).toBe(0);
  });

  test('a rolled-back transaction does not affect the next one', async () => {
    const failing = unitOfWork.execute(async ({ participants }) => {
      await participants.create(draft);
      throw new Error('boom');
    });
    expect(await rejectionOf(failing)).toMatchObject({ message: 'boom' });

    await unitOfWork.execute(({ participants }) => participants.create(draft));

    expect(await countRows()).toBe(1);
  });
});
