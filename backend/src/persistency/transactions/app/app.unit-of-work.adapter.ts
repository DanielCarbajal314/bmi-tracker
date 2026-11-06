import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParticipantRepository } from '../../repositories/participant/participant.repository';
import { TransactionContext } from '../transaction-context';
import { UnitOfWorkAdapter } from '../unit-of-work.adapter';
import type { AppUnitOfWork } from './app.unit-of-work';
import type { AppRepositories } from './types/app-repositories.types';

@Injectable()
export class AppUnitOfWorkAdapter
  extends UnitOfWorkAdapter<AppRepositories>
  implements AppUnitOfWork
{
  constructor(
    @Inject(DataSource) dataSource: DataSource,
    @Inject(TransactionContext) context: TransactionContext,
    @Inject(ParticipantRepository) private readonly participants: ParticipantRepository,
  ) {
    super(dataSource, context);
  }

  protected repositories(): AppRepositories {
    return { participants: this.participants };
  }
}
