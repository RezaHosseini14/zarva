import {
  IsEmail,
  IsIn,
  IsString,
  Matches,
  MinLength,
  IsOptional,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@zarva.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ description: 'Required when TOTP is enabled' })
  @IsOptional()
  @IsString()
  @Length(6, 8)
  totpCode?: string;

  @ApiPropertyOptional({ description: 'Stable browser device id' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  clientDeviceId?: string;

  @ApiPropertyOptional({ description: 'Session id to revoke when at device limit' })
  @IsOptional()
  @IsString()
  revokeSessionId?: string;
}

export class SignupDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ description: 'Organization display name' })
  @IsString()
  @MinLength(2)
  organizationName!: string;

  @ApiProperty({ example: '09121234567' })
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'phone must be 09XXXXXXXXX' })
  phone!: string;

  @ApiProperty({ example: 'تهران، خیابان ولیعصر' })
  @IsString()
  @MinLength(3)
  address!: string;

  @ApiProperty({ description: 'OTP code sent to phone', example: '000000' })
  @IsString()
  @Length(6, 6)
  otpCode!: string;

  @ApiPropertyOptional({ default: 'fa' })
  @IsOptional()
  @IsString()
  locale?: string;
}

export class OtpRequestDto {
  @ApiProperty({ example: '09121234567' })
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'phone must be 09XXXXXXXXX' })
  phone!: string;

  @ApiProperty({ enum: ['login', 'signup'] })
  @IsIn(['login', 'signup'])
  purpose!: 'login' | 'signup';
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(32)
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}

export class TotpEnableDto {
  @ApiProperty()
  @IsString()
  @Length(6, 8)
  code!: string;
}

export class TotpDisableDto {
  @ApiProperty()
  @IsString()
  @Length(6, 8)
  code!: string;
}

export class CreateInviteDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  roleId!: string;
}

export class AcceptInviteDto {
  @ApiProperty()
  @IsString()
  @MinLength(32)
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: '09121234567' })
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'phone must be 09XXXXXXXXX' })
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  address!: string;
}

export class OtpVerifyDto {
  @ApiProperty({ example: '09121234567' })
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'phone must be 09XXXXXXXXX' })
  phone!: string;

  @ApiProperty({ example: '000000' })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  clientDeviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  revokeSessionId?: string;
}

export class RenameSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string | null;
}
