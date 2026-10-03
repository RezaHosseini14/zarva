import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { AccountingService } from './accounting.service';
import { CreateChartAccountDto, CreateJournalEntryDto } from './dto/accounting.dto';

@ApiTags('Accounting')
@ApiBearerAuth()
@Controller('accounting')
export class AccountingController {
  constructor(
    private readonly accounting: AccountingService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'accounting');
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List chart of accounts' })
  async listAccounts(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.accounting.listAccounts(user);
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create chart account' })
  async createAccount(@CurrentUser() user: IAuthUser, @Body() dto: CreateChartAccountDto) {
    await this.gate(user);
    return this.accounting.createAccount(user, dto);
  }

  @Get('journals')
  @ApiOperation({ summary: 'List journal entries' })
  async listJournals(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.accounting.listJournals(user);
  }

  @Get('journals/:id')
  @ApiOperation({ summary: 'Get journal entry' })
  async getJournal(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.gate(user);
    return this.accounting.getJournal(user, id);
  }

  @Post('journals')
  @ApiOperation({ summary: 'Create balanced journal entry' })
  async createJournal(@CurrentUser() user: IAuthUser, @Body() dto: CreateJournalEntryDto) {
    await this.gate(user);
    return this.accounting.createJournal(user, dto);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Rial ledger (derived from journals)' })
  async getLedger(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.accounting.getLedger(user);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Accounting hub KPIs' })
  async getSummary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.accounting.getSummary(user);
  }

  @Get('sections/:section')
  @ApiOperation({ summary: 'Section rows (cash-bank, income, …)' })
  async section(
    @CurrentUser() user: IAuthUser,
    @Param('section') section: string,
  ) {
    await this.gate(user);
    const allowed = [
      'cash-bank',
      'income',
      'expenses',
      'receivables',
      'payables',
      'transactions',
    ] as const;
    if (!(allowed as readonly string[]).includes(section)) {
      return [];
    }
    return this.accounting.listBySection(
      user,
      section as (typeof allowed)[number],
    );
  }
}
