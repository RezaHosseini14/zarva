import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWarehouseDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;
}

export class CreateInventoryItemDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty()
  @IsString()
  sku!: string;

  @ApiProperty()
  @IsString()
  barcode!: string;

  @ApiProperty()
  @IsString()
  weight!: string;

  @ApiProperty()
  @IsString()
  purity!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  qty!: number;

  @ApiProperty()
  @IsString()
  location!: string;

  @ApiProperty()
  @IsString()
  valueLabel!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ enum: ['gold', 'jewelry', 'coin', 'raw'] })
  @IsOptional()
  @IsIn(['gold', 'jewelry', 'coin', 'raw'])
  kind?: 'gold' | 'jewelry' | 'coin' | 'raw';
}

export class CreateStockMovementDto {
  @ApiProperty()
  @IsString()
  itemId!: string;

  @ApiProperty({ enum: ['IN', 'OUT', 'TRANSFER', 'ADJUST'] })
  @IsIn(['IN', 'OUT', 'TRANSFER', 'ADJUST'])
  kind!: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  qty!: number;

  @ApiProperty()
  @IsString()
  displayDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromWarehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toWarehouseId?: string;
}

export class CreateAdjustmentDto {
  @ApiProperty()
  @IsString()
  itemId!: string;

  @ApiProperty({ description: 'Signed qty delta' })
  @Type(() => Number)
  @IsInt()
  qtyDelta!: number;

  @ApiProperty()
  @IsString()
  displayDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
