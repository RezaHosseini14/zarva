import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  SIDEBAR_NAV_GROUPS,
  SIDEBAR_NAV_ICONS,
  type AppSubjects,
} from '@zarva/shared';

const GROUP_IDS = SIDEBAR_NAV_GROUPS.map((g) => g.id);
const SUBJECTS: ReadonlyArray<AppSubjects> = [
  'Dashboard',
  'Sale',
  'Purchase',
  'Inventory',
  'GoldItem',
  'Customer',
  'Supplier',
  'Invoice',
  'Journal',
  'Payment',
  'Report',
  'Branch',
  'User',
  'Role',
  'Setting',
  'Theme',
  'Notification',
  'Media',
  'AuditLog',
  'Billing',
  'Plan',
  'Subscription',
  'Platform',
  'Organization',
  'Jewelry',
  'Tax',
  'Workshop',
  'AiInsight',
  'Commerce',
  'Integration',
  'all',
];

export class CreateSidebarNavItemDto {
  @ApiProperty({ example: 'custom-reports' })
  @IsString()
  @MinLength(1)
  key!: string;

  @ApiProperty({ example: '/reports/custom' })
  @IsString()
  @MinLength(1)
  href!: string;

  @ApiProperty({ example: 'reports' })
  @IsString()
  @MinLength(1)
  labelKey!: string;

  @ApiProperty({ example: 'chart-linear' })
  @IsIn([...SIDEBAR_NAV_ICONS])
  icon!: string;

  @ApiProperty({ example: 'chart-bold' })
  @IsIn([...SIDEBAR_NAV_ICONS])
  iconActive!: string;

  @ApiProperty({ enum: GROUP_IDS })
  @IsIn([...GROUP_IDS])
  group!: string;

  @ApiProperty({ enum: SUBJECTS })
  @IsIn([...SUBJECTS])
  subject!: string;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  moduleKey?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSidebarNavItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  href?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  labelKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([...SIDEBAR_NAV_ICONS])
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([...SIDEBAR_NAV_ICONS])
  iconActive?: string;

  @ApiPropertyOptional({ enum: GROUP_IDS })
  @IsOptional()
  @IsIn([...GROUP_IDS])
  group?: string;

  @ApiPropertyOptional({ enum: SUBJECTS })
  @IsOptional()
  @IsIn([...SUBJECTS])
  subject?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  moduleKey?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderSidebarNavEntryDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty({ nullable: true })
  @ValidateIf((_, v) => v !== null)
  @IsUUID()
  parentId!: string | null;

  @ApiProperty()
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

export class ReorderSidebarNavItemDto {
  @ApiProperty({ type: [ReorderSidebarNavEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderSidebarNavEntryDto)
  items!: ReorderSidebarNavEntryDto[];
}
