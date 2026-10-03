import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ISaleCustomer,
  ISaleInvoice,
  ISaleInvoiceDetailDto,
  ISaleInvoiceTotalsDto,
  ISalePaymentRow,
  ISaleReturnRow,
  SaleInvoiceStatus,
  SalePaymentStatus,
} from '@zarva/shared';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import { normalizeIranPhone } from '../sms/phone.util';
import { SaleSmsNotifier } from './sale-sms.notifier';
import type {
  CreateCustomerDto,
  CreateSaleInvoiceDto,
  CreateSalePaymentRecordDto,
  CreateSaleReturnDto,
  UpdateSalePaymentDto,
  UpdateSaleStatusDto,
} from './dto/sales.dto';

type SaleWithCustomer = {
  id: string;
  number: string;
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
  }>;
};

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly saleSms: SaleSmsNotifier,
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

  async getCustomer(user: IAuthUser, id: string): Promise<ISaleCustomer> {
    this.assertCanRead(user);
    const row = await this.prisma.customer.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!row) {
      throw new NotFoundException('Customer not found');
    }
    return this.mapCustomer(row);
  }

  async createInvoice(user: IAuthUser, dto: CreateSaleInvoiceDto): Promise<ISaleInvoice> {
    this.assertCanWrite(user);
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, organizationId: user.organizationId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const status: SaleInvoiceStatus = dto.confirm ? 'confirmed' : 'draft';
    const remaining =
      dto.remainingIRT !== undefined ? dto.remainingIRT : dto.amountIRT;

    try {
      const invoice = await this.prisma.saleInvoice.create({
        data: {
          organizationId: user.organizationId,
          customerId: customer.id,
          number: dto.number.trim(),
          status,
          paymentStatus: 'unpaid',
          goldWeightGrams: dto.goldWeightGrams,
          amountIRT: dto.amountIRT,
          remainingIRT: remaining,
        },
        include: { customer: true },
      });

      if (status === 'confirmed') {
        await this.saleSms.notify('confirmed', this.smsPayload(invoice));
      }

      return this.mapInvoice(invoice);
    } catch {
      throw new ConflictException('Invoice number already exists');
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

    const invoice = await this.prisma.saleInvoice.update({
      where: { id },
      data: { status: dto.status },
      include: { customer: true },
    });

    if (dto.status === 'confirmed') {
      await this.saleSms.notify('confirmed', this.smsPayload(invoice));
    } else if (dto.status === 'ready') {
      await this.saleSms.notify('ready', this.smsPayload(invoice));
    } else if (dto.status === 'completed') {
      await this.saleSms.notify('completed', this.smsPayload(invoice));
    } else if (dto.status === 'void') {
      await this.saleSms.notify('void', this.smsPayload(invoice));
    }

    return this.mapInvoice(invoice);
  }

  async updatePayment(
    user: IAuthUser,
    id: string,
    dto: UpdateSalePaymentDto,
  ): Promise<ISaleInvoice> {
    this.assertCanWrite(user);
    const existing = await this.findInvoiceOrThrow(user.organizationId, id);
    if (existing.status === 'void') {
      throw new BadRequestException('Cannot update payment on void invoice');
    }
    if (existing.status === 'draft') {
      throw new BadRequestException('Confirm invoice before recording payment');
    }

    const remainingIRT =
      dto.paymentStatus === 'paid'
        ? 0
        : dto.remainingIRT !== undefined
          ? dto.remainingIRT
          : Number(existing.remainingIRT);

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
        name: row.shopName || 'ZARVA',
        address: row.shopAddress || row.customer.address,
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
    if (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.permissions.includes('sales.read') ||
      user.permissions.includes('manage')
    ) {
      return;
    }
    throw new ForbiddenException('Missing sales.read');
  }

  private assertCanWrite(user: IAuthUser): void {
    if (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.permissions.includes('sales.create') ||
      user.permissions.includes('sales.update') ||
      user.permissions.includes('manage')
    ) {
      return;
    }
    throw new ForbiddenException('Missing sales write permission');
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
      include: { customer: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const r = await this.prisma.salePayment.create({
      data: {
        organizationId: user.organizationId,
        invoiceId: invoice.id,
        ref: dto.ref,
        method: dto.method,
        amountLabel: dto.amountLabel,
        displayDate: dto.displayDate,
      },
      include: { invoice: { include: { customer: true } } },
    });
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
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const r = await this.prisma.saleReturn.create({
      data: {
        organizationId: user.organizationId,
        invoiceId: invoice.id,
        number: dto.number,
        displayDate: dto.displayDate,
        amountLabel: dto.amountLabel,
      },
      include: { invoice: true },
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
