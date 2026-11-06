import type { ParticipantEntity } from '../../models/participant.entity';
import type { NewParticipant } from './types/new-participant.types';
import type { ParticipantPage } from './types/participant-page.types';
import type { ParticipantSearch } from './types/participant-search.types';

export abstract class ParticipantRepository {
  abstract create(participant: NewParticipant): Promise<ParticipantEntity>;
  abstract search(criteria: ParticipantSearch): Promise<ParticipantPage>;
}
