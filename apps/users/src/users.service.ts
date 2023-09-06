import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PASSWORD_SALT_ROUNDS } from './users.constants';
import { EncryptionService } from '@app/common/encryption/encryption.service';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, of, tap } from 'rxjs';

@Injectable()
export class UsersService {
  private readonly passwordRestoration: Record<string, string> = {};
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly encryptionService: EncryptionService,
    @Inject('MAIL') private readonly mailClient: ClientProxy,
  ) {}

  async hashedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  }

  async encryptSensitiveData(user: User) {
    if (user.partnerKey)
      user.partnerKey = this.encryptionService.encryptData(user.partnerKey);
  }

  async decryptSensitiveData(user: User) {
    if (user.partnerKey)
      user.partnerKey = this.encryptionService.decryptData(user.partnerKey);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashedPassword(createUserDto.password);
    await this.encryptSensitiveData(createUserDto as User);

    return this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ _id: id });
    await this.decryptSensitiveData(user);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password)
      updateUserDto.password = await this.hashedPassword(
        updateUserDto.password,
      );
    await this.encryptSensitiveData(updateUserDto as User);

    return this.usersRepository.findOneAndUpdate({ _id: id }, updateUserDto);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete({ _id: id });
  }

  async forgotPassword(forgotPasswordRequestDto: ForgotPasswordRequestDto) {
    const user = await this.usersRepository.findOne({
      email: forgotPasswordRequestDto.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.encryptionService.generateToken();
    this.passwordRestoration[token] = user._id.toString();

    return this.mailClient
      .send('send-forgot-mail', { recepient: user.email, token })
      .pipe(
        tap(() => {
          this.logger.log('Email was successfully sent');
          return of('Email was successfully sent');
        }),
        catchError((err) => {
          this.logger.warn(
            `Failed to send reset token to ${
              user.email
            }. Details: ${JSON.stringify(err)}`,
          );
          return of('Failed to send mail');
        }),
      );
  }

  async resetPassword(requestPasswordResetDto: RequestPasswordResetDto) {
    if (this.passwordRestoration[requestPasswordResetDto.token]) {
      const user = await this.findOneById(
        this.passwordRestoration[requestPasswordResetDto.token],
      );

      await this.update(user._id.toString(), {
        password: requestPasswordResetDto.password,
      });
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const passwordsMatch = bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
