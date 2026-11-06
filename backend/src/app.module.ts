import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { EnvModule } from '#config/env/env.module';
import { PersistencyModule } from '#persistency/persistency.module';
import { DomainErrorFilter } from '#routers/http/domain-error.filter';
import { RoutersModule } from '#routers/routers.module';
import { UseCasesModule } from '#use-cases/use-cases.module';

@Module({
  imports: [EnvModule, PersistencyModule, UseCasesModule, RoutersModule],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
})
export class AppModule {}
