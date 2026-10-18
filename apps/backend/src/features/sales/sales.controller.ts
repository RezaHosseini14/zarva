import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import {
  CreateCustomerDto,
  CreateSaleInvoiceDto,
  CreateSalePaymentRecordDto,
  CreateSaleReturnDto,
  SaleCheckoutDto,
  UpdateCustomerDto,
  UpdateSalePaymentDto,
  UpdateSaleStatusDto,
} from './dto/sales.dto';
import { SmsService } from '../sms/sms.service';
import { SalesService } from './sales.service';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(
    private readonly sales: SalesService,
    private readonly billing: BillingService,
    private readonly sms: SmsService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'sales');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Sales list KPIs' })
  async summary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.sales.summary(user);
  }

  @Get('customer-sms/capabilities')
  @ApiOperation({ summary: 'Whether customer sale SMS can be delivered' })
  async customerSmsCapabilities(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return { enabled: this.sms.isLiveProvider() };
  }

  @Get('customers/summary')
  @ApiOperation({ summary: 'Customers list KPIs' })
  async customersSummary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.sales.customersSummary(user);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customers' })
  async listCustomers(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.sales.listCustomers(user);
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get customer' })
  async getCustomer(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.gate(user);
    return this.sales.getCustomer(user, id);
  }

  @Post('customers')
  @ApiOperation({ summary: 'Create customer (phone + address required)' })
  async createCustomer(@CurrentUser() user: IAuthUser, @Body() dto: CreateCustomerDto) {
    await this.gate(user);
    return this.sales.createCustomer(user, dto);
  }

  @Patch('customers/:id')
  @ApiOperation({ summary: 'Update customer' })
  async updateCustomer(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    await this.gate(user);
    return this.sales.updateCustomer(user, id, dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List gold sale invoices' })
  async listInvoices(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.sales.listInvoices(user);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get sale invoice detail (print-ready)' })
  async getInvoice(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.gate(user);
    return this.sales.getInvoiceDetail(user, id);
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Create gold sale invoice' })
  async createInvoice(@CurrentUser() user: IAuthUser, @Body() dto: CreateSaleInvoiceDto) {
    await this.gate(user);
    return this.sales.createInvoice(user, dto);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Atomic POS checkout: invoice + ledger + payments' })
  async checkout(@CurrentUser() user: IAuthUser, @Body() dto: SaleCheckoutDto) {
    await this.gate(user);
    return this.sales.checkout(user, dto);
  }

  @Patch('invoices/:id/status')
  @ApiOperation({ summary: 'Update sale status (sends customer SMS)' })
  async updateStatus(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSaleStatusDto,
  ) {
    await this.gate(user);
    return this.sales.updateStatus(user, id, dto);
  }

  @Patch('invoices/:id/payment')
  @ApiOperation({ summary: 'Update payment status (sends customer SMS)' })
  async updatePayment(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalePaymentDto,
  ) {
    await this.gate(user);
    return this.sales.updatePayment(user, id, dto);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List sale payments' })
  async listPayments(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.sales.listPayments(user);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Record sale payment' })
  async createPayment(@CurrentUser() user: IAuthUser, @Body() dto: CreateSalePaymentRecordDto) {
    await this.gate(user);
    return this.sales.createPayment(user, dto);
  }

  @Get('returns')
  @ApiOperation({ summary: 'List sale returns' })
  async listReturns(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.sales.listReturns(user);
  }

  @Post('returns')
  @ApiOperation({ summary: 'Create sale return' })
  async createReturn(@CurrentUser() user: IAuthUser, @Body() dto: CreateSaleReturnDto) {
    await this.gate(user);
    return this.sales.createReturn(user, dto);
  }
}
