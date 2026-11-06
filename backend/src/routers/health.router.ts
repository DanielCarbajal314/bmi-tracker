import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import { DatabaseCheck } from '#persistency/checks/database/database.check';
import { type HealthContract, HealthSchema } from '#use-cases/health/health.contract';

class HealthResponse extends createZodDto(HealthSchema) {}

// Liveness probe. The one router that skips the command/query bus on purpose:
// it has no rule and no transaction, and the orchestrator polls it often.
@ApiTags('health')
@Controller('health')
export class HealthRouter {
  constructor(@Inject(DatabaseCheck) private readonly database: DatabaseCheck) {}

  @Get()
  @ZodResponse({ status: 200, description: 'The database answers', type: HealthResponse })
  @ApiServiceUnavailableResponse({ description: 'The database does not answer' })
  async check(): Promise<HealthContract> {
    try {
      await this.database.ping();
    } catch {
      throw new ServiceUnavailableException('database unreachable');
    }
    return { status: 'ok' };
  }
}
