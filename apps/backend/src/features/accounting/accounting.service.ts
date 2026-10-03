import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  IAccountingSummary,
  IAccountingTxnRow,
  IChartAccount,
  IJournalEntryDto,
  ILedgerRow,
} from '@zarva/shared';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import type { IAuthUser } from '../auth/auth.types';
import type { CreateChartAccountDto, CreateJournalEntryDto } from './dto/accounting.dto';

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  async listAccounts(user: IAuthUser): Promise<IChartAccount[]> {
    this.assertRead(user);
    const rows = await this.prisma.chartAccount.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { code: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      type: r.type,
      isActive: r.isActive,
    }));
  }

  async createAccount(user: IAuthUser, dto: CreateChartAccountDto): Promise<IChartAccount> {
    this.assertWrite(user);
    const row = await this.prisma.chartAccount.create({
      data: {
        organizationId: user.organizationId,
        code: dto.code.trim(),
        name: dto.name.trim(),
        type: dto.type,
      },
    });
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type,
      isActive: row.isActive,
    };
  }

  async listJournals(user: IAuthUser): Promise<IJournalEntryDto[]> {
    this.assertRead(user);
    const rows = await this.prisma.journalEntry.findMany({
      where: { organizationId: user.organizationId },
      include: { lines: { include: { account: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.mapJournal(r));
  }

  async getJournal(user: IAuthUser, id: string): Promise<IJournalEntryDto> {
    this.assertRead(user);
    const row = await this.prisma.journalEntry.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { lines: { include: { account: true } } },
    });
    if (!row) throw new NotFoundException('Journal not found');
    return this.mapJournal(row);
  }

  async createJournal(user: IAuthUser, dto: CreateJournalEntryDto): Promise<IJournalEntryDto> {
    this.assertWrite(user);
    if (!dto.lines?.length) {
      throw new BadRequestException('Journal requires lines');
    }
    let debitSum = 0n;
    let creditSum = 0n;
    for (const line of dto.lines) {
      debitSum += BigInt(line.debit.replace(/\D/g, '') || '0');
      creditSum += BigInt(line.credit.replace(/\D/g, '') || '0');
    }
    if (debitSum !== creditSum) {
      throw new BadRequestException('Journal must balance (debit = credit)');
    }

    const accountIds = dto.lines.map((l) => l.accountId);
    const accounts = await this.prisma.chartAccount.findMany({
      where: { organizationId: user.organizationId, id: { in: accountIds } },
    });
    if (accounts.length !== new Set(accountIds).size) {
      throw new BadRequestException('Invalid account in journal lines');
    }

    const row = await this.prisma.journalEntry.create({
      data: {
        organizationId: user.organizationId,
        number: dto.number.trim(),
        displayDate: dto.date,
        description: dto.description.trim(),
        lines: {
          create: dto.lines.map((l) => ({
            accountId: l.accountId,
            debitLabel: l.debit,
            creditLabel: l.credit,
            debitAmount: new Prisma.Decimal(l.debit.replace(/\D/g, '') || '0'),
            creditAmount: new Prisma.Decimal(l.credit.replace(/\D/g, '') || '0'),
            memo: l.memo ?? '',
          })),
        },
      },
      include: { lines: { include: { account: true } } },
    });

    await this.syncLegacyLedger(user.organizationId);
    return this.mapJournal(row);
  }

  async getLedger(user: IAuthUser): Promise<ILedgerRow[]> {
    this.assertRead(user);
    const rows = await this.prisma.ledgerEntry.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      date: r.displayDate,
      description: r.description,
      debit: r.debitLabel,
      credit: r.creditLabel,
      balance: r.balanceLabel,
    }));
  }

  async getSummary(user: IAuthUser): Promise<IAccountingSummary> {
    this.assertRead(user);
    const accounts = await this.prisma.chartAccount.findMany({
      where: { organizationId: user.organizationId },
      include: { lines: true },
    });

    const sumType = (type: string): bigint => {
      let n = 0n;
      for (const a of accounts.filter((x) => x.type === type)) {
        for (const l of a.lines) {
          n += BigInt(l.debitAmount.toString()) - BigInt(l.creditAmount.toString());
        }
      }
      return n;
    };

    const cash = sumType('asset');
    const income = sumType('income');
    const expense = sumType('expense');
    const ar = accounts
      .filter((a) => a.code.startsWith('11') || a.name.includes('دریافت'))
      .reduce((acc, a) => {
        for (const l of a.lines) {
          acc += BigInt(l.debitAmount.toString()) - BigInt(l.creditAmount.toString());
        }
        return acc;
      }, 0n);
    const ap = accounts
      .filter((a) => a.code.startsWith('21') || a.name.includes('پرداخت'))
      .reduce((acc, a) => {
        for (const l of a.lines) {
          acc += BigInt(l.creditAmount.toString()) - BigInt(l.debitAmount.toString());
        }
        return acc;
      }, 0n);

    const pl = income - expense;
    return {
      cash: this.formatMoney(cash < 0n ? -cash : cash),
      ar: this.formatMoney(ar < 0n ? -ar : ar),
      ap: this.formatMoney(ap < 0n ? -ap : ap),
      pl: `${pl >= 0n ? '+' : ''}${this.formatMoney(pl < 0n ? -pl : pl)}`,
    };
  }

  async listBySection(
    user: IAuthUser,
    section: 'cash-bank' | 'income' | 'expenses' | 'receivables' | 'payables' | 'transactions',
  ): Promise<IAccountingTxnRow[]> {
    this.assertRead(user);
    if (section === 'transactions') {
      const journals = await this.prisma.journalEntry.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return journals.map((j) => ({
        id: j.id,
        a: j.number,
        b: j.description,
        c: j.displayDate,
      }));
    }

    const typeMap: Record<string, string[]> = {
      'cash-bank': ['asset'],
      income: ['income'],
      expenses: ['expense'],
      receivables: ['asset'],
      payables: ['liability'],
    };
    const types = typeMap[section] ?? ['asset'];
    const accounts = await this.prisma.chartAccount.findMany({
      where: {
        organizationId: user.organizationId,
        type: { in: types as Array<'asset' | 'liability' | 'equity' | 'income' | 'expense'> },
      },
      include: {
        lines: { include: { journal: true }, orderBy: { journal: { createdAt: 'desc' } }, take: 20 },
      },
    });

    const rows: IAccountingTxnRow[] = [];
    for (const a of accounts) {
      if (section === 'receivables' && !a.code.startsWith('11') && !a.name.includes('دریافت')) {
        continue;
      }
      if (section === 'payables' && !a.code.startsWith('21') && !a.name.includes('پرداخت')) {
        continue;
      }
      if (section === 'cash-bank' && !a.code.startsWith('10') && !a.name.includes('صندوق') && !a.name.includes('بانک')) {
        continue;
      }
      for (const l of a.lines) {
        rows.push({
          id: l.id,
          a: l.journal.number,
          b: l.memo || a.name,
          c: l.debitAmount.gt(0) ? l.debitLabel : l.creditLabel,
        });
      }
    }
    return rows.slice(0, 50);
  }

  private async syncLegacyLedger(organizationId: string): Promise<void> {
    const journals = await this.prisma.journalEntry.findMany({
      where: { organizationId },
      include: { lines: true },
      orderBy: { createdAt: 'asc' },
    });
    await this.prisma.ledgerEntry.deleteMany({ where: { organizationId } });
    let balance = 0n;
    let sortOrder = 0;
    for (const j of journals) {
      let debit = 0n;
      let credit = 0n;
      for (const l of j.lines) {
        debit += BigInt(l.debitAmount.toString());
        credit += BigInt(l.creditAmount.toString());
      }
      balance += debit - credit;
      await this.prisma.ledgerEntry.create({
        data: {
          organizationId,
          displayDate: j.displayDate,
          description: j.description,
          debitLabel: debit > 0n ? this.formatMoney(debit) : '—',
          creditLabel: credit > 0n ? this.formatMoney(credit) : '—',
          balanceLabel: this.formatMoney(balance < 0n ? -balance : balance),
          sortOrder: sortOrder++,
        },
      });
    }
  }

  private mapJournal(r: {
    id: string;
    number: string;
    displayDate: string;
    description: string;
    lines: Array<{
      id: string;
      debitLabel: string;
      creditLabel: string;
      memo: string;
      account: { id: string; code: string; name: string };
    }>;
  }): IJournalEntryDto {
    return {
      id: r.id,
      number: r.number,
      date: r.displayDate,
      description: r.description,
      lines: r.lines.map((l) => ({
        id: l.id,
        accountId: l.account.id,
        accountCode: l.account.code,
        accountName: l.account.name,
        debit: l.debitLabel,
        credit: l.creditLabel,
        memo: l.memo || undefined,
      })),
    };
  }

  private formatMoney(n: bigint): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  }

  private assertRead(user: IAuthUser): void {
    if (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN'
    ) {
      return;
    }
    if (!user.permissions.includes('accounting.read')) {
      throw new ForbiddenException('Missing accounting.read');
    }
  }

  private assertWrite(user: IAuthUser): void {
    if (
      user.roleName === 'SUPER_ADMIN' ||
      user.roleName === 'PLATFORM_ADMIN' ||
      user.roleName === 'ORG_ADMIN'
    ) {
      return;
    }
    if (
      !user.permissions.includes('accounting.create') &&
      !user.permissions.includes('accounting.update')
    ) {
      throw new ForbiddenException('Missing accounting write permission');
    }
  }
}
