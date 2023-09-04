import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { EncryptionService } from './encryption.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      validationSchema: Joi.object({
        ENCRYPTION_ALG: Joi.string().required(),
        ENCRYPTION_KEY: Joi.string().required(),
        ENCRYPTION_IV: Joi.string().required(),
      }),
    }),
  ],
  providers: [EncryptionService],
})
export class EncryptionModule {}
