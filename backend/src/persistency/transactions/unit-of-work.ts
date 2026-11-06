export abstract class UnitOfWork<TRepositories> {

abstract execute<TResult>(
    work: (repositories: TRepositories) => Promise<TResult>,
  ): Promise<TResult>;
}
