import type { DataSource } from 'typeorm';
import type { TransactionContext } from './transaction-context';
import { UnitOfWork } from './unit-of-work';

export abstract class UnitOfWorkAdapter<TRepositories> extends UnitOfWork<TRepositories> {
  protected constructor(
    private readonly dataSource: DataSource,
    private readonly context: TransactionContext,
  ) {
    super();
  }

  protected abstract repositories(): TRepositories;

  async execute<TResult>(
    work: (repositories: TRepositories) => Promise<TResult>,
  ): Promise<TResult> {
    if (this.context.current()) {
      return work(this.repositories());
    }
    return this.dataSource.transaction((manager) =>
      this.context.run(manager, () => work(this.repositories())),
    );
  }
}
