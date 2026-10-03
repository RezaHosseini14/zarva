import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { NotificationAudience, NotificationPriority } from '@zarva/shared';
import { NOTIFICATION_PRIORITIES } from '@zarva/shared';

export const NOTIFICATION_AUDIENCES = [
  'USERS',
  'ORG_ALL',
  'ORGS',
  'PLATFORM_ALL',
] as const satisfies ReadonlyArray<NotificationAudience>;

export class CreateNotificationDto {
  @ApiProperty({ example: 'Maintenance window' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'The system will be unavailable at midnight.' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @ApiProperty({ enum: NOTIFICATION_AUDIENCES })
  @IsIn(NOTIFICATION_AUDIENCES)
  audience!: NotificationAudience;

  @ApiPropertyOptional({ enum: NOTIFICATION_PRIORITIES, default: 'NORMAL' })
  @IsOptional()
  @IsIn(NOTIFICATION_PRIORITIES)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @ValidateIf((o: CreateNotificationDto) => o.audience === 'USERS')
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userIds?: string[];

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @ValidateIf((o: CreateNotificationDto) => o.audience === 'ORGS')
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  organizationIds?: string[];
}
