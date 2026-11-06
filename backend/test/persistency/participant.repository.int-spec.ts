import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { ParticipantRepository } from '#persistency/repositories/participant/participant.repository';
import type { NewParticipant } from '#persistency/repositories/participant/types/new-participant.types';
import { startTestApp } from '../support/test-app';
import type { TestApp } from '../support/types/test-app.types';

const draft: NewParticipant = {
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

const withBmi = (bmi: number): NewParticipant => ({ ...draft, bmi });

let testApp: TestApp;
let participants: ParticipantRepository;

const emails = (items: { email: string }[]) => items.map((item) => item.email);

beforeAll(async () => {
  testApp = await startTestApp();
  participants = testApp.app.get(ParticipantRepository, { strict: false });
});

beforeEach(async () => {
  await testApp.reset();
});

afterAll(async () => {
  await testApp.close();
});

describe('ParticipantRepository.create', () => {
  test('returns the row with the values the database generates', async () => {
    const stored = await participants.create(draft);

    expect(stored.id).toBe(1);
    expect(stored.creationDate).toBeInstanceOf(Date);
    expect(stored).toMatchObject({ firstName: 'Ada', email: 'ada@example.com', bmi: 22.86 });
  });
});

describe('ParticipantRepository.search', () => {
  test('lists the newest first', async () => {
    await participants.create({ ...draft, email: 'first@example.com' });
    await participants.create({ ...draft, email: 'second@example.com' });

    const { items } = await participants.search({ offset: 0, limit: 10 });

    expect(emails(items)).toEqual(['second@example.com', 'first@example.com']);
  });

  test('breaks a tie on the creation time with the id, highest first', async () => {
    await testApp.query(`
      INSERT INTO participants (first_name, email, phone, unit_picked, weight_in_libs,
        height_in_inches, weight_in_kilos, heignt_in_meters, bmi, birthday, creation_date)
      VALUES
        ('a', 'low@example.com', '5551234567', 'metric', 1, 1, 1, 1, 1, '2000-01-01', '2026-01-01T00:00:00Z'),
        ('b', 'high@example.com', '5551234567', 'metric', 1, 1, 1, 1, 1, '2000-01-01', '2026-01-01T00:00:00Z')`);

    const { items } = await participants.search({ offset: 0, limit: 10 });

    expect(emails(items)).toEqual(['high@example.com', 'low@example.com']);
  });

  test('filters by BMI with the bounds included', async () => {
    for (const bmi of [18, 25, 32]) await participants.create(withBmi(bmi));

    const bmisFor = async (minBmi?: number, maxBmi?: number) =>
      (await participants.search({ minBmi, maxBmi, offset: 0, limit: 10 })).items.map(
        (item) => item.bmi,
      );

    expect(await bmisFor(18, 25)).toEqual([25, 18]);
    expect(await bmisFor(26, undefined)).toEqual([32]);
    expect(await bmisFor(undefined, 24)).toEqual([18]);
  });

  test('applies offset and limit, and counts every match in total', async () => {
    for (const bmi of [18, 25, 32]) await participants.create(withBmi(bmi));

    const page = await participants.search({ minBmi: 20, offset: 1, limit: 1 });

    expect(page.items.map((item) => item.bmi)).toEqual([25]);
    expect(page.total).toBe(2);
  });
});
