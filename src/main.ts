import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
require('dotenv').config()


function setupSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
  
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  setupSentry();
  await app.listen(3000);
}
bootstrap();
