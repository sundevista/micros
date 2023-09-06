import { NestFactory } from '@nestjs/core';
import { MailerModule } from './mailer.module';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(MailerModule);
  const configService = app.get(ConfigService);
  const rmqService = app.get(RmqService);

  app.connectMicroservice(rmqService.getOptions('MAIL', true));

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('PORT', 3003));
}
bootstrap();
