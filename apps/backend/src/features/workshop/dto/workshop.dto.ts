import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateArtisanDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  skill?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusLabel?: string;
}

export class CreateWorkshopOrderDto {
  @ApiProperty()
  @IsString()
  orderNumber!: string;

  @ApiProperty()
  @IsString()
  customerName!: string;

  @ApiProperty()
  @IsString()
  product!: string;

  @ApiProperty()
  @IsString()
  artisan!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  artisanId?: string;

  @ApiProperty()
  @IsString()
  dueLabel!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statusLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}

export class CreateProductionBatchDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  product!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  progressLabel?: string;
}
