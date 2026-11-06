import { z } from 'zod';
import { API_BASE_URL } from '../config/constants/api-base-url';
import { ApiError } from './api-error';
import {
  SERVER_ERROR_MESSAGE,
  UNEXPECTED_ANSWER_MESSAGE,
  UNREACHABLE_MESSAGE,
} from './constants/error-messages';
import type { RequestOptions } from './types/request-options.types';

const REQUEST_TIMEOUT_MS = 15_000;

const ErrorBodySchema = z.object({
  message: z.string().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

function describeFailure(payload: unknown, status: number): string {
  if (status >= 500) return SERVER_ERROR_MESSAGE;

  const body = ErrorBodySchema.safeParse(payload);
  if (body.success) {
    const details = body.data.errors?.map((error) => error.message).join('. ');
    if (details) return details;
    if (body.data.message) return body.data.message;
  }
  return `Request failed (${status})`;
}

// Knows no domain: the caller hands over the schema the response must match.
export async function request<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  { method = 'GET', body }: RequestOptions = {},
): Promise<z.infer<TSchema>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE, 0);
  }

  const payload: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new ApiError(describeFailure(payload, response.status), response.status);
  }

  // The raw Zod error stays as the cause: it is for a developer, not for the toast.
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(UNEXPECTED_ANSWER_MESSAGE, response.status, parsed.error);
  }
  return parsed.data;
}
