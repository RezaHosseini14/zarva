import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class RefreshAiRulesDto {
  @ApiPropertyOptional({ description: 'Qty at or below triggers low-stock insight' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  thresholdQty?: number;
}

export class AiSummarizeDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  text!: string;
}
