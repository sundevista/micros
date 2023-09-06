import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { RmqModule } from '../rmq/rmq.module';

@Module({
  imports: [RmqModule],
  exports: [RmqModule],
})
export class SharedAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
