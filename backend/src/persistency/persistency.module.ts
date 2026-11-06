import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from '#config/database/database.options';
import type { Env } from '#config/env/env.schema';
import { DatabaseProbe } from './probes/database/database.probe';
import { DatabaseProbeAdapter } from './probes/database/database.probe.adapter';
import { ParticipantRepository } from './repositories/participant/participant.repository';
import { ParticipantRepositoryAdapter } from './repositories/participant/participant.repository.adapter';
import { AppUnitOfWork } from './transactions/app/app.unit-of-work';
import { AppUnitOfWorkAdapter } from './transactions/app/app.unit-of-work.adapter';
import { TransactionContext } from './transactions/transaction-context';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        buildDataSourceOptions({
          DB_HOST: config.get('DB_HOST', { infer: true }),
          DB_PORT: config.get('DB_PORT', { infer: true }),
          DB_USER: config.get('DB_USER', { infer: true }),
          DB_PASSWORD: config.get('DB_PASSWORD', { infer: true }),
          DB_NAME: config.get('DB_NAME', { infer: true }),
          DB_SSL: config.get('DB_SSL', { infer: true }),
        }),
    }),
  ],
  providers: [
    TransactionContext,
    { provide: DatabaseProbe, useClass: DatabaseProbeAdapter },
    { provide: ParticipantRepository, useClass: ParticipantRepositoryAdapter },
    { provide: AppUnitOfWork, useClass: AppUnitOfWorkAdapter },
  ],
  exports: [DatabaseProbe, ParticipantRepository, AppUnitOfWork],
})
export class PersistencyModule {}
