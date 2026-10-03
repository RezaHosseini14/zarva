import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import {
  CreateJewelryBomLineDto,
  CreateJewelryPieceDto,
  CreateJewelryReservationDto,
  UpdateJewelryPieceDto,
} from './dto/jewelry.dto';
import { JewelryService } from './jewelry.service';

@ApiTags('Jewelry')
@ApiBearerAuth()
@Controller('jewelry')
export class JewelryController {
  constructor(
    private readonly jewelry: JewelryService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'jewelry');
  }

  @Get('pieces')
  @ApiOperation({ summary: 'List jewelry pieces' })
  async listPieces(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.jewelry.listPieces(user);
  }

  @Post('pieces')
  async createPiece(@CurrentUser() user: IAuthUser, @Body() dto: CreateJewelryPieceDto) {
    await this.gate(user);
    return this.jewelry.createPiece(user, dto);
  }

  @Patch('pieces/:id')
  async updatePiece(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJewelryPieceDto,
  ) {
    await this.gate(user);
    return this.jewelry.updatePiece(user, id, dto);
  }

  @Delete('pieces/:id')
  async removePiece(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.jewelry.removePiece(user, id);
  }

  @Get('pieces/:id/bom')
  async listBom(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.jewelry.listBomLines(user, id);
  }

  @Post('pieces/:id/bom')
  async addBomLine(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateJewelryBomLineDto,
  ) {
    await this.gate(user);
    return this.jewelry.addBomLine(user, id, dto);
  }

  @Post('pieces/:id/reservations')
  async reserve(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateJewelryReservationDto,
  ) {
    await this.gate(user);
    return this.jewelry.createReservation(user, id, dto);
  }
}
