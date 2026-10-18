import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IBranchRow, IBranchesSummary } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import type { AssignBranchUserDto, CreateBranchDto, UpdateBranchDto } from './dto/branches.dto';

@Injectable()
export class BranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billing: BillingService,
  ) {}

  async summary(user: IAuthUser): Promise<IBranchesSummary> {
    this.assertRead(user);
    const orgId = user.organizationId;
    const [total, active] = await Promise.all([
      this.prisma.branch.count({ where: { organizationId: orgId } }),
      this.prisma.branch.count({ where: { organizationId: orgId, isActive: true } }),
    ]);
    return { total, active, inactive: total - active };
  }

  async list(user: IAuthUser): Promise<IBranchRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.branch.findMany({
      where: { organizationId: user.organizationId },
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => this.mapRow(r));
  }

  async get(user: IAuthUser, id: string): Promise<IBranchRow> {
    this.assertRead(user);
    const row = await this.findOrgBranch(user.organizationId, id);
    return this.mapRow(row);
  }

  async create(user: IAuthUser, dto: CreateBranchDto): Promise<IBranchRow> {
    this.assertWrite(user);
    await this.assertBranchQuota(user.organizationId);
    const r = await this.prisma.branch.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        code: dto.code ?? '',
        city: dto.city ?? '',
        address: dto.address ?? '',
      },
      include: { _count: { select: { users: true } } },
    });
    return this.mapRow(r);
  }

  async update(user: IAuthUser, id: string, dto: UpdateBranchDto): Promise<IBranchRow> {
    this.assertWrite(user);
    await this.findOrgBranch(user.organizationId, id);
    const r = await this.prisma.branch.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        city: dto.city,
        address: dto.address,
        isActive: dto.isActive,
      },
      include: { _count: { select: { users: true } } },
    });
    return this.mapRow(r);
  }

  async remove(user: IAuthUser, id: string): Promise<{ ok: true }> {
    this.assertWrite(user);
    const row = await this.findOrgBranch(user.organizationId, id);
    if (row._count.users > 0) {
      throw new BadRequestException('Branch has assigned users');
    }
    await this.prisma.branch.delete({ where: { id } });
    return { ok: true };
  }

  async assignUser(
    user: IAuthUser,
    branchId: string,
    dto: AssignBranchUserDto,
  ): Promise<{ ok: true }> {
    this.assertWrite(user);
    await this.findOrgBranch(user.organizationId, branchId);
    const target = await this.prisma.user.findFirst({
      where: { id: dto.userId, organizationId: user.organizationId },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { branchId },
    });
    return { ok: true };
  }

  private async assertBranchQuota(organizationId: string): Promise<void> {
    const entitlements = await this.billing.resolveEntitlements(organizationId);
    const count = await this.prisma.branch.count({ where: { organizationId } });
    if (count >= entitlements.maxBranches) {
      throw new ForbiddenException('Branch limit reached for current plan');
    }
  }

  private async findOrgBranch(organizationId: string, id: string) {
    const row = await this.prisma.branch.findFirst({
      where: { id, organizationId },
      include: { _count: { select: { users: true } } },
    });
    if (!row) {
      throw new NotFoundException('Branch not found');
    }
    return row;
  }

  private mapRow(r: {
    id: string;
    name: string;
    code: string;
    city: string;
    address: string;
    isActive: boolean;
    _count: { users: number };
  }): IBranchRow {
    return {
      id: r.id,
      a: r.name,
      b: r.code || '—',
      c: r.city || r.address || '—',
      code: r.code,
      city: r.city,
      isActive: r.isActive,
      userCount: r._count.users,
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('branches.read')) {
      throw new ForbiddenException('Missing branches.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('branches.manage')) {
      throw new ForbiddenException('Missing branches.manage');
    }
  }

  private isAdmin(user: IAuthUser): boolean {
    return (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN'
    );
  }
}
