import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}

  private readonly alg = this.configService.get<string>('ENCRYPTION_ALG');
  private readonly key = createHash('sha256')
    .update(this.configService.get<string>('ENCRYPTION_KEY'))
    .digest('hex')
    .substring(0, 32);
  private readonly iv = createHash('sha256')
    .update(this.configService.get<string>('ENCRYPTION_IV'))
    .digest('hex')
    .substring(0, 16);

  encryptData(data: string): string {
    const cipher = createCipheriv(this.alg, this.key, this.iv);
    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
    ).toString('base64');
  }

  decryptData(data: string): string {
    const buff = Buffer.from(data, 'base64');
    const decipher = createDecipheriv(this.alg, this.key, this.iv);
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    );
  }

  generateToken(length: number = 64): string {
    return randomBytes(length).toString('hex');
  }
}
