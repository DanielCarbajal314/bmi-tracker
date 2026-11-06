// The slice of the HTTP response the exception filter writes to.
export type JsonResponse = {
  status(code: number): JsonResponse;
  json(body: unknown): void;
};
