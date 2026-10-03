import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateChartAccountDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ enum: ['asset', 'liability', 'equity', 'income', 'expense'] })
  @IsIn(['asset', 'liability', 'equity', 'income', 'expense'])
  type!: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
}

export class JournalLineInputDto {
  @ApiProperty()
  @IsString()
  accountId!: string;

  @ApiProperty({ example: '1000000' })
  @IsString()
  debit!: string;

  @ApiProperty({ example: '0' })
  @IsString()
  credit!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  memo?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  number!: string;

  @ApiProperty()
  @IsString()
  date!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ type: [JournalLineInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineInputDto)
  lines!: JournalLineInputDto[];
}
