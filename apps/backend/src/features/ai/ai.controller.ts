import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from '../billing/billing.service';
import { AiService } from './ai.service';
import { AiSummarizeDto, RefreshAiRulesDto } from './dto/ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly billing: BillingService,
  ) {}

  private async gate(user: IAuthUser): Promise<void> {
    await this.billing.assertModule(user.organizationId, 'ai');
  }

  @Get('insights')
  @ApiOperation({ summary: 'List active AI insights' })
  async list(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.ai.listInsights(user);
  }

  @Post('insights/refresh')
  async refresh(@CurrentUser() user: IAuthUser, @Body() dto: RefreshAiRulesDto) {
    await this.gate(user);
    return this.ai.refreshRules(user, dto);
  }

  @Post('insights/:id/dismiss')
  async dismiss(@CurrentUser() user: IAuthUser, @Param('id', ParseUUIDPipe) id: string) {
    await this.gate(user);
    return this.ai.dismiss(user, id);
  }

  @Get('capabilities')
  async capabilities(@CurrentUser() user: IAuthUser) {
    await this.gate(user);
    return this.ai.capabilities();
  }

  @Post('summarize')
  async summarize(@CurrentUser() user: IAuthUser, @Body() dto: AiSummarizeDto) {
    await this.gate(user);
    return this.ai.summarize(user, dto);
  }
}
