import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { NotificationsModule } from '../notifications/notifications.module';
import { SmsModule } from '../sms/sms.module';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { OtpService } from './otp.service';
import { SessionLivenessCache } from './session-liveness.cache';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    SmsModule,
    EmailModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    OtpService,
    SessionLivenessCache,
    SessionsService,
  ],
  exports: [AuthService, SessionsService, SessionLivenessCache],
})
export class AuthModule {}
