import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SIDEBAR_NAV_GROUPS,
  buildSidebarNavTree,
  filterSidebarNavTree,
  type AppSubjects,
  type ISidebarNavAdminResponse,
  type ISidebarNavFlatRow,
  type ISidebarNavigationResponse,
  type SidebarNavGroupId,
} from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { AuthService } from '../auth/auth.service';
import { BillingService } from '../billing/billing.service';
import type {
  CreateSidebarNavItemDto,
  ReorderSidebarNavItemDto,
  UpdateSidebarNavItemDto,
} from './dto/navigation.dto';

@Injectable()
export class NavigationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly billing: BillingService,
  ) {}

  assertSuperAdmin(user: IAuthUser): void {
    if (user.roleName !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Super admin only');
    }
  }

  async getForUser(user: IAuthUser): Promise<ISidebarNavigationResponse> {
    const [freshUser, entitlements, rows] = await Promise.all([
      this.auth.me(user.id),
      this.billing.resolveEntitlements(user.organizationId),
      this.loadRows(false),
    ]);
    const tree = buildSidebarNavTree(rows);
    return {
      groups: SIDEBAR_NAV_GROUPS,
      items: filterSidebarNavTree(tree, freshUser, entitlements),
    };
  }

  async listAdmin(user: IAuthUser): Promise<ISidebarNavAdminResponse> {
    this.assertSuperAdmin(user);
    const rows = await this.loadRows(true);
    return {
      groups: SIDEBAR_NAV_GROUPS,
      items: buildSidebarNavTree(rows),
    };
  }

  async create(user: IAuthUser, dto: CreateSidebarNavItemDto) {
    this.assertSuperAdmin(user);
    if (dto.parentId) {
      await this.assertParentExists(dto.parentId);
    }
    const created = await this.prisma.sidebarNavItem.create({
      data: {
        key: dto.key,
        href: dto.href,
        labelKey: dto.labelKey,
        icon: dto.icon,
        iconActive: dto.iconActive,
        group: dto.group,
        subject: dto.subject,
        roles: dto.roles ?? [],
        moduleKey: dto.moduleKey ?? null,
        parentId: dto.parentId ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
    return created;
  }

  async update(user: IAuthUser, id: string, dto: UpdateSidebarNavItemDto) {
    this.assertSuperAdmin(user);
    const existing = await this.prisma.sidebarNavItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Nav item not found');

    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === id) {
        throw new BadRequestException('Item cannot be its own parent');
      }
      await this.assertParentExists(dto.parentId);
      await this.assertNoCycle(id, dto.parentId);
    }

    return this.prisma.sidebarNavItem.update({
      where: { id },
      data: {
        href: dto.href,
        labelKey: dto.labelKey,
        icon: dto.icon,
        iconActive: dto.iconActive,
        group: dto.group,
        subject: dto.subject,
        roles: dto.roles,
        moduleKey: dto.moduleKey === undefined ? undefined : dto.moduleKey,
        parentId: dto.parentId === undefined ? undefined : dto.parentId,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });
  }

  async remove(user: IAuthUser, id: string): Promise<{ ok: true }> {
    this.assertSuperAdmin(user);
    const existing = await this.prisma.sidebarNavItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Nav item not found');
    await this.prisma.sidebarNavItem.delete({ where: { id } });
    return { ok: true };
  }

  async reorder(user: IAuthUser, dto: ReorderSidebarNavItemDto): Promise<{ ok: true }> {
    this.assertSuperAdmin(user);
    const ids = dto.items.map((i) => i.id);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      throw new BadRequestException('Duplicate ids in reorder payload');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.sidebarNavItem.update({
          where: { id: item.id },
          data: {
            parentId: item.parentId,
            sortOrder: item.sortOrder,
          },
        }),
      ),
    );
    return { ok: true };
  }

  private async loadRows(includeInactive: boolean): Promise<ISidebarNavFlatRow[]> {
    const rows = await this.prisma.sidebarNavItem.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { href: 'asc' }],
    });
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      parentId: row.parentId,
      href: row.href,
      labelKey: row.labelKey,
      icon: row.icon,
      iconActive: row.iconActive,
      group: row.group as SidebarNavGroupId,
      subject: row.subject as AppSubjects,
      roles: row.roles,
      moduleKey: row.moduleKey,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    }));
  }

  private async assertParentExists(parentId: string): Promise<void> {
    const parent = await this.prisma.sidebarNavItem.findUnique({ where: { id: parentId } });
    if (!parent) throw new BadRequestException('Parent nav item not found');
  }

  private async assertNoCycle(itemId: string, newParentId: string): Promise<void> {
    let cursor: string | null = newParentId;
    const seen = new Set<string>();
    while (cursor) {
      if (cursor === itemId) {
        throw new BadRequestException('Parent would create a cycle');
      }
      if (seen.has(cursor)) break;
      seen.add(cursor);
      const row: { parentId: string | null } | null =
        await this.prisma.sidebarNavItem.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        });
      cursor = row?.parentId ?? null;
    }
  }
}
