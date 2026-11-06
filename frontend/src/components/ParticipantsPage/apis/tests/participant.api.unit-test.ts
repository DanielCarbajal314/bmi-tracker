import { describe, expect, it } from 'vitest';
import { stubFetch } from '@/test/stub-fetch';
import { buildPage, buildParticipant } from '../../tests/participant.fixture';
import { createParticipant, listParticipants } from '../participant.api';

describe('createParticipant', () => {
  it('posts the input to /api/participants and returns the stored participant', async () => {
    const input = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '5551234567',
      unitPicked: 'metric',
      weight: 70,
      height: 1.75,
      age: 30,
    } as const;
    const fetchMock = stubFetch(() => ({ status: 201, body: buildParticipant({ id: 9 }) }));

    const participant = await createParticipant(input);

    expect(participant.id).toBe(9);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/participants');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(input);
  });
});

describe('listParticipants', () => {
  it('sends only the params that are set', async () => {
    const fetchMock = stubFetch(() => ({ body: buildPage([buildParticipant()]) }));

    await listParticipants({ minBmi: 20, page: 2, limit: 10 });

    const [url] = fetchMock.mock.calls[0] ?? [];
    const search = new URL(String(url), 'http://localhost').searchParams;
    expect(Object.fromEntries(search)).toEqual({ minBmi: '20', page: '2', limit: '10' });
  });

  it('returns the validated page', async () => {
    stubFetch(() => ({ body: buildPage([buildParticipant(), buildParticipant({ id: 2 })]) }));

    const page = await listParticipants({ page: 1, limit: 10 });

    expect(page.items.map((item) => item.id)).toEqual([1, 2]);
  });

  it('rejects a page that breaks the contract', async () => {
    stubFetch(() => ({ body: { items: [{ id: 'one' }] } }));

    await expect(listParticipants({ page: 1, limit: 10 })).rejects.toThrow();
  });
});
