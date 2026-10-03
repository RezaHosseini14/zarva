import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import {
  CreateTaxPeriodDto,
  ExportTaxFilingDto,
  GenerateTaxFilingDto,
  UpdateTaxPeriodDto,
} from './dto/tax.dto';
import { TaxService } from './tax.service';

@ApiTags('Tax')
@ApiBearerAuth()
@Controller('tax')
export class TaxController {
  constructor(
    private readonly tax: TaxService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'tax');
  }

  @Get('periods')
  @ApiOperation({ summary: 'List tax periods' })
  async listPeriods(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.tax.listPeriods(user);
  }

  @Post('periods')
  async createPeriod(@CurrentUser() user: IAuthUser, @Body() dto: CreateTaxPeriodDto) {
    await this.gate(user);
    return this.tax.createPeriod(user, dto);
  }

  @Patch('periods/:id')
  async updatePeriod(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaxPeriodDto,
  ) {
    await this.gate(user);
    return this.tax.updatePeriod(user, id, dto);
  }

  @Post('periods/:id/close')
  async closePeriod(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.tax.closePeriod(user, id);
  }

  @Post('periods/:id/filings')
  async generateFiling(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateTaxFilingDto,
  ) {
    await this.gate(user);
    return this.tax.generateFiling(user, id, dto);
  }

  @Get('filings')
  async listFilings(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.tax.listFilings(user);
  }

  @Post('filings/:id/export')
  async exportFiling(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExportTaxFilingDto,
  ) {
    await this.gate(user);
    return this.tax.exportFiling(user, id, dto.format);
  }

  @Post('filings/:id/submit')
  async submitFiling(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.tax.submitFiling(user, id);
  }
}
