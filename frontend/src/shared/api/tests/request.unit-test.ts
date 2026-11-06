import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { stubFetch } from '@/test/stub-fetch';
import { ApiError } from '../api-error';
import {
  SERVER_ERROR_MESSAGE,
  UNEXPECTED_ANSWER_MESSAGE,
  UNREACHABLE_MESSAGE,
} from '../constants/error-messages';
import { request } from '../request';

const Schema = z.object({ ok: z.boolean() });

describe('request', () => {
  it('returns the body parsed with the given schema', async () => {
    stubFetch(() => ({ body: { ok: true } }));

    await expect(request('/ping', Schema)).resolves.toEqual({ ok: true });
  });

  it('prefixes the path with /api and sends a JSON body', async () => {
    const fetchMock = stubFetch(() => ({ body: { ok: true } }));

    await request('/things', Schema, { method: 'POST', body: { name: 'x' } });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/things');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"name":"x"}');
    expect(init?.headers).toEqual({ 'content-type': 'application/json' });
  });

  it('joins the validation messages of a 400 into one readable message', async () => {
    stubFetch(() => ({
      status: 400,
      body: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [{ message: 'Must be positive' }, { message: 'Required' }],
      },
    }));

    const failure = request('/things', Schema);

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      status: 400,
      message: 'Must be positive. Required',
    });
  });

  it('uses the error message when there are no validation details', async () => {
    stubFetch(() => ({ status: 404, body: { statusCode: 404, message: 'Not found' } }));

    await expect(request('/things', Schema)).rejects.toMatchObject({
      status: 404,
      message: 'Not found',
    });
  });

  it('falls back to the status when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Not here', { status: 404 })),
    );

    await expect(request('/things', Schema)).rejects.toMatchObject({
      status: 404,
      message: 'Request failed (404)',
    });
  });

  it('answers a 5xx with a message a person can act on, whatever the body says', async () => {
    stubFetch(() => ({ status: 500, body: { statusCode: 500, message: 'Internal server error' } }));

    await expect(request('/things', Schema)).rejects.toMatchObject({
      status: 500,
      message: SERVER_ERROR_MESSAGE,
    });
  });

  it('does the same when a proxy answers 502 with a page that is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>Bad gateway</html>', { status: 502 })),
    );

    await expect(request('/things', Schema)).rejects.toMatchObject({
      status: 502,
      message: SERVER_ERROR_MESSAGE,
    });
  });

  it('reports an unreachable server with status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(request('/things', Schema)).rejects.toMatchObject({
      status: 0,
      message: UNREACHABLE_MESSAGE,
    });
  });

  it('rejects a response that does not match the schema, with a readable message', async () => {
    stubFetch(() => ({ body: { ok: 'yes' } }));

    const failure = request('/things', Schema);

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      status: 200,
      message: UNEXPECTED_ANSWER_MESSAGE,
      cause: expect.any(z.ZodError),
    });
  });
});
