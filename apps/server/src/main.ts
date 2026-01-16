/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  app.use(helmet());

  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix, {
    exclude: ['/'],
  });

  // Swagger Configuration
  const serverUrl = configService.get<string>('SERVER_URL');
  const documentBuilder = new DocumentBuilder()
    .setTitle('QuickBooks Integration')
    .setDescription('Documentation for QuickBooks Integration')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints');

  if (serverUrl) {
    documentBuilder.addServer(serverUrl);
  }

  const config = documentBuilder.build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'QuickBooks Integration Documentation',
  });

  app.use(cookieParser());

  // Serve static assets (CSS, JS, images, etc.)
  app.useStaticAssets(join(__dirname, 'assets'), {
    prefix: '/v1/assets/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  app.useBodyParser('json', { limit: '10mb' });
  const port = configService.get<number>('SERVER_PORT', 3000);
  const hostname = configService.get<string>('SERVER_HOST', '0.0.0.0');
  await app.listen(port, hostname);
  Logger.log(
    `🚀 Application is running on: http://${hostname}:${port}/${globalPrefix}`,
    `${process.pid}`
  );
}

bootstrap();
