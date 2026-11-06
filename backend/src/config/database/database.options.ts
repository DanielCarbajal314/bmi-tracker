import { join } from 'node:path';
import type { Env } from '../env/env.schema';

// Shared by the Nest app and the TypeORM CLI. Entities and migrations are
// found by path, so this file imports nothing from the persistency layer.
export function buildDataSourceOptions(
  env: Pick<Env, 'DB_HOST' | 'DB_PORT' | 'DB_USER' | 'DB_PASSWORD' | 'DB_NAME' | 'DB_SSL'>,
) {
  return {
    type: 'postgres' as const,
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    // Traffic is encrypted, the server certificate is not verified: the database is only
    // reachable from inside the VPC.
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    entities: [join(__dirname, '../../persistency/models/*.entity.{ts,js}')],
    migrations: [join(__dirname, '../../migrations/*.{ts,js}')],
    synchronize: false,
    migrationsRun: false,
  };
}
