import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IJewelryBomLineRow,
  IJewelryPieceRow,
  IJewelryReservationRow,
} from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type {
  CreateJewelryBomLineDto,
  CreateJewelryPieceDto,
  CreateJewelryReservationDto,
  UpdateJewelryPieceDto,
} from './dto/jewelry.dto';

@Injectable()
export class JewelryService {
  constructor(private readonly prisma: PrismaService) {}

  async listPieces(user: IAuthUser): Promise<IJewelryPieceRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.jewelryPiece.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => this.mapPiece(r));
  }

  async createPiece(user: IAuthUser, dto: CreateJewelryPieceDto): Promise<IJewelryPieceRow> {
    this.assertWrite(user);
    const r = await this.prisma.jewelryPiece.create({
      data: {
        organizationId: user.organizationId,
        title: dto.title,
        sku: dto.sku,
        status: dto.status ?? 'showcase',
        weight: dto.weight ?? '',
        purity: dto.purity ?? '',
        inventoryItemId: dto.inventoryItemId,
      },
    });
    return this.mapPiece(r);
  }

  async updatePiece(
    user: IAuthUser,
    id: string,
    dto: UpdateJewelryPieceDto,
  ): Promise<IJewelryPieceRow> {
    this.assertWrite(user);
    await this.findOrgPiece(user.organizationId, id);
    const r = await this.prisma.jewelryPiece.update({
      where: { id },
      data: {
        title: dto.title,
        status: dto.status,
        weight: dto.weight,
        purity: dto.purity,
        notes: dto.notes,
      },
    });
    return this.mapPiece(r);
  }

  async removePiece(user: IAuthUser, id: string): Promise<{ ok: true }> {
    this.assertWrite(user);
    await this.findOrgPiece(user.organizationId, id);
    await this.prisma.jewelryPiece.delete({ where: { id } });
    return { ok: true };
  }

  async listBomLines(user: IAuthUser, pieceId: string): Promise<IJewelryBomLineRow[]> {
    this.assertRead(user);
    await this.findOrgPiece(user.organizationId, pieceId);
    const rows = await this.prisma.jewelryBomLine.findMany({
      where: { pieceId },
      orderBy: { id: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      componentType: r.componentType,
      description: r.description,
      weight: r.weight,
      carat: r.carat,
      qty: r.qty,
    }));
  }

  async addBomLine(
    user: IAuthUser,
    pieceId: string,
    dto: CreateJewelryBomLineDto,
  ): Promise<IJewelryBomLineRow> {
    this.assertWrite(user);
    await this.findOrgPiece(user.organizationId, pieceId);
    const r = await this.prisma.jewelryBomLine.create({
      data: {
        pieceId,
        componentType: dto.componentType,
        description: dto.description,
        weight: dto.weight ?? '',
        carat: dto.carat ?? '',
        qty: dto.qty ?? 1,
      },
    });
    return {
      id: r.id,
      componentType: r.componentType,
      description: r.description,
      weight: r.weight,
      carat: r.carat,
      qty: r.qty,
    };
  }

  async createReservation(
    user: IAuthUser,
    pieceId: string,
    dto: CreateJewelryReservationDto,
  ): Promise<IJewelryReservationRow> {
    this.assertWrite(user);
    const piece = await this.findOrgPiece(user.organizationId, pieceId);
    const active = await this.prisma.jewelryReservation.findFirst({
      where: {
        pieceId,
        status: 'active',
        reservedUntil: { gt: new Date() },
      },
    });
    if (active) {
      throw new ConflictException('Piece already has an active reservation');
    }
    const r = await this.prisma.jewelryReservation.create({
      data: {
        pieceId: piece.id,
        customerId: dto.customerId,
        reservedUntil: new Date(dto.reservedUntil),
        status: 'active',
      },
    });
    await this.prisma.jewelryPiece.update({
      where: { id: piece.id },
      data: { status: 'reserved' },
    });
    return {
      id: r.id,
      pieceId: r.pieceId,
      customerId: r.customerId,
      reservedUntil: r.reservedUntil.toISOString(),
      status: r.status,
    };
  }

  private async findOrgPiece(organizationId: string, id: string) {
    const row = await this.prisma.jewelryPiece.findFirst({
      where: { id, organizationId },
    });
    if (!row) {
      throw new NotFoundException('Jewelry piece not found');
    }
    return row;
  }

  private mapPiece(r: {
    id: string;
    title: string;
    sku: string;
    status: 'showcase' | 'reserved' | 'sold' | 'workshop';
    weight: string;
    purity: string;
    inventoryItemId: string | null;
  }): IJewelryPieceRow {
    return {
      id: r.id,
      a: r.title,
      b: r.sku,
      c: r.status,
      sku: r.sku,
      status: r.status,
      weight: r.weight,
      purity: r.purity,
      inventoryItemId: r.inventoryItemId,
    };
  }

  private assertRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('jewelry.read')) {
      throw new ForbiddenException('Missing jewelry.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (!user.permissions.includes('jewelry.manage')) {
      throw new ForbiddenException('Missing jewelry.manage');
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
