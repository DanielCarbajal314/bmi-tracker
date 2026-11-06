import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { EnvSchema } from '../env/env.schema';
import { buildDataSourceOptions } from './database.options';

// Entry point for the TypeORM CLI (see the migration:* scripts).
export default new DataSource(buildDataSourceOptions(EnvSchema.parse(process.env)));
