import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntegrationDto {
  @ApiProperty({ enum: ['device', 'scale', 'api', 'webhook'] })
  @IsIn(['device', 'scale', 'api', 'webhook'])
  kind!: 'device' | 'scale' | 'api' | 'webhook';

  @ApiProperty()
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
