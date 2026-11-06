// `status` is 0 when the server could not be reached.
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'ApiError';
  }
}
