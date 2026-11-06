import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { Env } from '#config/env/env.schema';
import { setupOpenApi } from '#config/openapi/openapi.ui';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  setupOpenApi(app);
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const corsOrigins = config.get('CORS_ORIGINS', { infer: true });
  if (corsOrigins.length > 0) app.enableCors({ origin: corsOrigins });
  await app.listen(config.get('PORT', { infer: true }), '0.0.0.0');
}

void bootstrap();
