import { z } from 'zod';
import type { TestResponse } from './types/test-app.types';

// Checks the body against the contract instead of trusting a type argument.
export function bodyOf<TBody>(response: TestResponse, schema: z.ZodType<TBody>): TBody {
  const result = schema.safeParse(response.body);

  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `The response (${response.status}) does not match the contract:\n${detail}\n\n` +
        `Received: ${JSON.stringify(response.body)}`,
    );
  }

  return result.data;
}

// The 400 body of the validation pipe: one entry per invalid field.
export const ValidationErrorBodySchema = z.object({
  errors: z.array(z.object({ path: z.array(z.union([z.string(), z.number()])) })),
});

export function invalidFields(response: TestResponse): string[] {
  return bodyOf(response, ValidationErrorBodySchema).errors.map((error) => error.path.join('.'));
}
