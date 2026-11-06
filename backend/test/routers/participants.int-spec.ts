import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { z } from 'zod';
import { ParticipantPageSchema } from '#use-cases/participants/list-participants/list-participants.contract';
import { ParticipantSchema } from '#use-cases/participants/participant.contract';
import { bodyOf, invalidFields } from '../support/http';
import { startTestApp } from '../support/test-app';
import type { TestApp } from '../support/types/test-app.types';

const imperialBody = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 123 4567',
  unitPicked: 'imperial',
  weight: 154.3,
  height: 69,
  age: 30,
};

const metricBody = {
  ...imperialBody,
  firstName: 'Grace',
  email: 'grace@example.com',
  unitPicked: 'metric',
  weight: 70,
  height: 1.75,
  age: 45,
};

// Height 1 m, so the BMI equals the weight in kg.
const withBmi = (bmi: number) => ({ ...metricBody, weight: bmi, height: 1 });

let testApp: TestApp;

const post = (body: unknown) => testApp.request('POST', '/participants', body);
const list = async (queryString = '') =>
  bodyOf(await testApp.request('GET', `/participants${queryString}`), ParticipantPageSchema);
const bmis = (page: { items: { bmi: number }[] }) => page.items.map((item) => item.bmi);

beforeAll(async () => {
  testApp = await startTestApp();
});

beforeEach(async () => {
  await testApp.reset();
});

afterAll(async () => {
  await testApp.close();
});

describe('POST /participants', () => {
  test('201: stores an imperial participant and returns the calculated values', async () => {
    const response = await post(imperialBody);

    expect(response.status).toBe(201);
    const body = bodyOf(response, ParticipantSchema);
    expect(body).toMatchObject({
      id: 1,
      firstName: 'Ada',
      email: 'ada@example.com',
      unitPicked: 'imperial',
      weightInLbs: 154.3,
      weightInKilos: 69.99,
      heightInInches: 69,
      heightInMeters: 1.75,
      bmi: 22.78,
    });
    expect(Number.isNaN(Date.parse(body.creationDate))).toBe(false);
  });

  test('201: stores a metric participant and derives the imperial values', async () => {
    const response = await post(metricBody);

    expect(response.status).toBe(201);
    expect(bodyOf(response, ParticipantSchema)).toMatchObject({
      unitPicked: 'metric',
      weightInLbs: 154.32,
      weightInKilos: 70,
      heightInInches: 68.9,
      heightInMeters: 1.75,
      bmi: 22.86,
    });
  });

  test('writes every column of the row', async () => {
    await post(metricBody);

    const [row] = await testApp.query(`
      SELECT first_name, email, phone, unit_picked, weight_in_libs, height_in_inches,
             weight_in_kilos, heignt_in_meters, bmi, birthday, creation_date
      FROM participants`);

    expect(row).toMatchObject({
      first_name: 'Grace',
      email: 'grace@example.com',
      phone: '+1 555 123 4567',
      unit_picked: 'metric',
      weight_in_libs: 154.32,
      height_in_inches: 68.9,
      weight_in_kilos: 70,
      heignt_in_meters: 1.75,
      bmi: 22.86,
    });
    const { birthday, creation_date } = z.object({ birthday: z.date(), creation_date: z.date() }).parse(row);
    expect(creation_date).toBeInstanceOf(Date);
    expect(birthday.getUTCFullYear()).toBe(new Date().getUTCFullYear() - 45);
  });

  test('assigns increasing ids', async () => {
    const first = bodyOf(await post(imperialBody), ParticipantSchema);
    const second = bodyOf(await post(metricBody), ParticipantSchema);

    expect([first.id, second.id]).toEqual([1, 2]);
  });

  test('400: lists every invalid field and stores nothing', async () => {
    const response = await post({
      firstName: '',
      email: 'nope',
      unitPicked: 'metric',
      weight: 70,
      height: 1.75,
      age: -1,
    });

    expect(response.status).toBe(400);
    const fields = invalidFields(response);
    for (const field of ['firstName', 'lastName', 'email', 'phone', 'age']) {
      expect(fields).toContain(field);
    }
    expect(await testApp.query('SELECT 1 FROM participants')).toHaveLength(0);
  });

  test('400: rejects values that do not fit the chosen unit system', async () => {
    const response = await post({ ...imperialBody, height: 1.75 });

    expect(response.status).toBe(400);
    expect(invalidFields(response)).toEqual(['height']);
  });
});

describe('GET /participants', () => {
  test('200: empty page when nothing is stored', async () => {
    const response = await testApp.request('GET', '/participants');

    expect(response.status).toBe(200);
    expect(bodyOf(response, ParticipantPageSchema)).toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
  });

  test('lists newest first', async () => {
    await post(withBmi(18));
    await post(withBmi(25));
    await post(withBmi(32));

    const page = await list();

    expect(bmis(page)).toEqual([32, 25, 18]);
    expect(page.total).toBe(3);
  });

  test('paginates', async () => {
    for (const bmi of [18, 25, 32]) await post(withBmi(bmi));

    const page = await list('?page=2&limit=2');

    expect(bmis(page)).toEqual([18]);
    expect(page).toMatchObject({ total: 3, page: 2, limit: 2, totalPages: 2 });
  });

  test('filters by minimum and maximum BMI, bounds included', async () => {
    for (const bmi of [18, 25, 32]) await post(withBmi(bmi));

    expect(bmis(await list('?minBmi=18&maxBmi=25'))).toEqual([25, 18]);
    expect(bmis(await list('?minBmi=26'))).toEqual([32]);
    expect(bmis(await list('?maxBmi=24'))).toEqual([18]);
  });

  test('total counts every match, not only the page', async () => {
    for (const bmi of [18, 25, 32]) await post(withBmi(bmi));

    const page = await list('?minBmi=20&limit=1');

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(2);
    expect(page.totalPages).toBe(2);
  });

  test.each([
    ['minBmi greater than maxBmi', '?minBmi=30&maxBmi=20'],
    ['limit above 100', '?limit=101'],
    ['page 0', '?page=0'],
    ['a non-numeric BMI', '?minBmi=abc'],
  ])('400: %s', async (_name, queryString) => {
    const { status } = await testApp.request('GET', `/participants${queryString}`);

    expect(status).toBe(400);
  });
});
