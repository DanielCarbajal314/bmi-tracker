import { vi } from 'vitest';

type StubbedRequest = {
  method: string;
  path: string;
  search: URLSearchParams;
  body: unknown;
};

type StubbedResponse = {
  status?: number;
  body: unknown;
};

// Replaces the global fetch for one test. `path` includes the /api prefix.
export function stubFetch(handler: (request: StubbedRequest) => StubbedResponse) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost');
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined;
    const response = handler({
      method: init?.method ?? 'GET',
      path: url.pathname,
      search: url.searchParams,
      body,
    });
    return new Response(JSON.stringify(response.body), {
      status: response.status ?? 200,
      headers: { 'content-type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
