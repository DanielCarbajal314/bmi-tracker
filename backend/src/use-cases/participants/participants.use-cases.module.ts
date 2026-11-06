import { Module } from '@nestjs/common';
import { CreateParticipantHandler } from './create-participant/create-participant.handler';
import { ListParticipantsHandler } from './list-participants/list-participants.handler';

@Module({ providers: [CreateParticipantHandler, ListParticipantsHandler] })
export class ParticipantsUseCasesModule {}
