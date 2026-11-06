import { describe, expect, test } from 'bun:test';
import { ParticipantEntity } from '#persistency/models/participant.entity';
import { toParticipantContract } from '../participant.mapper';

function entity(overrides: Partial<ParticipantEntity> = {}): ParticipantEntity {
  return Object.assign(new ParticipantEntity(), {
    id: 7,
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
    creationDate: new Date('2026-11-05T21:00:00.000Z'),
    ...overrides,
  });
}

describe('toParticipantContract', () => {
  test('maps every column to the public field', () => {
    expect(toParticipantContract(entity())).toEqual({
      id: 7,
      firstName: 'Ada',
      email: 'ada@example.com',
      phone: '5551234567',
      unitPicked: 'metric',
      weightInLbs: 154.32,
      weightInKilos: 70,
      heightInInches: 68.9,
      heightInMeters: 1.75,
      bmi: 22.86,
      birthday: '1996-11-05T00:00:00.000Z',
      creationDate: '2026-11-05T21:00:00.000Z',
    });
  });

  test('refuses a unit system it does not know', () => {
    expect(() => toParticipantContract(entity({ unitPicked: 'stone' }))).toThrow();
  });
});
