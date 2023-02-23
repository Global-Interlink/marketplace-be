import { JsonRpcProvider, SuiEventFilter } from '@mysten/sui.js';
import { SuiEventEnvelope } from '@mysten/sui.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

dotenv.config();

function setupSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

async function subscribeSMCTEvents() {
  const networkEnv = process.env.BLOCKCHAIN_NETWORK_ENV;
  const provider = new JsonRpcProvider();
  const eventQuery = {
    MoveModule: {
        package: process.env.PACKAGE_OBJECT_ID,
        module: "marketplace"
    }
  };
  console.log(JSON.stringify(await provider.getEvents(eventQuery, null, 100)));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  setupSentry();
  const config = new DocumentBuilder()
    .setTitle('Marketplace APO')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
  await subscribeSMCTEvents();
}

bootstrap();

