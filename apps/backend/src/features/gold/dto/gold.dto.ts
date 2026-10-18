import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGoldTxnDto {
  @ApiProperty({ description: 'Audited stock adjust (grams)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  grams!: number;

  @ApiProperty({ example: 18 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  purityKarat!: number;

  @ApiProperty({ enum: ['in', 'out'] })
  @IsIn(['in', 'out'])
  direction!: 'in' | 'out';

  @ApiProperty()
  @IsString()
  @MinLength(3)
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateIrt?: number;
}

export class LockGoldRateDto {
  @ApiProperty({ example: '2026-10-03' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  businessDate!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  buyRateIrt!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  sellRateIrt!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;
}

export class CorrectGoldRateDto {
  @ApiProperty({ example: '2026-10-03' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  businessDate!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  buyRateIrt!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  sellRateIrt!: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  reason!: string;
}

export class GoldCalculatorDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  weight!: number;

  @ApiProperty({ description: 'Purity ratio e.g. 0.75 for 18k' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  purity!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  rate!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fee?: number;
}

export class CreateGoldPurityDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty()
  @IsString()
  karat!: string;

  @ApiProperty()
  @IsString()
  ratioLabel!: string;
}

export class CreateGoldLotDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  weightLabel!: string;

  @ApiPropertyOptional({ description: 'Numeric grams (preferred over parsing weightLabel)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  grams?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  purityKarat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusLabel?: string;
}
