import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import { CreateParticipantCommand } from '#use-cases/participants/create-participant/create-participant.command';
import { CreateParticipantSchema } from '#use-cases/participants/create-participant/create-participant.contract';
import {
  ListParticipantsSchema,
  type ParticipantPageContract,
  ParticipantPageSchema,
} from '#use-cases/participants/list-participants/list-participants.contract';
import { ListParticipantsQuery } from '#use-cases/participants/list-participants/list-participants.query';
import {
  type ParticipantContract,
  ParticipantSchema,
} from '#use-cases/participants/participant.contract';

class CreateParticipantBody extends createZodDto(CreateParticipantSchema) {}
class ListParticipantsParams extends createZodDto(ListParticipantsSchema) {}
class ParticipantResponse extends createZodDto(ParticipantSchema) {}
class ParticipantPageResponse extends createZodDto(ParticipantPageSchema) {}

@ApiTags('participants')
@Controller('participants')
export class ParticipantsRouter {
  constructor(
    @Inject(CommandBus) private readonly commandBus: CommandBus,
    @Inject(QueryBus) private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ZodResponse({
    status: 201,
    description: 'The stored participant with its calculated values',
    type: ParticipantResponse,
  })
  create(@Body() body: CreateParticipantBody): Promise<ParticipantContract> {
    return this.commandBus.execute(new CreateParticipantCommand(body));
  }

  @Get()
  @ZodResponse({
    status: 200,
    description: 'A page of participants, newest first',
    type: ParticipantPageResponse,
  })
  list(@Query() query: ListParticipantsParams): Promise<ParticipantPageContract> {
    return this.queryBus.execute(new ListParticipantsQuery(query));
  }
}
