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
import { BranchesService } from './branches.service';
import { AssignBranchUserDto, CreateBranchDto, UpdateBranchDto } from './dto/branches.dto';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(
    private readonly branches: BranchesService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'branches');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Branch location KPIs' })
  async summary(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.branches.summary(user);
  }

  @Get()
  @ApiOperation({ summary: 'List branches' })
  async list(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.branches.list(user);
  }

  @Post()
  async create(@CurrentUser() user: IAuthUser, @Body() dto: CreateBranchDto) {
    await this.gate(user);
    return this.branches.create(user, dto);
  }

  @Get(':id')
  async get(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.branches.get(user, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    await this.gate(user);
    return this.branches.update(user, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.branches.remove(user, id);
  }

  @Post(':id/assign-user')
  async assignUser(
    @CurrentUser() user: IAuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignBranchUserDto,
  ) {
    await this.gate(user);
    return this.branches.assignUser(user, id, dto);
  }
}
