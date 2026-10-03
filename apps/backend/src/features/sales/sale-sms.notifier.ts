import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SaleSmsEvent } from '@zarva/shared';

import { SmsService } from '../sms/sms.service';
import { KAVENEGAR_TEMPLATES } from '../sms/sms.types';

export interface ISaleSmsPayload {
  readonly phone: string;
  readonly invoiceNumber: string;
  readonly goldWeightGrams: string;
  readonly amountIRT: string;
  readonly remainingIRT?: string;
}

@Injectable()
export class SaleSmsNotifier {
  private readonly logger = new Logger(SaleSmsNotifier.name);

  constructor(
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {}

  async notify(event: SaleSmsEvent, payload: ISaleSmsPayload): Promise<void> {
    const template = this.templateFor(event);
    const token2 =
      event === 'payment_partial'
        ? (payload.remainingIRT ?? payload.amountIRT)
        : event === 'payment_paid' || event === 'completed'
          ? payload.amountIRT
          : event;
    try {
      await this.sms.sendLookup(payload.phone, template, {
        token: payload.invoiceNumber.replace(/\s+/g, '-'),
        token2: String(token2).replace(/\s+/g, '-'),
        token3: payload.goldWeightGrams.replace(/\s+/g, '-'),
      });
    } catch (err) {
      this.logger.error(
        `Sale SMS failed event=${event} invoice=${payload.invoiceNumber}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  private templateFor(event: SaleSmsEvent): string {
    const map: Record<SaleSmsEvent, { env: string; fallback: string }> = {
      confirmed: {
        env: 'KAVENEGAR_TEMPLATE_SALE_CONFIRMED',
        fallback: KAVENEGAR_TEMPLATES.saleConfirmed,
      },
      payment_partial: {
        env: 'KAVENEGAR_TEMPLATE_SALE_PAYMENT_PARTIAL',
        fallback: KAVENEGAR_TEMPLATES.salePaymentPartial,
      },
      payment_paid: {
        env: 'KAVENEGAR_TEMPLATE_SALE_PAYMENT_PAID',
        fallback: KAVENEGAR_TEMPLATES.salePaymentPaid,
      },
      ready: {
        env: 'KAVENEGAR_TEMPLATE_SALE_READY',
        fallback: KAVENEGAR_TEMPLATES.saleReady,
      },
      completed: {
        env: 'KAVENEGAR_TEMPLATE_SALE_COMPLETED',
        fallback: KAVENEGAR_TEMPLATES.saleCompleted,
      },
      void: {
        env: 'KAVENEGAR_TEMPLATE_SALE_VOID',
        fallback: KAVENEGAR_TEMPLATES.saleVoid,
      },
    };
    const entry = map[event];
    return this.config.get<string>(entry.env) ?? entry.fallback;
  }
}
