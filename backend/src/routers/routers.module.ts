import { Module } from '@nestjs/common';
import { HealthRouter } from './health.router';
import { ParticipantsRouter } from './participants.router';

@Module({ controllers: [HealthRouter, ParticipantsRouter] })
export class RoutersModule {}
