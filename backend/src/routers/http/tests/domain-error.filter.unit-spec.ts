import { describe, expect, spyOn, test } from 'bun:test';
import { Logger } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import {
  BusinessRuleError,
  ConflictError,
  DomainError,
  NotFoundError,
} from '#shared/domain/domain-error';
import { DomainErrorFilter, statusForDomainError } from '../domain-error.filter';
import type { JsonResponse } from '../types/json-response.types';

class UnmappedError extends DomainError {}

function answerTo(exception: DomainError) {
  const sent: { status?: number; body?: unknown } = {};
  const response: JsonResponse = {
    status(code) {
      sent.status = code;
      return response;
    },
    json(body) {
      sent.body = body;
    },
  };

  new DomainErrorFilter().catch(exception, new ExecutionContextHost([{}, response]));

  return sent;
}

describe('statusForDomainError', () => {
  test.each([
    ['NotFoundError', new NotFoundError('x'), 404],
    ['ConflictError', new ConflictError('x'), 409],
    ['BusinessRuleError', new BusinessRuleError('x'), 422],
    ['an unmapped DomainError', new UnmappedError('x'), 500],
  ])('maps %s to its HTTP status', (_name, exception, status) => {
    expect(statusForDomainError(exception)).toBe(status);
  });
});

describe('DomainErrorFilter', () => {
  test('answers the mapped status with the error name and message', () => {
    const sent = answerTo(new ConflictError('Email already registered'));

    expect(sent).toEqual({
      status: 409,
      body: { statusCode: 409, message: 'Email already registered', error: 'ConflictError' },
    });
  });

  test('answers 500 and logs an error nobody mapped', () => {
    const logged = spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const sent = answerTo(new UnmappedError('unexpected'));

    expect(sent.status).toBe(500);
    expect(logged).toHaveBeenCalledTimes(1);
    logged.mockRestore();
  });
});
