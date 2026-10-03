import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaxPeriodDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  label!: string;

  @ApiProperty()
  @IsDateString()
  fromDate!: string;

  @ApiProperty()
  @IsDateString()
  toDate!: string;
}

export class UpdateTaxPeriodDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string;
}

export class GenerateTaxFilingDto {
  @ApiPropertyOptional({ enum: ['vat', 'seasonal', 'other'] })
  @IsOptional()
  @IsIn(['vat', 'seasonal', 'other'])
  kind?: 'vat' | 'seasonal' | 'other';
}

export class ExportTaxFilingDto {
  @ApiProperty({ enum: ['xml', 'csv'] })
  @IsIn(['xml', 'csv'])
  format!: 'xml' | 'csv';
}
