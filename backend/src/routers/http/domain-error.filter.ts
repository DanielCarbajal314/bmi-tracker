import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import {
  BusinessRuleError,
  ConflictError,
  DomainError,
  NotFoundError,
} from '#shared/domain/domain-error';
import type { JsonResponse } from './types/json-response.types';

export function statusForDomainError(exception: DomainError): number {
  if (exception instanceof NotFoundError) return HttpStatus.NOT_FOUND;
  if (exception instanceof ConflictError) return HttpStatus.CONFLICT;
  if (exception instanceof BusinessRuleError) return HttpStatus.UNPROCESSABLE_ENTITY;
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  private readonly logger = new Logger(DomainErrorFilter.name);

  catch(exception: DomainError, host: ArgumentsHost): void {
    const status = statusForDomainError(exception);

    if (status >= 500) {
      this.logger.error(`Unmapped DomainError: ${exception.name}`, exception.stack);
    }

    host
      .switchToHttp()
      .getResponse<JsonResponse>()
      .status(status)
      .json({ statusCode: status, message: exception.message, error: exception.name });
  }
}
