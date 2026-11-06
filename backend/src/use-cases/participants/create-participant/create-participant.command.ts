import { Command } from '@nestjs/cqrs';
import type { ParticipantContract } from '../participant.contract';
import type { CreateParticipantInput } from './create-participant.contract';

// The result type rides on the message, so the bus answers with a typed value.
export class CreateParticipantCommand extends Command<ParticipantContract> {
  constructor(public readonly input: CreateParticipantInput) {
    super();
  }
}
