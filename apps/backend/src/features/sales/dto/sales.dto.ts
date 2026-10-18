import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateNested,
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

export class CreateSaleInvoiceLineDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  weightGrams!: number;

  @ApiProperty({ example: 18 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  purityKarat!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  rateIrt!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  wageIrt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  profitIrt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxIrt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountIrt?: number;
}

export class CreateSaleInvoiceDto {
  @ApiProperty()
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 'INV-1001' })
  @IsString()
  @MinLength(1)
  number!: string;

  @ApiPropertyOptional({ enum: ['sale', 'buyback'] })
  @IsOptional()
  @IsIn(['sale', 'buyback'])
  documentKind?: 'sale' | 'buyback';

  @ApiPropertyOptional({ example: 12.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  goldWeightGrams?: number;

  @ApiPropertyOptional({ example: 850000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountIRT?: number;

  @ApiPropertyOptional({ example: 850000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  remainingIRT?: number;

  @ApiPropertyOptional({ type: [CreateSaleInvoiceLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInvoiceLineDto)
  lines?: CreateSaleInvoiceLineDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seller?: string;

  @ApiPropertyOptional({ description: 'If true, status becomes confirmed and SMS is sent' })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientRequestId?: string;
}

export class SaleCheckoutPaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ref?: string;

  @ApiProperty({ enum: ['cash', 'card', 'transfer'] })
  @IsIn(['cash', 'card', 'transfer'])
  method!: 'cash' | 'card' | 'transfer';

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amountIrt!: number;
}

export class SaleCheckoutDto {
  @ApiProperty()
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 'POS-1001' })
  @IsString()
  @MinLength(1)
  number!: string;

  @ApiPropertyOptional({ enum: ['sale', 'buyback'] })
  @IsOptional()
  @IsIn(['sale', 'buyback'])
  documentKind?: 'sale' | 'buyback';

  @ApiProperty({ type: [CreateSaleInvoiceLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleInvoiceLineDto)
  lines!: CreateSaleInvoiceLineDto[];

  @ApiProperty({ type: [SaleCheckoutPaymentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleCheckoutPaymentDto)
  payments!: SaleCheckoutPaymentDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seller?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientRequestId?: string;
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

  @ApiPropertyOptional({ description: 'Legacy label; prefer amountIrt' })
  @IsOptional()
  @IsString()
  amountLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amountIrt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayDate?: string;
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

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^09\d{9}$/)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalId?: string;
}
