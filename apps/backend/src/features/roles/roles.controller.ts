import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';
import { ForbiddenException } from '@nestjs/common';

import { CurrentUser } from '../../common/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';

class UpdateRolePermissionsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  async list(@CurrentUser() user: IAuthUser) {
    this.assertCanManage(user);
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Permission catalog' })
  async permissions(@CurrentUser() user: IAuthUser) {
    this.assertCanManage(user);
    return this.prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { key: 'asc' }] });
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Replace role permissions' })
  async updatePermissions(
    @CurrentUser() user: IAuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    this.assertCanManage(user);
    const role = await this.prisma.role.findUniqueOrThrow({ where: { id } });
    if (role.name === 'SUPER_ADMIN' || role.name === 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Cannot modify system admin role');
    }
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    await this.prisma.rolePermission.createMany({
      data: dto.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
    });
    return this.prisma.role.findUniqueOrThrow({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
  }

  private assertCanManage(user: IAuthUser): void {
    if (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.permissions.includes('roles.manage')
    ) {
      return;
    }
    throw new ForbiddenException('Missing roles.manage');
  }
}
