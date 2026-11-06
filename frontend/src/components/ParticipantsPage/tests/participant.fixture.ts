import type { Participant, ParticipantPage } from '../apis/participant.contract';

// Typed with the contract the client validates, so a fixture cannot drift from it.
export function buildParticipant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: 1,
    firstName: 'Ada',
    email: 'ada@example.com',
    phone: '+1 555 123 4567',
    unitPicked: 'metric',
    weightInLbs: 154.32,
    weightInKilos: 70,
    heightInInches: 68.9,
    heightInMeters: 1.75,
    bmi: 22.86,
    birthday: '1996-11-05T00:00:00.000Z',
    creationDate: '2026-11-05T21:00:00.000Z',
    ...overrides,
  };
}

export function buildPage(
  items: Participant[],
  overrides: Partial<ParticipantPage> = {},
): ParticipantPage {
  return {
    items,
    total: items.length,
    page: 1,
    limit: 10,
    totalPages: items.length === 0 ? 0 : 1,
    ...overrides,
  };
}
