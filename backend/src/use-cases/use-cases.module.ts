import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ParticipantsUseCasesModule } from './participants/participants.use-cases.module';

@Module({ imports: [CqrsModule.forRoot(), ParticipantsUseCasesModule] })
export class UseCasesModule {}
