import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import type { IAuditRow, IOrgProfile, IOrgUserRow } from '@zarva/shared';

import { CurrentUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';

class UpdateOrgProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('organization')
export class OrganizationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Current organization profile' })
  async get(@CurrentUser() user: IAuthUser): Promise<IOrgProfile> {
    const org = await this.prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
    });
    return {
      id: org.id,
      name: org.name,
      taxId: org.taxId,
      phone: org.phone,
      address: org.address,
      slug: org.slug,
    };
  }

  @Put()
  @ApiOperation({ summary: 'Update organization profile' })
  async update(
    @CurrentUser() user: IAuthUser,
    @Body() dto: UpdateOrgProfileDto,
  ): Promise<IOrgProfile> {
    const org = await this.prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        name: dto.name,
        taxId: dto.taxId ?? undefined,
        phone: dto.phone ?? undefined,
        address: dto.address ?? undefined,
      },
    });
    return {
      id: org.id,
      name: org.name,
      taxId: org.taxId,
      phone: org.phone,
      address: org.address,
      slug: org.slug,
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'List organization users' })
  async users(@CurrentUser() user: IAuthUser): Promise<IOrgUserRow[]> {
    const rows = await this.prisma.user.findMany({
      where: { organizationId: user.organizationId },
      include: { role: true },
      orderBy: { email: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.email,
      b: r.role.name,
      c: r.totpEnabled ? '2fa' : 'active',
    }));
  }

  @Get('audit')
  @ApiOperation({ summary: 'List audit log' })
  async audit(@CurrentUser() user: IAuthUser): Promise<IAuditRow[]> {
    const rows = await this.prisma.auditLog.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.createdAt.toISOString().slice(0, 10),
      b: r.action,
      c: r.userId ?? '—',
    }));
  }
}
