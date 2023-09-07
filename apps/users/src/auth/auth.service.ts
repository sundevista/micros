import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from '../schemas/user.schema';
import { authenticationCookieKey } from '@app/common';

export interface TokenPayload {
  userId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );

    const token = this.jwtService.sign(tokenPayload);

    response.cookie(authenticationCookieKey, token, {
      httpOnly: true,
      secure: true,
      expires,
    });
  }

  async logout(response: Response) {
    response.cookie(authenticationCookieKey, '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });
  }
}
