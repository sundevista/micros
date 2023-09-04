import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('CORS_ALLOWED_ORIGINS', '*'),
  });

  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
