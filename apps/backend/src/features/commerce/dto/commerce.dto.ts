import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

const CHANNEL_TYPES = ['storefront', 'whatsapp', 'instagram', 'other'] as const;
const CHANNEL_STATUSES = ['draft', 'active', 'paused'] as const;

export class CreateCommerceChannelDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ enum: CHANNEL_TYPES })
  @IsOptional()
  @IsIn(CHANNEL_TYPES)
  type?: (typeof CHANNEL_TYPES)[number];

  @ApiPropertyOptional({ enum: CHANNEL_STATUSES })
  @IsOptional()
  @IsIn(CHANNEL_STATUSES)
  status?: (typeof CHANNEL_STATUSES)[number];
}

export class UpdateCommerceChannelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ enum: CHANNEL_TYPES })
  @IsOptional()
  @IsIn(CHANNEL_TYPES)
  type?: (typeof CHANNEL_TYPES)[number];

  @ApiPropertyOptional({ enum: CHANNEL_STATUSES })
  @IsOptional()
  @IsIn(CHANNEL_STATUSES)
  status?: (typeof CHANNEL_STATUSES)[number];
}

export class CreateCommerceListingDto {
  @ApiProperty()
  @IsUUID()
  channelId!: string;

  @ApiProperty()
  @IsUUID()
  inventoryItemId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalSku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
