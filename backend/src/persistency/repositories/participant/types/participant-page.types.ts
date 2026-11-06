import type { ParticipantEntity } from '../../../models/participant.entity';

export type ParticipantPage = {
  items: ParticipantEntity[];
  total: number;
};
