import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ICustomersSummary,
  IGoldLedgerLine,
  ISaleCheckoutResult,
  ISaleCustomer,
  ISaleInvoice,
  ISaleInvoiceDetailDto,
  ISaleInvoiceTotalsDto,
  ISalePayment,
  ISalePaymentRow,
  ISaleReturnRow,
  ISalesSummary,
  SaleDocumentKind,
  SaleInvoiceStatus,
  SalePaymentStatus,
} from '@zarva/shared';
import { businessDateKey } from '@zarva/shared';

import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { GoldLedgerService } from '../gold/gold-ledger.service';
import { normalizeIranPhone } from '../sms/phone.util';
import { SaleSmsNotifier } from './sale-sms.notifier';
import type {
  CreateCustomerDto,
  CreateSaleInvoiceDto,
  CreateSaleInvoiceLineDto,
  CreateSalePaymentRecordDto,
  CreateSaleReturnDto,
  SaleCheckoutDto,
  UpdateCustomerDto,
  UpdateSalePaymentDto,
  UpdateSaleStatusDto,
} from './dto/sales.dto';

type SaleWithCustomer = {
  id: string;
  number: string;
  documentKind: SaleDocumentKind;
  status: SaleInvoiceStatus;
  paymentStatus: SalePaymentStatus;
  goldWeightGrams: { toString(): string };
  amountIRT: { toString(): string };
  remainingIRT: { toString(): string };
  seller: string;
  displayDate: string;
  amountLabel: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopGuildId: string;
  totalsJson: unknown;
  ledgerPostedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    phone: string;
    address: string;
    nationalId: string | null;
    balanceLabel: string;
    lastTxnLabel: string;
    totalLabel: string;
    partyStatus: string;
  };
  lines?: Array<{
    id: string;
    description: string;
    weight: string;
    purity: string;
    dailyRate: string;
    goldValue: string;
    wage: string;
    profit: string;
    tax: string;
    lineTotal: string;
    weightGrams?: { toString(): string } | number;
    purityKarat?: { toString(): string } | number;
    rateIrt?: { toString(): string } | number;
  }>;
};

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly saleSms: SaleSmsNotifier,
    private readonly goldLedger: GoldLedgerService,
  ) {}

  async createCustomer(user: IAuthUser, dto: CreateCustomerDto): Promise<ISaleCustomer> {
    this.assertCanWrite(user);
    let phone: string;
    try {
      phone = normalizeIranPhone(dto.phone);
    } catch {
      throw new BadRequestException('Invalid phone number');
    }
    try {
      const row = await this.prisma.customer.create({
        data: {
          organizationId: user.organizationId,
          name: dto.name.trim(),
          phone,
          address: dto.address.trim(),
          nationalId: dto.nationalId?.trim() || null,
        },
      });
      return this.mapCustomer(row);
    } catch {
      throw new ConflictException('Customer phone already exists in organization');
    }
  }

  async listCustomers(user: IAuthUser): Promise<ISaleCustomer[]> {
    this.assertCanRead(user);
    const rows = await this.prisma.customer.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapCustomer(r));
  }

  async customersSummary(user: IAuthUser): Promise<ICustomersSummary> {
    this.assertCanRead(user);
    const orgId = user.organizationId;
    const [count, openAgg, lifeAgg] = await Promise.all([
      this.prisma.customer.count({ where: { organizationId: orgId } }),
      this.prisma.saleInvoice.aggregate({
        where: {
          organizationId: orgId,
          status: { not: 'void' },
          paymentStatus: { not: 'paid' },
        },
        _sum: { remainingIRT: true },
      }),
      this.prisma.saleInvoice.aggregate({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { not: 'void' },
        },
        _sum: { amountIRT: true },
      }),
    ]);
    return {
      count,
      openReceivablesIrt: Number(openAgg._sum.remainingIRT ?? 0),
      lifetimeSalesIrt: Number(lifeAgg._sum.amountIRT ?? 0),
    };
  }

  async summary(user: IAuthUser): Promise<ISalesSummary> {
    this.assertCanRead(user);
    const orgId = user.organizationId;
    const today = businessDateKey();
    const [todayAgg, invoiceCount, unpaidCount, avgAgg] = await Promise.all([
      this.prisma.saleInvoice.aggregate({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { not: 'void' },
          displayDate: today,
        },
        _sum: { amountIRT: true },
      }),
      this.prisma.saleInvoice.count({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { not: 'void' },
        },
      }),
      this.prisma.saleInvoice.count({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { not: 'void' },
          paymentStatus: { not: 'paid' },
        },
      }),
      this.prisma.saleInvoice.aggregate({
        where: {
          organizationId: orgId,
          documentKind: 'sale',
          status: { not: 'void' },
        },
        _avg: { amountIRT: true },
      }),
    ]);
    return {
      todayAmountIrt: Number(todayAgg._sum.amountIRT ?? 0),
      invoiceCount,
      unpaidCount,
      avgAmountIrt: Math.round(Number(avgAgg._avg.amountIRT ?? 0)),
    };
  }

  async getCustomer(user: IAuthUser, id: string): Promise<ISaleCustomer> {
    this.assertCanRead(user);
    const row = await this.prisma.customer.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!row) {
      throw new NotFoundException('Customer not found');
    }
    const invoices = await this.prisma.saleInvoice.findMany({
      where: {
        organizationId: user.organizationId,
        customerId: id,
        status: { not: 'void' },
      },
      include: { payments: true },
    });
    const totalSalesIrt = invoices
      .filter((i) => i.documentKind === 'sale')
      .reduce((s, i) => s + Number(i.amountIRT), 0);
    const totalPaidIrt = invoices.reduce(
      (s, i) => s + i.payments.reduce((ps, p) => ps + Number(p.amountIrt || 0), 0),
      0,
    );
    const openRemainingIrt = invoices.reduce(
      (s, i) => s + Number(i.remainingIRT || 0),
      0,
    );
    return {
      ...this.mapCustomer(row),
      invoiceCount: invoices.length,
      totalSalesIrt,
      totalPaidIrt,
      openRemainingIrt,
      balanceLabel: String(openRemainingIrt),
      totalLabel: String(totalSalesIrt),
      lastTxnLabel: invoices[0]?.displayDate || row.lastTxnLabel,
    };
  }

  async updateCustomer(
    user: IAuthUser,
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<ISaleCustomer> {
    this.assertCanWrite(user);
    const existing = await this.prisma.customer.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!existing) throw new NotFoundException('Customer not found');

    let phone = existing.phone;
    if (dto.phone) {
      try {
        phone = normalizeIranPhone(dto.phone);
      } catch {
        throw new BadRequestException('Invalid phone number');
      }
    }

    try {
      const row = await this.prisma.customer.update({
        where: { id },
        data: {
          name: dto.name?.trim() ?? undefined,
          phone,
          address: dto.address?.trim() ?? undefined,
          nationalId:
            dto.nationalId !== undefined
              ? dto.nationalId.trim() || null
              : undefined,
        },
      });
      return this.mapCustomer(row);
    } catch {
      throw new ConflictException('Customer phone already exists in organization');
    }
  }

  async createInvoice(user: IAuthUser, dto: CreateSaleInvoiceDto): Promise<ISaleInvoice> {
    this.assertCanWrite(user);
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, organizationId: user.organizationId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const documentKind: SaleDocumentKind = dto.documentKind ?? 'sale';
    const displayDate = businessDateKey(dto.displayDate || businessDateKey());
    let lineInputs = this.resolveLines(dto);

    if (dto.confirm) {
      await this.goldLedger.assertBusinessDayOpen(user.organizationId, displayDate);
      const locked = await this.goldLedger.getLockedRate(
        user.organizationId,
        displayDate,
      );
      lineInputs = this.applyForcedRate(lineInputs, documentKind, locked);
    }

    const goldWeightGrams = lineInputs.reduce((s, l) => s + l.weightGrams, 0);
    const amountIRT = lineInputs.reduce((s, l) => s + l.lineTotalIrt, 0);
    if (goldWeightGrams <= 0 || amountIRT < 0) {
      throw new BadRequestException('Invoice must include gold weight and amount');
    }

    const status: SaleInvoiceStatus = dto.confirm ? 'confirmed' : 'draft';
    const remaining =
      dto.remainingIRT !== undefined ? dto.remainingIRT : amountIRT;

    try {
      const invoice = await this.prisma.$transaction(async (tx) => {
        const created = await this.insertInvoice(tx, {
          organizationId: user.organizationId,
          customerId: customer.id,
          number: dto.number.trim(),
          documentKind,
          status,
          goldWeightGrams,
          amountIRT,
          remainingIRT: remaining,
          displayDate,
          seller: dto.seller?.trim() || '—',
          lineInputs,
          clientRequestId: dto.clientRequestId,
        });

        if (status === 'confirmed') {
          await this.postInvoiceLedger(tx, created);
          await tx.saleInvoice.update({
            where: { id: created.id },
            data: { ledgerPostedAt: new Date() },
          });
        }

        return created;
      });

      if (status === 'confirmed') {
        await this.saleSms.notify('confirmed', this.smsPayload(invoice));
      }

      return this.mapInvoice(invoice);
    } catch (e) {
      if (
        e instanceof BadRequestException ||
        e instanceof ConflictException ||
        e instanceof NotFoundException
      ) {
        throw e;
      }
      throw new ConflictException('Invoice number already exists');
    }
  }

  async checkout(
    user: IAuthUser,
    dto: SaleCheckoutDto,
  ): Promise<ISaleCheckoutResult> {
    this.assertCanWrite(user);

    if (dto.clientRequestId) {
      const prior = await this.prisma.saleInvoice.findFirst({
        where: {
          organizationId: user.organizationId,
          clientRequestId: dto.clientRequestId,
        },
        include: { customer: true, payments: true },
      });
      if (prior) {
        return {
          invoice: this.mapInvoice(prior),
          payments: prior.payments.map((p) => this.mapPaymentRow(p)),
        };
      }
    }

    if (!dto.lines?.length) {
      throw new BadRequestException('Checkout requires lines');
    }
    if (!dto.payments?.length) {
      throw new BadRequestException('Checkout requires at least one payment');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, organizationId: user.organizationId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const documentKind: SaleDocumentKind = dto.documentKind ?? 'sale';
    const displayDate = businessDateKey(dto.displayDate || businessDateKey());
    await this.goldLedger.assertBusinessDayOpen(user.organizationId, displayDate);
    const locked = await this.goldLedger.getLockedRate(
      user.organizationId,
      displayDate,
    );

    let lineInputs = dto.lines.map((l) => this.computeLine(l));
    lineInputs = this.applyForcedRate(lineInputs, documentKind, locked);

    const goldWeightGrams = lineInputs.reduce((s, l) => s + l.weightGrams, 0);
    const amountIRT = lineInputs.reduce((s, l) => s + l.lineTotalIrt, 0);
    if (goldWeightGrams <= 0 || amountIRT < 0) {
      throw new BadRequestException('Invoice must include gold weight and amount');
    }

    const paySum = dto.payments.reduce((s, p) => s + p.amountIrt, 0);
    if (paySum > amountIRT + 0.5) {
      throw new BadRequestException('Payments exceed invoice total');
    }
    if (paySum <= 0) {
      throw new BadRequestException('Payment total must be positive');
    }

    const remainingIRT = Math.max(0, amountIRT - paySum);
    const paymentStatus: SalePaymentStatus =
      remainingIRT <= 0 ? 'paid' : paySum > 0 ? 'partial' : 'unpaid';

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const created = await this.insertInvoice(tx, {
          organizationId: user.organizationId,
          customerId: customer.id,
          number: dto.number.trim(),
          documentKind,
          status: 'confirmed',
          goldWeightGrams,
          amountIRT,
          remainingIRT,
          displayDate,
          seller: dto.seller?.trim() || '—',
          lineInputs,
          clientRequestId: dto.clientRequestId,
          paymentStatus,
        });

        await this.postInvoiceLedger(tx, created);
        await tx.saleInvoice.update({
          where: { id: created.id },
          data: { ledgerPostedAt: new Date() },
        });

        const payments: ISalePayment[] = [];
        for (const [i, p] of dto.payments.entries()) {
          const row = await tx.salePayment.create({
            data: {
              organizationId: user.organizationId,
              invoiceId: created.id,
              ref: p.ref?.trim() || `PAY-${dto.number.trim()}-${i + 1}`,
              method: p.method,
              amountLabel: String(p.amountIrt),
              amountIrt: p.amountIrt,
              displayDate,
            },
          });
          payments.push(this.mapPaymentRow(row));
        }

        const withCustomer = await tx.saleInvoice.findFirst({
          where: { id: created.id },
          include: { customer: true },
        });
        if (!withCustomer) {
          throw new NotFoundException('Sale invoice not found');
        }
        return { invoice: withCustomer, payments };
      });

      await this.saleSms.notify('confirmed', this.smsPayload(result.invoice));
      if (paymentStatus === 'partial') {
        await this.saleSms.notify('payment_partial', {
          ...this.smsPayload(result.invoice),
          remainingIRT: String(remainingIRT),
        });
      } else if (paymentStatus === 'paid') {
        await this.saleSms.notify('payment_paid', {
          ...this.smsPayload(result.invoice),
          remainingIRT: '0',
        });
      }

      return {
        invoice: this.mapInvoice(result.invoice),
        payments: result.payments,
      };
    } catch (e) {
      if (
        e instanceof BadRequestException ||
        e instanceof ConflictException ||
        e instanceof NotFoundException
      ) {
        throw e;
      }
      throw new ConflictException('Checkout failed (duplicate number or request)');
    }
  }

  async listInvoices(user: IAuthUser): Promise<ISaleInvoice[]> {
    this.assertCanRead(user);
    const rows = await this.prisma.saleInvoice.findMany({
      where: { organizationId: user.organizationId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapInvoice(r));
  }

  async getInvoiceDetail(user: IAuthUser, id: string): Promise<ISaleInvoiceDetailDto> {
    this.assertCanRead(user);
    const invoice = await this.prisma.saleInvoice.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { customer: true, lines: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!invoice) {
      throw new NotFoundException('Sale invoice not found');
    }
    return this.mapInvoiceDetail(invoice);
  }

  async updateStatus(
    user: IAuthUser,
    id: string,
    dto: UpdateSaleStatusDto,
  ): Promise<ISaleInvoice> {
    this.assertCanWrite(user);
    const existing = await this.findInvoiceOrThrow(user.organizationId, id);
    if (existing.status === 'void' || existing.status === 'completed') {
      throw new BadRequestException('Cannot change status of finished invoice');
    }

    if (dto.status === 'confirmed' || dto.status === 'void') {
      const withLines = await this.prisma.saleInvoice.findFirst({
        where: { id, organizationId: user.organizationId },
        include: { customer: true, lines: true },
      });
      if (!withLines) throw new NotFoundException('Sale invoice not found');

      const invoice = await this.prisma.$transaction(async (tx) => {
        if (dto.status === 'confirmed' && !withLines.ledgerPostedAt) {
          const date = businessDateKey(
            withLines.displayDate || businessDateKey(),
          );
          await this.goldLedger.assertBusinessDayOpen(
            user.organizationId,
            date,
          );
          const locked = await this.goldLedger.getLockedRate(
            user.organizationId,
            date,
          );
          const forcedRate =
            withLines.documentKind === 'buyback'
              ? locked.buyRateIrt
              : locked.sellRateIrt;
          for (const line of withLines.lines) {
            const weightGrams = Number(line.weightGrams || line.weight);
            const purityKarat = Number(line.purityKarat || line.purity);
            const goldValueIrt = Math.round(
              weightGrams * forcedRate * (purityKarat / 24),
            );
            const wageIrt = Number(line.wageIrt || 0);
            const profitIrt = Number(line.profitIrt || 0);
            const taxIrt = Number(line.taxIrt || 0);
            const discountIrt = Number(line.discountIrt || 0);
            const lineTotalIrt =
              goldValueIrt + wageIrt + profitIrt + taxIrt - discountIrt;
            await tx.saleInvoiceLine.update({
              where: { id: line.id },
              data: {
                rateIrt: forcedRate,
                dailyRate: String(forcedRate),
                goldValueIrt,
                goldValue: String(goldValueIrt),
                lineTotalIrt,
                lineTotal: String(lineTotalIrt),
              },
            });
          }
          const refreshed = await tx.saleInvoice.findFirst({
            where: { id: withLines.id },
            include: { customer: true, lines: true },
          });
          if (!refreshed) throw new NotFoundException('Sale invoice not found');
          await this.postInvoiceLedger(tx, refreshed);
        }
        if (dto.status === 'void' && withLines.ledgerPostedAt) {
          const sourceType =
            withLines.documentKind === 'buyback' ? 'buyback' : 'sale';
          await this.goldLedger.reverseBySource(
            user.organizationId,
            sourceType,
            withLines.id,
            tx,
          );
        }

        return tx.saleInvoice.update({
          where: { id },
          data: {
            status: dto.status,
            ledgerPostedAt:
              dto.status === 'confirmed'
                ? new Date()
                : dto.status === 'void'
                  ? null
                  : undefined,
          },
          include: { customer: true },
        });
      });

      if (dto.status === 'confirmed') {
        await this.saleSms.notify('confirmed', this.smsPayload(invoice));
      } else if (dto.status === 'void') {
        await this.saleSms.notify('void', this.smsPayload(invoice));
      }

      return this.mapInvoice(invoice);
    }

    const invoice = await this.prisma.saleInvoice.update({
      where: { id },
      data: { status: dto.status },
      include: { customer: true },
    });

    if (dto.status === 'ready') {
      await this.saleSms.notify('ready', this.smsPayload(invoice));
    } else if (dto.status === 'completed') {
      await this.saleSms.notify('completed', this.smsPayload(invoice));
    }

    return this.mapInvoice(invoice);
  }

  async updatePayment(
    user: IAuthUser,
    id: string,
    dto: UpdateSalePaymentDto,
  ): Promise<ISaleInvoice> {
    this.assertCanWrite(user);
    const existing = await this.prisma.saleInvoice.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { customer: true, payments: true },
    });
    if (!existing) {
      throw new NotFoundException('Sale invoice not found');
    }
    if (existing.status === 'void') {
      throw new BadRequestException('Cannot update payment on void invoice');
    }
    if (existing.status === 'draft') {
      throw new BadRequestException('Confirm invoice before recording payment');
    }

    const paid = existing.payments.reduce(
      (s, p) => s + Number(p.amountIrt || 0),
      0,
    );
    const total = Number(existing.amountIRT);
    const remainingFromPayments = Math.max(0, total - paid);

    if (dto.paymentStatus === 'paid' && remainingFromPayments > 0.5) {
      throw new BadRequestException(
        'Cannot mark paid without SalePayment rows covering the balance; use POST /sales/payments',
      );
    }
    if (
      dto.paymentStatus === 'partial' &&
      (paid <= 0 || remainingFromPayments <= 0)
    ) {
      throw new BadRequestException(
        'Partial status requires recorded SalePayment rows with remaining balance',
      );
    }

    const remainingIRT =
      dto.paymentStatus === 'paid'
        ? 0
        : dto.remainingIRT !== undefined
          ? dto.remainingIRT
          : remainingFromPayments;

    const invoice = await this.prisma.saleInvoice.update({
      where: { id },
      data: {
        paymentStatus: dto.paymentStatus,
        remainingIRT,
      },
      include: { customer: true },
    });

    if (dto.paymentStatus === 'partial') {
      await this.saleSms.notify('payment_partial', this.smsPayload(invoice));
    } else if (dto.paymentStatus === 'paid') {
      await this.saleSms.notify('payment_paid', this.smsPayload(invoice));
    }

    return this.mapInvoice(invoice);
  }

  private async findInvoiceOrThrow(organizationId: string, id: string) {
    const invoice = await this.prisma.saleInvoice.findFirst({
      where: { id, organizationId },
      include: { customer: true },
    });
    if (!invoice) {
      throw new NotFoundException('Sale invoice not found');
    }
    return invoice;
  }

  private smsPayload(invoice: SaleWithCustomer) {
    return {
      phone: invoice.customer.phone,
      invoiceNumber: invoice.number,
      goldWeightGrams: invoice.goldWeightGrams.toString(),
      amountIRT: invoice.amountIRT.toString(),
      remainingIRT: invoice.remainingIRT.toString(),
    };
  }

  private mapCustomer(row: {
    id: string;
    name: string;
    phone: string;
    address: string;
    nationalId: string | null;
    balanceLabel?: string;
    lastTxnLabel?: string;
    totalLabel?: string;
    partyStatus?: string;
  }): ISaleCustomer {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      address: row.address,
      nationalId: row.nationalId,
      balanceLabel: row.balanceLabel,
      lastTxnLabel: row.lastTxnLabel,
      totalLabel: row.totalLabel,
      partyStatus: row.partyStatus === 'inactive' ? 'inactive' : 'active',
    };
  }

  private mapInvoice(row: SaleWithCustomer): ISaleInvoice {
    return {
      id: row.id,
      number: row.number,
      documentKind: row.documentKind ?? 'sale',
      status: row.status,
      paymentStatus: row.paymentStatus,
      goldWeightGrams: row.goldWeightGrams.toString(),
      amountIRT: row.amountIRT.toString(),
      remainingIRT: row.remainingIRT.toString(),
      seller: row.seller,
      displayDate: row.displayDate || undefined,
      amountLabel: row.amountLabel || undefined,
      customer: this.mapCustomer(row.customer),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private resolveLines(dto: CreateSaleInvoiceDto): ReturnType<
    SalesService['computeLine']
  >[] {
    if (dto.lines && dto.lines.length > 0) {
      return dto.lines.map((l) => this.computeLine(l));
    }
    if (dto.goldWeightGrams == null || dto.amountIRT == null) {
      throw new BadRequestException('lines or goldWeightGrams/amountIRT required');
    }
    return [
      this.computeLine({
        description: dto.documentKind === 'buyback' ? 'خرید طلای کهنه' : 'فروش طلا',
        weightGrams: dto.goldWeightGrams,
        purityKarat: 18,
        rateIrt: Math.round(dto.amountIRT / dto.goldWeightGrams),
        wageIrt: 0,
        profitIrt: 0,
        taxIrt: 0,
      }),
    ];
  }

  private computeLine(l: CreateSaleInvoiceLineDto) {
    const wageIrt = l.wageIrt ?? 0;
    const profitIrt = l.profitIrt ?? 0;
    const taxIrt = l.taxIrt ?? 0;
    const discountIrt = l.discountIrt ?? 0;
    const goldValueIrt = Math.round(
      l.weightGrams * l.rateIrt * (l.purityKarat / 24),
    );
    const lineTotalIrt = Math.round(
      goldValueIrt + wageIrt + profitIrt + taxIrt - discountIrt,
    );
    return {
      description: l.description,
      weightGrams: l.weightGrams,
      purityKarat: l.purityKarat,
      rateIrt: l.rateIrt,
      goldValueIrt,
      wageIrt,
      profitIrt,
      taxIrt,
      discountIrt,
      lineTotalIrt,
    };
  }

  private applyForcedRate<
    T extends {
      description: string;
      weightGrams: number;
      purityKarat: number;
      rateIrt: number;
      wageIrt: number;
      profitIrt: number;
      taxIrt: number;
      discountIrt: number;
    },
  >(
    lines: T[],
    documentKind: SaleDocumentKind,
    locked: { buyRateIrt: number; sellRateIrt: number },
  ) {
    const rate =
      documentKind === 'buyback' ? locked.buyRateIrt : locked.sellRateIrt;
    return lines.map((l) =>
      this.computeLine({
        description: l.description,
        weightGrams: l.weightGrams,
        purityKarat: l.purityKarat,
        rateIrt: rate,
        wageIrt: l.wageIrt,
        profitIrt: l.profitIrt,
        taxIrt: l.taxIrt,
        discountIrt: l.discountIrt,
      }),
    );
  }

  private async loadShopProfile(organizationId: string): Promise<{
    shopName: string;
    shopAddress: string;
    shopPhone: string;
    shopGuildId: string;
  }> {
    const [org, business, invoices] = await Promise.all([
      this.prisma.organization.findUnique({ where: { id: organizationId } }),
      this.prisma.orgSetting.findUnique({
        where: { organizationId_section: { organizationId, section: 'business' } },
      }),
      this.prisma.orgSetting.findUnique({
        where: { organizationId_section: { organizationId, section: 'invoices' } },
      }),
    ]);
    const biz = (business?.values as Record<string, string> | null) ?? {};
    const inv = (invoices?.values as Record<string, string> | null) ?? {};
    return {
      shopName: inv.shopName || biz.shopName || org?.name || '',
      shopAddress: inv.shopAddress || biz.address || '',
      shopPhone: inv.shopPhone || biz.phone || '',
      shopGuildId: inv.shopGuildId || biz.guildId || '',
    };
  }

  private async insertInvoice(
    tx: Prisma.TransactionClient,
    input: {
      organizationId: string;
      customerId: string;
      number: string;
      documentKind: SaleDocumentKind;
      status: SaleInvoiceStatus;
      goldWeightGrams: number;
      amountIRT: number;
      remainingIRT: number;
      displayDate: string;
      seller: string;
      lineInputs: ReturnType<SalesService['computeLine']>[];
      clientRequestId?: string;
      paymentStatus?: SalePaymentStatus;
    },
  ) {
    const shop = await this.loadShopProfile(input.organizationId);
    return tx.saleInvoice.create({
      data: {
        organizationId: input.organizationId,
        customerId: input.customerId,
        number: input.number,
        documentKind: input.documentKind,
        status: input.status,
        paymentStatus: input.paymentStatus ?? 'unpaid',
        goldWeightGrams: input.goldWeightGrams,
        amountIRT: input.amountIRT,
        remainingIRT: input.remainingIRT,
        displayDate: input.displayDate,
        seller: input.seller,
        amountLabel: String(input.amountIRT),
        shopName: shop.shopName,
        shopAddress: shop.shopAddress,
        shopPhone: shop.shopPhone,
        shopGuildId: shop.shopGuildId,
        clientRequestId: input.clientRequestId || null,
        lines: {
          create: input.lineInputs.map((l, sortOrder) => ({
            sortOrder,
            description: l.description,
            weight: String(l.weightGrams),
            purity: String(l.purityKarat),
            dailyRate: String(l.rateIrt),
            goldValue: String(l.goldValueIrt),
            wage: String(l.wageIrt),
            profit: String(l.profitIrt),
            tax: String(l.taxIrt),
            lineTotal: String(l.lineTotalIrt),
            weightGrams: l.weightGrams,
            purityKarat: l.purityKarat,
            rateIrt: l.rateIrt,
            goldValueIrt: l.goldValueIrt,
            wageIrt: l.wageIrt,
            profitIrt: l.profitIrt,
            taxIrt: l.taxIrt,
            discountIrt: l.discountIrt,
            lineTotalIrt: l.lineTotalIrt,
          })),
        },
        totalsJson: {
          totalWeight: String(input.goldWeightGrams),
          goldValue: String(
            input.lineInputs.reduce((s, l) => s + l.goldValueIrt, 0),
          ),
          wage: String(input.lineInputs.reduce((s, l) => s + l.wageIrt, 0)),
          profit: String(input.lineInputs.reduce((s, l) => s + l.profitIrt, 0)),
          tax: String(input.lineInputs.reduce((s, l) => s + l.taxIrt, 0)),
          discount: String(
            input.lineInputs.reduce((s, l) => s + l.discountIrt, 0),
          ),
          grandTotal: String(input.amountIRT),
          amountInWords: '—',
        },
      },
      include: { customer: true, lines: true },
    });
  }

  private mapPaymentRow(row: {
    id: string;
    invoiceId: string;
    ref: string;
    method: string;
    amountIrt: { toString(): string } | number;
    displayDate: string;
    createdAt: Date;
  }): ISalePayment {
    return {
      id: row.id,
      invoiceId: row.invoiceId,
      ref: row.ref,
      method: row.method,
      amountIrt: Number(row.amountIrt),
      displayDate: row.displayDate,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private async postInvoiceLedger(
    tx: Prisma.TransactionClient,
    invoice: SaleWithCustomer & { organizationId: string },
  ): Promise<void> {
    const lines: IGoldLedgerLine[] = (invoice.lines ?? []).map((l) => ({
      grams: Number(l.weightGrams ?? l.weight),
      purityKarat: Number(l.purityKarat ?? l.purity),
      rateIrt: Number(
        l.rateIrt ?? (String(l.dailyRate).replace(/[^\d.]/g, '') || 0),
      ),
      counterparty: invoice.customer.name,
    }));

    if (lines.length === 0) {
      lines.push({
        grams: Number(invoice.goldWeightGrams),
        purityKarat: 18,
        rateIrt: 0,
        counterparty: invoice.customer.name,
      });
    }

    const displayDate = invoice.displayDate || businessDateKey();
    if (invoice.documentKind === 'buyback') {
      await this.goldLedger.postBuybackIn(
        invoice.organizationId,
        invoice.id,
        lines,
        displayDate,
        tx,
      );
    } else {
      await this.goldLedger.postSaleOut(
        invoice.organizationId,
        invoice.id,
        lines,
        displayDate,
        tx,
      );
    }
  }

  private mapInvoiceDetail(row: SaleWithCustomer): ISaleInvoiceDetailDto {
    const defaults: ISaleInvoiceTotalsDto = {
      totalWeight: row.goldWeightGrams.toString(),
      goldValue: '—',
      wage: '—',
      profit: '—',
      tax: '—',
      grandTotal: row.amountLabel || row.amountIRT.toString(),
      amountInWords: '—',
    };
    const totals =
      row.totalsJson && typeof row.totalsJson === 'object'
        ? ({ ...defaults, ...(row.totalsJson as object) } as ISaleInvoiceTotalsDto)
        : defaults;

    return {
      id: row.id,
      number: row.number,
      customer: row.customer.name,
      date: row.displayDate || row.createdAt.toISOString().slice(0, 10),
      goldWeight: row.goldWeightGrams.toString(),
      amount: row.amountLabel || row.amountIRT.toString(),
      paymentStatus: row.paymentStatus,
      seller: row.seller,
      status: row.status,
      shop: {
        name: row.shopName || '—',
        address: row.shopAddress || '—',
        phone: row.shopPhone || '—',
        guildId: row.shopGuildId || '—',
      },
      customerDetail: {
        name: row.customer.name,
        phone: row.customer.phone,
        nationalId: row.customer.nationalId ?? '—',
      },
      lines: (row.lines ?? []).map((l) => ({
        id: l.id,
        description: l.description,
        weight: l.weight,
        purity: l.purity,
        dailyRate: l.dailyRate,
        goldValue: l.goldValue,
        wage: l.wage,
        profit: l.profit,
        tax: l.tax,
        lineTotal: l.lineTotal,
      })),
      totals,
    };
  }

  private assertCanRead(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (
      user.permissions.includes('sales.read') ||
      user.permissions.includes('manage')
    ) {
      return;
    }
    throw new ForbiddenException('Missing sales.read');
  }

  private assertCanWrite(user: IAuthUser): void {
    if (this.isAdmin(user)) return;
    if (
      user.permissions.includes('sales.create') ||
      user.permissions.includes('sales.update') ||
      user.permissions.includes('manage')
    ) {
      return;
    }
    throw new ForbiddenException('Missing sales write permission');
  }

  private isAdmin(user: IAuthUser): boolean {
    return (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN'
    );
  }

  async listPayments(user: IAuthUser): Promise<ISalePaymentRow[]> {
    this.assertCanRead(user);
    const rows = await this.prisma.salePayment.findMany({
      where: { organizationId: user.organizationId },
      include: { invoice: { include: { customer: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      ref: r.ref,
      customer: r.invoice.customer.name,
      method: r.method,
      amount: r.amountLabel,
      date: r.displayDate,
    }));
  }

  async createPayment(
    user: IAuthUser,
    dto: CreateSalePaymentRecordDto,
  ): Promise<ISalePaymentRow> {
    this.assertCanWrite(user);
    const invoice = await this.prisma.saleInvoice.findFirst({
      where: { id: dto.invoiceId, organizationId: user.organizationId },
      include: { customer: true, payments: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'draft' || invoice.status === 'void') {
      throw new BadRequestException('Cannot pay draft/void invoice');
    }

    const amountIrt =
      dto.amountIrt ??
      (dto.amountLabel ? Number(dto.amountLabel.replace(/[^\d.]/g, '')) : NaN);
    if (!Number.isFinite(amountIrt) || amountIrt <= 0) {
      throw new BadRequestException('amountIrt is required');
    }

    const displayDate = businessDateKey(dto.displayDate || businessDateKey());
    await this.goldLedger.assertBusinessDayOpen(
      user.organizationId,
      displayDate,
    );
    const priorPaid = invoice.payments.reduce(
      (s, p) => s + Number(p.amountIrt || 0),
      0,
    );
    const totalAmount = Number(invoice.amountIRT);
    const paidAfter = Math.min(totalAmount, priorPaid + amountIrt);
    const remainingIRT = Math.max(0, totalAmount - paidAfter);
    const paymentStatus: SalePaymentStatus =
      remainingIRT <= 0 ? 'paid' : paidAfter > 0 ? 'partial' : 'unpaid';

    const r = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.salePayment.create({
        data: {
          organizationId: user.organizationId,
          invoiceId: invoice.id,
          ref: dto.ref,
          method: dto.method,
          amountLabel: dto.amountLabel || String(amountIrt),
          amountIrt,
          displayDate,
        },
        include: { invoice: { include: { customer: true } } },
      });
      await tx.saleInvoice.update({
        where: { id: invoice.id },
        data: { paymentStatus, remainingIRT },
      });
      return payment;
    });

    if (paymentStatus === 'partial') {
      await this.saleSms.notify('payment_partial', {
        ...this.smsPayload(invoice),
        remainingIRT: String(remainingIRT),
      });
    } else if (paymentStatus === 'paid') {
      await this.saleSms.notify('payment_paid', {
        ...this.smsPayload(invoice),
        remainingIRT: '0',
      });
    }

    return {
      id: r.id,
      ref: r.ref,
      customer: r.invoice.customer.name,
      method: r.method,
      amount: r.amountLabel,
      date: r.displayDate,
    };
  }

  async listReturns(user: IAuthUser): Promise<ISaleReturnRow[]> {
    this.assertCanRead(user);
    const rows = await this.prisma.saleReturn.findMany({
      where: { organizationId: user.organizationId },
      include: { invoice: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      number: r.number,
      invoice: r.invoice.number,
      date: r.displayDate,
      amount: r.amountLabel,
    }));
  }

  async createReturn(user: IAuthUser, dto: CreateSaleReturnDto): Promise<ISaleReturnRow> {
    this.assertCanWrite(user);
    const invoice = await this.prisma.saleInvoice.findFirst({
      where: { id: dto.invoiceId, organizationId: user.organizationId },
      include: { lines: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const displayDate = businessDateKey(dto.displayDate || businessDateKey());
    await this.goldLedger.assertBusinessDayOpen(
      user.organizationId,
      displayDate,
    );

    const r = await this.prisma.$transaction(async (tx) => {
      const created = await tx.saleReturn.create({
        data: {
          organizationId: user.organizationId,
          invoiceId: invoice.id,
          number: dto.number,
          displayDate,
          amountLabel: dto.amountLabel,
        },
        include: { invoice: true },
      });
      if (invoice.ledgerPostedAt) {
        const sourceType =
          invoice.documentKind === 'buyback' ? 'buyback' : 'sale';
        await this.goldLedger.reverseBySource(
          user.organizationId,
          sourceType,
          invoice.id,
          tx,
        );
        await tx.saleInvoice.update({
          where: { id: invoice.id },
          data: {
            status: 'void',
            ledgerPostedAt: null,
            remainingIRT: 0,
            paymentStatus: invoice.paymentStatus,
          },
        });
      }
      return created;
    });

    return {
      id: r.id,
      number: r.number,
      invoice: r.invoice.number,
      date: r.displayDate,
      amount: r.amountLabel,
    };
  }
}
