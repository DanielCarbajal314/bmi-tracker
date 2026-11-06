import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { z } from 'zod';
import { AppModule } from '../../src/app.module';
import type { TestApp } from './types/test-app.types';

const RowsSchema = z.array(z.record(z.string(), z.unknown()));
const TableNamesSchema = z.array(z.object({ tablename: z.string() }));

// Boots the real AppModule, with its global pipe, interceptor and filter, on a random port.
export async function startTestApp(): Promise<TestApp> {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  const baseUrl = await app.getUrl();
  const dataSource = app.get(DataSource);

  async function query(sql: string) {
    return RowsSchema.parse(await dataSource.query(sql));
  }

  return {
    app,
    async request(method, path, body) {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const parsed: unknown = await response.json();
      return { status: response.status, body: parsed };
    },
    query,
    reset: async () => {
      const tables = TableNamesSchema.parse(
        await dataSource.query(
          `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'migrations'`,
        ),
      );
      if (tables.length === 0) return;
      const names = tables.map(({ tablename }) => `"public"."${tablename}"`).join(', ');
      await dataSource.query(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
    },
    close: () => app.close(),
  };
}
