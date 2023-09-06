import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { HttpCacheService } from './http-cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: './.env',
          validationSchema: Joi.object({
            CACHE_TTL: Joi.number().required(),
            CACHE_MAX: Joi.number().required(),
          }),
        }),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: +configService.get<number>('CACHE_TTL'),
        max: +configService.get<number>('CACHE_MAX'),
        isGlobal: true,
      }),
    }),
  ],
  providers: [HttpCacheService],
  exports: [CacheModule, HttpCacheService],
})
export class HttpCacheModule {}
