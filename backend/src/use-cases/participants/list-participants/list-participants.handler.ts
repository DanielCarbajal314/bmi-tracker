import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ParticipantRepository } from '#persistency/repositories/participant/participant.repository';
import { toParticipantContract } from '../participant.mapper';
import type { ParticipantPageContract } from './list-participants.contract';
import { ListParticipantsQuery } from './list-participants.query';

@QueryHandler(ListParticipantsQuery)
export class ListParticipantsHandler
  implements IQueryHandler<ListParticipantsQuery, ParticipantPageContract>
{
  constructor(@Inject(ParticipantRepository) private readonly participants: ParticipantRepository) {}

  async execute({ input }: ListParticipantsQuery): Promise<ParticipantPageContract> {
    const { minBmi, maxBmi, page, limit } = input;
    const { items, total } = await this.participants.search({
      minBmi,
      maxBmi,
      offset: (page - 1) * limit,
      limit,
    });

    return {
      items: items.map(toParticipantContract),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
