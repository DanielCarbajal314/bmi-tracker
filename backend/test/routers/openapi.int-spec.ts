import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { z } from 'zod';
import { buildOpenApiDocument } from '#config/openapi/openapi.document';
import { startTestApp } from '../support/test-app';
import type { TestApp } from '../support/types/test-app.types';

const ResponseSchema = z.object({
  content: z.record(z.string(), z.object({ schema: z.unknown() })).optional(),
});

const DocumentSchema = z.object({
  paths: z.record(
    z.string(),
    z.record(z.string(), z.object({ responses: z.record(z.string(), ResponseSchema) })),
  ),
});

let testApp: TestApp;
let document: z.infer<typeof DocumentSchema>;

beforeAll(async () => {
  testApp = await startTestApp();
  document = DocumentSchema.parse(buildOpenApiDocument(testApp.app));
});

afterAll(async () => {
  await testApp.close();
});

describe('OpenAPI document', () => {
  test('publishes every route the API answers', () => {
    expect(Object.keys(document.paths).sort()).toEqual(['/health', '/participants']);
  });

  // The test that catches a route declared with @ZodSerializerDto instead of @ZodResponse.
  test('gives every success response a JSON schema', () => {
    const missing: string[] = [];

    for (const [path, methods] of Object.entries(document.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        for (const [status, response] of Object.entries(operation.responses)) {
          const carriesABody = status.startsWith('2') && status !== '204';

          if (carriesABody && !response.content?.['application/json']?.schema) {
            missing.push(`${method.toUpperCase()} ${path} -> ${status}`);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test('documents the statuses each route can answer', () => {
    const statuses = (path: string, method: string) =>
      Object.keys(document.paths[path]?.[method]?.responses ?? {});

    expect(statuses('/health', 'get')).toContain('200');
    expect(statuses('/health', 'get')).toContain('503');
    expect(statuses('/participants', 'post')).toContain('201');
    expect(statuses('/participants', 'get')).toContain('200');
  });
});
