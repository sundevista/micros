import { IsString, MaxLength, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  token: string;
}
