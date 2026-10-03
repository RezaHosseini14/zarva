import {
  IsBoolean,
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

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: '09121234567' })
  @IsString()
  @Matches(/^09\d{9}$/)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  address!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalId?: string;
}

export class CreateSaleInvoiceDto {
  @ApiProperty()
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 'INV-1001' })
  @IsString()
  @MinLength(1)
  number!: string;

  @ApiProperty({ example: 12.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  goldWeightGrams!: number;

  @ApiProperty({ example: 850000000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amountIRT!: number;

  @ApiPropertyOptional({ example: 850000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  remainingIRT?: number;

  @ApiPropertyOptional({ description: 'If true, status becomes confirmed and SMS is sent' })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}

export class UpdateSaleStatusDto {
  @ApiProperty({ enum: ['confirmed', 'ready', 'completed', 'void'] })
  @IsIn(['confirmed', 'ready', 'completed', 'void'])
  status!: 'confirmed' | 'ready' | 'completed' | 'void';
}

export class UpdateSalePaymentDto {
  @ApiProperty({ enum: ['unpaid', 'partial', 'paid'] })
  @IsIn(['unpaid', 'partial', 'paid'])
  paymentStatus!: 'unpaid' | 'partial' | 'paid';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  remainingIRT?: number;
}

export class CreateSalePaymentRecordDto {
  @ApiProperty()
  @IsString()
  invoiceId!: string;

  @ApiProperty()
  @IsString()
  ref!: string;

  @ApiProperty()
  @IsString()
  method!: string;

  @ApiProperty()
  @IsString()
  amountLabel!: string;

  @ApiProperty()
  @IsString()
  displayDate!: string;
}

export class CreateSaleReturnDto {
  @ApiProperty()
  @IsString()
  invoiceId!: string;

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
