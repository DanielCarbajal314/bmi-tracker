import type { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import type { TransactionContext } from '../transactions/transaction-context';

export abstract class BaseRepository<TEntity extends ObjectLiteral> {
  protected constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
    private readonly entity: EntityTarget<TEntity>,
  ) {}

  protected get repository(): Repository<TEntity> {
    const manager = this.context.current() ?? this.dataSource.manager;
    return manager.getRepository(this.entity);
  }
}
