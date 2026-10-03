import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser = require('cookie-parser');

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3100',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('ZARVA API')
      .setDescription('Gold Business OS — multi-tenant SaaS API')
      .setVersion(process.env.APP_VERSION ?? '0.1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .addTag('Health')
      .addTag('Auth')
      .addTag('Organization')
      .addTag('Billing')
      .addTag('Plans')
      .addTag('Subscriptions')
      .addTag('Theme')
      .addTag('Dashboard')
      .addTag('Markets')
      .addTag('Roles')
      .addTag('Notifications')
      .addTag('Platform')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.BACKEND_PORT ?? 4100);
  await app.listen(port);
}

void bootstrap();
