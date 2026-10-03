import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

const PIECE_STATUSES = ['showcase', 'reserved', 'sold', 'workshop'] as const;

export class CreateJewelryPieceDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  sku!: string;

  @ApiPropertyOptional({ enum: PIECE_STATUSES })
  @IsOptional()
  @IsIn(PIECE_STATUSES)
  status?: (typeof PIECE_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  inventoryItemId?: string;
}

export class UpdateJewelryPieceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ enum: PIECE_STATUSES })
  @IsOptional()
  @IsIn(PIECE_STATUSES)
  status?: (typeof PIECE_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateJewelryBomLineDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  componentType!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty?: number;
}

export class CreateJewelryReservationDto {
  @ApiProperty()
  @IsDateString()
  reservedUntil!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
