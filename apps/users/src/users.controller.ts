import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  async findUser(@Param('id') id: string): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordRequestDto: ForgotPasswordRequestDto,
  ): Promise<void> {
    return this.usersService.forgotPassword(forgotPasswordRequestDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    return this.usersService.resetPassword(requestPasswordResetDto);
  }
}
