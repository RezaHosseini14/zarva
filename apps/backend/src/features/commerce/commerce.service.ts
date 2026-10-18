import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  ICommerceChannelRow,
  ICommerceListingRow,
  ICommerceSummary,
} from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type {
  CreateCommerceChannelDto,
  CreateCommerceListingDto,
  UpdateCommerceChannelDto,
} from './dto/commerce.dto';

@Injectable()
export class CommerceService {
  constructor(private readonly prisma: PrismaService) {}

  async listChannels(user: IAuthUser): Promise<ICommerceChannelRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.commerceChannel.findMany({
      where: { organizationId: user.organizationId },
      include: { _count: { select: { listings: true } } },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => this.mapChannel(r));
  }

  async createChannel(user: IAuthUser, dto: CreateCommerceChannelDto): Promise<ICommerceChannelRow> {
    this.assertWrite(user);
    const r = await this.prisma.commerceChannel.create({
      data: {
        organizationId: user.organizationId,
        name: dto.name,
        type: dto.type ?? 'other',
        status: dto.status ?? 'draft',
      },
      include: { _count: { select: { listings: true } } },
    });
    return this.mapChannel(r);
  }

  async updateChannel(
    user: IAuthUser,
    id: string,
    dto: UpdateCommerceChannelDto,
  ): Promise<ICommerceChannelRow> {
    this.assertWrite(user);
    await this.findOrgChannel(user.organizationId, id);
    const r = await this.prisma.commerceChannel.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        status: dto.status,
      },
      include: { _count: { select: { listings: true } } },
    });
    return this.mapChannel(r);
  }

  async removeChannel(user: IAuthUser, id: string): Promise<{ ok: true }> {
    this.assertWrite(user);
    await this.findOrgChannel(user.organizationId, id);
    await this.prisma.commerceChannel.delete({ where: { id } });
    return { ok: true };
  }

  async createListing(
    user: IAuthUser,
    dto: CreateCommerceListingDto,
  ): Promise<ICommerceListingRow> {
    this.assertWrite(user);
    const channel = await this.findOrgChannel(user.organizationId, dto.channelId);
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: dto.inventoryItemId, organizationId: user.organizationId },
    });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    const r = await this.prisma.commerceListing.create({
      data: {
        channelId: channel.id,
        inventoryItemId: item.id,
        status: dto.status ?? 'active',
        externalSku: dto.externalSku ?? '',
      },
      include: { inventoryItem: true },
    });
    return this.mapListing(r);
  }

  async summary(user: IAuthUser): Promise<ICommerceSummary> {
    this.assertRead(user);
    const channels = await this.prisma.commerceChannel.findMany({
      where: { organizationId: user.organizationId },
      select: { status: true },
    });
    const listings = await this.prisma.commerceListing.count({
      where: { channel: { organizationId: user.organizationId } },
    });
    const activeChannels = channels.filter((c) => c.status === 'active').length;
    return {
      channels: channels.length,
      listings,
      activeChannels,
    };
  }

  private async findOrgChannel(organizationId: string, id: string) {
    const row = await this.prisma.commerceChannel.findFirst({
      where: { id, organizationId },
    });
    if (!row) {
      throw new NotFoundException('Channel not found');
    }
    return row;
  }

  private mapChannel(r: {
    id: string;
    name: string;
    type: string;
    status: string;
    _count: { listings: number };
  }): ICommerceChannelRow {
    return {
      id: r.id,
      a: r.name,
      b: r.type,
      c: r.status,
      type: r.type,
      status: r.status,
      listingCount: r._count.listings,
    };
  }

  private mapListing(r: {
    id: string;
    channelId: string;
    inventoryItemId: string;
    status: string;
    externalSku: string;
    inventoryItem: { name: string; sku: string };
  }): ICommerceListingRow {
    return {
      id: r.id,
      a: r.inventoryItem.name,
      b: r.inventoryItem.sku,
      c: r.status,
      channelId: r.channelId,
      inventoryItemId: r.inventoryItemId,
      status: r.status,
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('commerce.read')) {
      throw new ForbiddenException('Missing commerce.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('commerce.manage')) {
      throw new ForbiddenException('Missing commerce.manage');
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
