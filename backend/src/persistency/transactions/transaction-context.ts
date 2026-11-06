import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

@Injectable()
export class TransactionContext {
  private readonly storage = new AsyncLocalStorage<EntityManager>();

  current(): EntityManager | undefined {
    return this.storage.getStore();
  }

  run<TResult>(manager: EntityManager, work: () => Promise<TResult>): Promise<TResult> {
    return this.storage.run(manager, work);
  }
}
