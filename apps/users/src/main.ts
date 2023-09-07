import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { RmqService, authClientKey } from '@app/common';
import { DuplicateExceptionFilter } from './exceptions/duplicate-exception.filter';
import { RpcExceptionFilter } from './exceptions/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  const configService = app.get(ConfigService);
  const rmqService = app.get(RmqService);

  app.connectMicroservice(rmqService.getOptions(authClientKey, true));

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new DuplicateExceptionFilter());
  app.useGlobalFilters(new RpcExceptionFilter());

  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('CORS_ALLOWED_ORIGINS', '*'),
  });

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
