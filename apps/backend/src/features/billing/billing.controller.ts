import { Body, Controller, Get, Headers, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';

import { Public } from '../../common/public.decorator';
import { CurrentUser } from '../../common/current-user.decorator';
import type { IAuthUser } from '../auth/auth.types';
import { BillingService } from './billing.service';

class CheckoutDto {
  @ApiProperty()
  @IsString()
  priceId!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  successUrl!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  cancelUrl!: string;
}

class PortalDto {
  @ApiProperty()
  @IsUrl({ require_tld: false })
  returnUrl!: string;
}

interface IRawBodyRequest extends Request {
  rawBody?: Buffer;
}

@ApiTags('Billing')
@Controller()
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('plans')
  @ApiTags('Plans')
  @ApiOperation({ summary: 'List sellable plans' })
  listPlans() {
    return this.billing.listPlans();
  }

  @Get('billing/subscription')
  @ApiBearerAuth()
  @ApiTags('Subscriptions')
  @ApiOperation({ summary: 'Current org subscription' })
  getSubscription(@CurrentUser() user: IAuthUser) {
    return this.billing.getSubscription(user.organizationId);
  }

  @Get('billing/checkout-provider')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Checkout provider mode for UI (stripe vs mock)' })
  getCheckoutProvider() {
    return { provider: this.billing.getCheckoutProviderLabel() };
  }

  @Post('billing/checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create checkout session' })
  checkout(@CurrentUser() user: IAuthUser, @Body() dto: CheckoutDto) {
    return this.billing.createCheckout(user, dto.priceId, dto.successUrl, dto.cancelUrl);
  }

  @Post('billing/portal')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer portal session' })
  portal(@CurrentUser() user: IAuthUser, @Body() dto: PortalDto) {
    return this.billing.createPortal(user, dto.returnUrl);
  }

  @Public()
  @Post('billing/webhooks/stripe')
  @ApiOperation({ summary: 'Stripe webhook (idempotent)' })
  async webhook(
    @Req() req: IRawBodyRequest,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    if (this.config.get('BILLING_PROVIDER') === 'stripe' && req.rawBody) {
      return this.billing.handleStripeWebhook(req.rawBody, signature);
    }

    const eventId =
      (req.headers['stripe-event-id'] as string | undefined) ??
      (req.body as { id?: string })?.id ??
      randomUUID();
    const type = (req.body as { type?: string })?.type ?? 'unknown';
    return this.billing.handleWebhook('stripe', eventId, type, req.body);
  }
}
