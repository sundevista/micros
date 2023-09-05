import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { RmqModule } from '../rmq/rmq.module';
import { AUTH_SERVICE } from './auth.constants';

@Module({
  imports: [RmqModule.register({ name: AUTH_SERVICE })],
  exports: [RmqModule],
})
export class SharedAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
