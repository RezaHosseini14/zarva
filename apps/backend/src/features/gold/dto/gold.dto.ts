import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGoldTxnDto {
  @ApiProperty()
  @IsString()
  displayDate!: string;

  @ApiProperty()
  @IsString()
  typeLabel!: string;

  @ApiProperty()
  @IsString()
  weight!: string;

  @ApiProperty()
  @IsString()
  purity!: string;

  @ApiProperty()
  @IsString()
  fineGold!: string;

  @ApiProperty()
  @IsString()
  counterparty!: string;

  @ApiProperty()
  @IsString()
  reference!: string;
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusLabel?: string;
}
