import { ForbiddenException, Injectable } from '@nestjs/common';
import type { IArtisanRow, IProductionBatchRow, IWorkshopOrderRow } from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type {
  CreateArtisanDto,
  CreateProductionBatchDto,
  CreateWorkshopOrderDto,
} from './dto/workshop.dto';

@Injectable()
export class WorkshopService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(user: IAuthUser): Promise<IWorkshopOrderRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.workshopOrder.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      order: r.orderNumber,
      customer: r.customerName,
      product: r.product,
      artisan: r.artisan,
      due: r.dueLabel,
      status: r.statusLabel,
      progress: r.progress,
    }));
  }

  async createOrder(user: IAuthUser, dto: CreateWorkshopOrderDto): Promise<IWorkshopOrderRow> {
    this.assertWrite(user);
    const r = await this.prisma.workshopOrder.create({
      data: {
        organizationId: user.organizationId,
        orderNumber: dto.orderNumber,
        customerName: dto.customerName,
        product: dto.product,
        artisan: dto.artisan,
        artisanId: dto.artisanId,
        dueLabel: dto.dueLabel,
        statusLabel: dto.statusLabel ?? 'in_progress',
        progress: dto.progress ?? 0,
      },
    });
    return {
      id: r.id,
      order: r.orderNumber,
      customer: r.customerName,
      product: r.product,
      artisan: r.artisan,
      due: r.dueLabel,
      status: r.statusLabel,
      progress: r.progress,
    };
  }

  async listArtisans(user: IAuthUser): Promise<IArtisanRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.artisan.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.name,
      b: r.skill,
      c: r.statusLabel,
    }));
  }

  async createArtisan(user: IAuthUser, dto: CreateArtisanDto): Promise<IArtisanRow> {
    this.assertWrite(user);
    const r = await this.prisma.artisan.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        skill: dto.skill ?? '',
        statusLabel: dto.statusLabel ?? 'active',
      },
    });
    return { id: r.id, a: r.name, b: r.skill, c: r.statusLabel };
  }

  async listProduction(user: IAuthUser): Promise<IProductionBatchRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.productionBatch.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      a: r.code,
      b: r.product,
      c: r.progressLabel,
    }));
  }

  async createProduction(
    user: IAuthUser,
    dto: CreateProductionBatchDto,
  ): Promise<IProductionBatchRow> {
    this.assertWrite(user);
    const r = await this.prisma.productionBatch.create({
      data: {
        organizationId: user.organizationId,
        code: dto.code,
        product: dto.product,
        progressLabel: dto.progressLabel ?? '0%',
      },
    });
    return { id: r.id, a: r.code, b: r.product, c: r.progressLabel };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('workshop.read')) {
      throw new ForbiddenException('Missing workshop.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('workshop.manage')) {
      throw new ForbiddenException('Missing workshop.manage');
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
