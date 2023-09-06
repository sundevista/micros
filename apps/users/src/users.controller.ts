import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from '@app/common';
import MongooseClassSerializerInterceptor from './interceptors/mongoose-class-serializer.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @UseGuards(JwtAuthGuard)
  @Get()
  async findUser(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findOneById(user._id.toString());
  }

  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(user._id.toString(), updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async delete(@CurrentUser() user: User): Promise<void> {
    return this.usersService.delete(user._id.toString());
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordRequestDto: ForgotPasswordRequestDto,
  ): Promise<any> {
    return this.usersService.forgotPassword(forgotPasswordRequestDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    return this.usersService.resetPassword(requestPasswordResetDto);
  }
}
