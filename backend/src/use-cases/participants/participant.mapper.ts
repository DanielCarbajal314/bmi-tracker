import type { ParticipantEntity } from '#persistency/models/participant.entity';
import { type ParticipantContract, UnitSystemSchema } from './participant.contract';

// The only place an entity becomes the public contract.
export function toParticipantContract(entity: ParticipantEntity): ParticipantContract {
  return {
    id: entity.id,
    firstName: entity.firstName,
    email: entity.email,
    phone: entity.phone,
    unitPicked: UnitSystemSchema.parse(entity.unitPicked),
    weightInLbs: entity.weightInLibs,
    weightInKilos: entity.weightInKilos,
    heightInInches: entity.heightInInches,
    heightInMeters: entity.heigntInMeters,
    bmi: entity.bmi,
    birthday: entity.birthday.toISOString(),
    creationDate: entity.creationDate.toISOString(),
  };
}
