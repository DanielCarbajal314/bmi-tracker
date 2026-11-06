import { Query } from '@nestjs/cqrs';
import type { ListParticipantsInput, ParticipantPageContract } from './list-participants.contract';

export class ListParticipantsQuery extends Query<ParticipantPageContract> {
  constructor(public readonly input: ListParticipantsInput) {
    super();
  }
}
