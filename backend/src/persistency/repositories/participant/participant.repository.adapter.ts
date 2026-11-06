import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParticipantEntity } from '../../models/participant.entity';
import { TransactionContext } from '../../transactions/transaction-context';
import { BaseRepository } from '../base.repository';
import type { ParticipantRepository } from './participant.repository';
import type { NewParticipant } from './types/new-participant.types';
import type { ParticipantPage } from './types/participant-page.types';
import type { ParticipantSearch } from './types/participant-search.types';

@Injectable()
export class ParticipantRepositoryAdapter
  extends BaseRepository<ParticipantEntity>
  implements ParticipantRepository
{
  constructor(
    @Inject(DataSource) dataSource: DataSource,
    @Inject(TransactionContext) context: TransactionContext,
  ) {
    super(dataSource, context, ParticipantEntity);
  }

  async create(participant: NewParticipant): Promise<ParticipantEntity> {
    return this.repository.save(this.repository.create(participant));
  }

  async search({ minBmi, maxBmi, offset, limit }: ParticipantSearch): Promise<ParticipantPage> {
    const query = this.repository.createQueryBuilder('participant');
    if (minBmi !== undefined) {
      query.andWhere('participant.bmi >= :minBmi', { minBmi });
    }
    if (maxBmi !== undefined) {
      query.andWhere('participant.bmi <= :maxBmi', { maxBmi });
    }
    const [items, total] = await query
      .orderBy('participant.creationDate', 'DESC')
      .addOrderBy('participant.id', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    return { items, total };
  }
}
