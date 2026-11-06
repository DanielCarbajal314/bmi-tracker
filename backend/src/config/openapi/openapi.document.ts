import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

// Apart from the UI so a test can build the document without mounting anything.
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder().setTitle('BMI Tracker API').setVersion('1.0').build();

  return cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
}
