import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User, encryptedUserFields } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PASSWORD_SALT_ROUNDS, USERS_CACHE_KEYS } from './users.constants';
import { EncryptionService } from '@app/common/encryption/encryption.service';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, of, tap } from 'rxjs';
import { mailClientKey, send_forgot_mail } from '@app/common';
import { HttpCacheService } from '@app/common';

@Injectable()
export class UsersService {
  // Store for user restoration tokens
  //  (should be changed in case of multiple api instances (to share single state))
  private readonly passwordRestoration: Record<string, string> = {};
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly encryptionService: EncryptionService,
    @Inject(mailClientKey) private readonly mailClient: ClientProxy,
    private readonly httpCacheService: HttpCacheService,
  ) {}

  /**
   * Clear http cache
   */
  async clearCache(): Promise<void> {
    await this.httpCacheService.clearCache(Object.values(USERS_CACHE_KEYS));
  }

  /**
   * Testing function to check caching
   *
   * @returns number of registered users
   */
  async testUserCaching(): Promise<number> {
    return (await this.usersRepository.find({})).length;
  }

  /**
   * Salts password with bcrypt
   *
   * @param password plain password
   * @returns hashed password
   */
  async hashedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  }

  /**
   * Encrypts objects properties those are marked with {@link Encrypt} decorator
   *
   * @param user object to modify
   */
  async encryptSensitiveData(user: User) {
    encryptedUserFields.forEach((field) => {
      if (user[field])
        user[field] = this.encryptionService.encryptData(user.partnerKey);
    });
  }

  /**
   * Decrypts objects properties those are marked with {@link Encrypt} decorator
   *
   * @param user object to modify
   */
  async decryptSensitiveData(user: User) {
    encryptedUserFields.forEach((field) => {
      if (user[field])
        user[field] = this.encryptionService.decryptData(user.partnerKey);
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashedPassword(createUserDto.password);
    await this.encryptSensitiveData(createUserDto as User);
    await this.clearCache();

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
    await this.clearCache();
  }

  async forgotPassword(forgotPasswordRequestDto: ForgotPasswordRequestDto) {
    const user = await this.usersRepository.findOne({
      email: forgotPasswordRequestDto.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create restoration token and save it in services memory
    const token = this.encryptionService.generateToken();
    this.passwordRestoration[token] = user._id.toString();

    // Send a mail using microservice
    return this.mailClient
      .send(send_forgot_mail, { recepient: user.email, token })
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

  /**
   * Used to reset password from given token
   */
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

  /**
   * Validates user credentials
   *
   * @param email user email
   * @param password user plain password
   * @returns user
   */
  async validateUser(email: string, password: string): Promise<User> {
    let user: User;
    try {
      user = await this.usersRepository.findOne({ email });
    } catch (err) {
      throw new UnauthorizedException();
    }
    const passwordsMatch = bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
