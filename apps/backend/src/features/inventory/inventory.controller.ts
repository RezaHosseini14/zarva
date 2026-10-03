import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import {
  CreateAdjustmentDto,
  CreateInventoryItemDto,
  CreateStockMovementDto,
  CreateWarehouseDto,
} from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventory: InventoryService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'inventory');
  }

  @Get()
  @ApiOperation({ summary: 'List inventory items' })
  async list(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.inventory.listItems(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create inventory item' })
  async create(@CurrentUser() user: IAuthUser, @Body() dto: CreateInventoryItemDto) {
    await this.gate(user);
    return this.inventory.createItem(user, dto);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'List warehouses' })
  async warehouses(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.inventory.listWarehouses(user);
  }

  @Post('warehouses')
  @ApiOperation({ summary: 'Create warehouse' })
  async createWarehouse(@CurrentUser() user: IAuthUser, @Body() dto: CreateWarehouseDto) {
    await this.gate(user);
    return this.inventory.createWarehouse(user, dto);
  }

  @Get('movements')
  @ApiOperation({ summary: 'List stock movements' })
  async movements(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.inventory.listMovements(user);
  }

  @Post('movements')
  @ApiOperation({ summary: 'Create stock movement' })
  async createMovement(@CurrentUser() user: IAuthUser, @Body() dto: CreateStockMovementDto) {
    await this.gate(user);
    return this.inventory.createMovement(user, dto);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Low stock items' })
  async lowStock(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.inventory.listLowStock(user);
  }

  @Post('adjustments')
  @ApiOperation({ summary: 'Stock adjustment' })
  async adjust(@CurrentUser() user: IAuthUser, @Body() dto: CreateAdjustmentDto) {
    await this.gate(user);
    return this.inventory.adjust(user, dto);
  }

  @Get('valuation')
  @ApiOperation({ summary: 'Inventory valuation' })
  async valuation(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.inventory.valuation(user);
  }

  @Get('barcodes/:code')
  @ApiOperation({ summary: 'Lookup by barcode' })
  async barcode(@CurrentUser() user: IAuthUser, @Param('code') code: string) {
    await this.gate(user);
    return this.inventory.findByBarcode(user, code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item' })
  async get(@CurrentUser() user: IAuthUser, @Param('id') id: string) {
    await this.gate(user);
    return this.inventory.getItem(user, id);
  }
}
