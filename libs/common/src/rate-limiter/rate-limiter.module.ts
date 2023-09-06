import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: './.env',
          validationSchema: Joi.object({
            THROTTLE_RATE_LIMIT: Joi.number().required(),
            THROTTLE_RATE_TTL: Joi.number().required(),
          }),
        }),
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_RATE_TTL'),
          limit: configService.get<number>('THROTTLE_RATE_LIMIT'),
        },
      ],
    }),
  ],
})
export class RateLimiterModule {}
