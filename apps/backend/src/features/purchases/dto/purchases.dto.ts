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
}
