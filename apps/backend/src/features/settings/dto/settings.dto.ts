import { IsObject, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsSectionDto {
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  @IsObject()
  values!: Record<string, string>;
}

export class UpdateOrgProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsString()
  taxId!: string;

  @ApiProperty()
  @IsString()
  phone!: string;

  @ApiProperty()
  @IsString()
  address!: string;
}
