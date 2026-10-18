import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { CatalogService } from './catalog.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/catalog.dto';

/** Legacy supplier routes; other domains moved to dedicated modules. */
@ApiTags('Catalog')
@ApiBearerAuth()
@Controller()
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly billing: BillingService,
  ) {}

  @Get('suppliers/summary')
  @ApiOperation({ summary: 'Suppliers list KPIs' })
  async suppliersSummary(@CurrentUser() user: IAuthUser) {
    await this.billing.assertModule(user.organizationId, 'suppliers');
    return this.catalog.suppliersSummary(user);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'List suppliers' })
  async listSuppliers(@CurrentUser() user: IAuthUser) {
    await this.billing.assertModule(user.organizationId, 'suppliers');
    return this.catalog.listSuppliers(user);
  }

  @Post('suppliers')
  @ApiOperation({ summary: 'Create supplier' })
  async createSupplier(@CurrentUser() user: IAuthUser, @Body() dto: CreateSupplierDto) {
    await this.billing.assertModule(user.organizationId, 'suppliers');
    return this.catalog.createSupplier(user, dto);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier' })
  async getSupplier(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.billing.assertModule(user.organizationId, 'suppliers');
    return this.catalog.getSupplier(user, id);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update supplier' })
  async updateSupplier(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    await this.billing.assertModule(user.organizationId, 'suppliers');
    return this.catalog.updateSupplier(user, id, dto);
  }
}
