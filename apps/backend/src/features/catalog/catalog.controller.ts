import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { CatalogService } from './catalog.service';

/** Legacy supplier routes; other domains moved to dedicated modules. */
@ApiTags('Catalog')
@ApiBearerAuth()
@Controller()
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly billing: BillingService,
  ) {}

  @Get('suppliers')
  @ApiOperation({ summary: 'List suppliers' })
  async listSuppliers(@CurrentUser() user: IAuthUser) {
    await this.billing.assertModule(user.organizationId, 'suppliers');
    return this.catalog.listSuppliers(user);
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
}
