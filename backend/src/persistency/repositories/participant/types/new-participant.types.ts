import type { ParticipantEntity } from '../../../models/participant.entity';

export type NewParticipant = Omit<ParticipantEntity, 'id' | 'creationDate'>;
