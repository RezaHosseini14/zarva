import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePurchaseDto {
  @ApiProperty()
  @IsString()
  supplierId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  number!: string;

  @ApiProperty()
  @IsString()
  displayDate!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  goldWeightGrams!: number;

  @ApiProperty()
  @IsString()
  amountLabel!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purity?: string;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  purityKarat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateIrt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountIrt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lineDescription?: string;
}

export class CreatePurchaseReturnDto {
  @ApiProperty()
  @IsString()
  purchaseId!: string;

  @ApiProperty()
  @IsString()
  number!: string;

  @ApiProperty()
  @IsString()
  displayDate!: string;

  @ApiProperty()
  @IsString()
  amountLabel!: string;

  @ApiPropertyOptional({ description: 'Grams to reverse; omit for full reverse' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  grams?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  purityKarat?: number;
}
