import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { DecimalTransformInterceptor } from '../../src/common/interceptors/decimal-transform.interceptor';
import { RequestLoggingInterceptor } from '../../src/common/interceptors/request-logging.interceptor';
import { requestIdMiddleware } from '../../src/common/middleware/request-id.middleware';
import { PrismaService } from '../../src/prisma/prisma.service';
import { assertSafeE2eDatabase, configureE2eEnv } from './e2e-config';

export type E2eApp = {
  app: INestApplication;
  prisma: PrismaService;
};

export async function createE2eApp(): Promise<E2eApp> {
  configureE2eEnv();
  assertSafeE2eDatabase();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.use(requestIdMiddleware);
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new RequestLoggingInterceptor(),
    new DecimalTransformInterceptor(),
  );
  app.use(cookieParser());

  await app.init();

  return {
    app,
    prisma: app.get(PrismaService),
  };
}
