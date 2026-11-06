import type { Participant } from '../../../../apis/participant.contract';
import { UNIT_SYSTEMS } from '../../../../constants/unit-systems';

// Weight and height as the participant entered them, in the unit system they picked.
export function formatWeight(participant: Participant): string {
  const { weightUnit } = UNIT_SYSTEMS[participant.unitPicked];
  const value =
    participant.unitPicked === 'imperial' ? participant.weightInLbs : participant.weightInKilos;
  return `${value} ${weightUnit}`;
}

export function formatHeight(participant: Participant): string {
  const { heightUnit } = UNIT_SYSTEMS[participant.unitPicked];
  const value =
    participant.unitPicked === 'imperial' ? participant.heightInInches : participant.heightInMeters;
  return `${value} ${heightUnit}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
}
