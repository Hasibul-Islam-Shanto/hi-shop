import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DecimalTransformInterceptor } from './common/interceptors/decimal-transform.interceptor';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(requestIdMiddleware);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

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

  const frontendUrl =
    config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  const dashboardUrl =
    config.get<string>('DASHBOARD_URL') ?? 'http://localhost:5173';
  app.enableCors({
    origin: [frontendUrl, dashboardUrl],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hi-Shop API')
    .setDescription('Hi-Shop ecommerce backend')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'jwt',
    )
    .build();

  SwaggerModule.setup(
    'api-docs',
    app,
    () => SwaggerModule.createDocument(app, swaggerConfig),
    {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationSorter: 'alpha',
      },
      customSiteTitle: 'Hi-Shop API',
    },
  );

  const port = config.get<number>('SERVER_PORT') ?? 5000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application running at ${await app.getUrl()}`);
  logger.log(`Swagger UI at     ${await app.getUrl()}/api-docs`);
}

void bootstrap();
