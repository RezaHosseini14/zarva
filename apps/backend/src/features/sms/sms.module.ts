import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ConsoleSmsProvider } from './console-sms.provider';
import { KavenegarSmsProvider } from './kavenegar-sms.provider';
import { SMS_PROVIDER } from './sms.types';
import { SmsService } from './sms.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ConsoleSmsProvider,
    {
      provide: SMS_PROVIDER,
      useFactory: (config: ConfigService, consoleProvider: ConsoleSmsProvider) => {
        const name = config.get<string>('SMS_PROVIDER') ?? 'console';
        if (name === 'kavenegar') {
          return new KavenegarSmsProvider(config);
        }
        return consoleProvider;
      },
      inject: [ConfigService, ConsoleSmsProvider],
    },
    SmsService,
  ],
  exports: [SmsService],
})
export class SmsModule {}
