import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheKey } from '@nestjs/cache-manager';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import {
  HttpCacheInterceptor,
  SharedJwtAuthGuard,
  ProxySafeThrottlerGuard,
} from '@app/common';
import MongooseClassSerializerInterceptor from './interceptors/mongoose-class-serializer.interceptor';
import { USERS_CACHE_KEYS } from './users.constants';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(USERS_CACHE_KEYS.TEST_USERS_CACHING)
  @Get('test-cache')
  async testCache(): Promise<number> {
    this.logger.log('Uncached version user');
    return this.usersService.testUserCaching();
  }

  @UseGuards(ProxySafeThrottlerGuard)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(ProxySafeThrottlerGuard, SharedJwtAuthGuard)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @Get()
  async findUser(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findOneById(user._id.toString());
  }

  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @UseGuards(ProxySafeThrottlerGuard, SharedJwtAuthGuard)
  @Patch()
  async updateUser(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(user._id.toString(), updateUserDto);
  }

  @UseGuards(SharedJwtAuthGuard)
  @Delete()
  async delete(@CurrentUser() user: User): Promise<void> {
    return this.usersService.delete(user._id.toString());
  }

  @UseGuards(ProxySafeThrottlerGuard)
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordRequestDto: ForgotPasswordRequestDto,
  ): Promise<any> {
    return this.usersService.forgotPassword(forgotPasswordRequestDto);
  }

  @UseGuards(ProxySafeThrottlerGuard)
  @Post('reset-password')
  async resetPassword(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    return this.usersService.resetPassword(requestPasswordResetDto);
  }
}
