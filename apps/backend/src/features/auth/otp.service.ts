import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomInt } from 'node:crypto';

import { RedisService } from '../sms/redis.service';
import { SmsService } from '../sms/sms.service';
import { normalizeIranPhone } from '../sms/phone.util';
import { CONSOLE_OTP_CODE } from '../sms/sms.types';

const OTP_TTL_SECONDS = 120;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_HOUR_LIMIT = 5;
const OTP_HOUR_WINDOW = 3600;

export type OtpPurpose = 'login' | 'signup';

@Injectable()
export class OtpService {
  constructor(
    private readonly redis: RedisService,
    private readonly sms: SmsService,
  ) {}

  async request(
    phoneRaw: string,
    purpose: OtpPurpose,
  ): Promise<{ readonly ok: true; readonly expiresIn: number }> {
    if (process.env.NODE_ENV === 'production' && !this.sms.isLiveProvider()) {
      throw new HttpException(
        'SMS OTP is not available in production without a real SMS provider',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    let phone: string;
    try {
      phone = normalizeIranPhone(phoneRaw);
    } catch {
      throw new BadRequestException('Invalid phone number');
    }

    const cooldownKey = `otp:cooldown:${purpose}:${phone}`;
    if (await this.redis.get(cooldownKey)) {
      throw new HttpException('OTP recently sent — wait before retry', HttpStatus.TOO_MANY_REQUESTS);
    }

    const hourKey = `otp:hour:${purpose}:${phone}`;
    const hourCount = await this.redis.incr(hourKey, OTP_HOUR_WINDOW);
    if (hourCount > OTP_HOUR_LIMIT) {
      throw new HttpException('OTP rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code =
      this.sms.providerName === 'console' ? CONSOLE_OTP_CODE : String(randomInt(100_000, 999_999));
    const hash = this.hashCode(code);
    await this.redis.set(`otp:code:${purpose}:${phone}`, hash, OTP_TTL_SECONDS);
    await this.redis.set(cooldownKey, '1', OTP_COOLDOWN_SECONDS);

    await this.sms.sendOtp(phone, code);
    return { ok: true, expiresIn: OTP_TTL_SECONDS };
  }

  async consume(phoneRaw: string, purpose: OtpPurpose, code: string): Promise<string> {
    let phone: string;
    try {
      phone = normalizeIranPhone(phoneRaw);
    } catch {
      throw new BadRequestException('Invalid phone number');
    }

    const key = `otp:code:${purpose}:${phone}`;
    const stored = await this.redis.get(key);
    if (!stored) {
      throw new UnauthorizedException('OTP expired or not found');
    }

    const acceptsConsole =
      this.sms.providerName === 'console' && code === CONSOLE_OTP_CODE;
    const match = acceptsConsole || stored === this.hashCode(code);
    if (!match) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.redis.del(key);
    return phone;
  }

  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }
}
