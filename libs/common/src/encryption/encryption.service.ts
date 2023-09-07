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

  /**
   * Used to encrypt data
   *
   * @param data plain data
   * @returns encrypted data
   */
  encryptData(data: string): string {
    const cipher = createCipheriv(this.alg, this.key, this.iv);
    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
    ).toString('base64');
  }

  /**
   * Used to decrypt data
   *
   * @param data encrypted data
   * @returns decrypted (plain) data
   */
  decryptData(data: string): string {
    const buff = Buffer.from(data, 'base64');
    const decipher = createDecipheriv(this.alg, this.key, this.iv);
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    );
  }

  /**
   * Used to generate random token
   *
   * @param length size of the token
   * @returns random token
   */
  generateToken(length: number = 64): string {
    if (length < 2) return '';
    return randomBytes(Math.round(length / 2)).toString('hex');
  }
}
