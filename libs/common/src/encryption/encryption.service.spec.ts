import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

describe('EncryptionModule', () => {
  let configService: ConfigService;
  let encryptionService: EncryptionService;

  function mockConfigGet(propertyPath: string): any {
    switch (propertyPath) {
      case 'ENCRYPTION_ALG':
        return 'aes-256-cbc';
      case 'ENCRYPTION_KEY':
        return 'Hq3SUZ32526WCAyRVic';
      case 'ENCRYPTION_IV':
        return '1pOU1BqOFMUwFOCd';
      default:
        return '';
    }
  }

  beforeEach(async () => {
    configService = new ConfigService();
    jest.spyOn(configService, 'get').mockImplementation(mockConfigGet);
    encryptionService = new EncryptionService(configService);
  });

  describe('EncryptionService', () => {
    it('should encrypt data', () => {
      const testData = 'secret string';
      const result = encryptionService.encryptData(testData);
      expect(result).toBeTruthy();
    });
    it('should decrypt encrypted data', () => {
      const testData = 'secret string';
      const encryptedData = encryptionService.encryptData(testData);
      const decryptedData = encryptionService.decryptData(encryptedData);
      expect(decryptedData).toEqual(testData);
    });
    it('should throw error when trying to decrypt decrypted data', () => {
      const testData = 'wrong string';
      expect(() => encryptionService.decryptData(testData)).toThrow();
    });
    it('should throw error when encrypted data is corrupted', () => {
      const testData = 'secret string';
      const encryptedData = '0' + encryptionService.encryptData(testData);
      expect(() => encryptionService.decryptData(encryptedData)).toThrow();
    });
    it('should encrypt data', () => {
      const testData = 'secret string';
      const result = encryptionService.encryptData(testData);
      expect(result).toBeTruthy();
    });
    it('should generate token with default length', () => {
      const result = encryptionService.generateToken();
      expect(result).toBeTruthy();
    });
    it('should generate token with defined length', () => {
      const tokenLength = 34;
      const result = encryptionService.generateToken(tokenLength);
      expect(result).toHaveLength(tokenLength);
    });
    it('should generate token with length less than 2', () => {
      const tokenLength = 1;
      const result = encryptionService.generateToken(tokenLength);
      expect(result).toEqual('');
    });
  });
});
