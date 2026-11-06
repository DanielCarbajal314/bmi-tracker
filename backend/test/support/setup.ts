// Preload for the integration suite: creates the test database if needed and
// runs the migrations on it. Relative imports only: no alias is resolved here.
import { DataSource } from 'typeorm';
import { z } from 'zod';
import { buildDataSourceOptions } from '../../src/config/database/database.options';
import { EnvSchema } from '../../src/config/env/env.schema';

const env = EnvSchema.parse(process.env);

// The suite truncates tables, so it must never point at a development database.
if (!env.DB_NAME.endsWith('_test')) {
  throw new Error(`Refusing to run integration tests on database "${env.DB_NAME}"`);
}

const admin = new DataSource({
  ...buildDataSourceOptions({ ...env, DB_NAME: 'postgres' }),
  entities: [],
  migrations: [],
});
await admin.initialize();
const existing = z
  .array(z.unknown())
  .parse(await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [env.DB_NAME]));
if (existing.length === 0) {
  await admin.query(`CREATE DATABASE "${env.DB_NAME}"`);
}
await admin.destroy();

const database = new DataSource(buildDataSourceOptions(env));
await database.initialize();
await database.runMigrations();
await database.destroy();
