import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  DatabaseModule,
  RateLimiterModule,
  RmqModule,
  SharedAuthModule,
  authClientKey,
  mailClientKey,
} from '@app/common';
import { UsersRepository } from './users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { EncryptionModule } from '@app/common/encryption/encryption.module';
import { EncryptionService } from '@app/common/encryption/encryption.service';
import { AuthModule } from './auth/auth.module';
import { HttpCacheModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.number().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/users/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EncryptionModule,
    RmqModule.registerClient({ name: mailClientKey }),
    RmqModule.registerClient({ name: authClientKey }),
    forwardRef(() => AuthModule),
    SharedAuthModule,
    RateLimiterModule,
    HttpCacheModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, EncryptionService],
  exports: [UsersService],
})
export class UsersModule {}
