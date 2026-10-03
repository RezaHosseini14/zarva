import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IRawQuote } from './markets.types';

interface INavasanItem {
  readonly value?: string | number;
  readonly change?: string | number;
  readonly timestamp?: number;
}

type INavasanLatest = Record<string, INavasanItem>;

const KARAT_24_FROM_18 = 24 / 18;

@Injectable()
export class NavasanProvider {
  private readonly logger = new Logger(NavasanProvider.name);

  constructor(private readonly config: ConfigService) {}

  async fetchIranQuotes(): Promise<ReadonlyArray<IRawQuote>> {
    const apiKey = this.config.get<string>('NAVASAN_API_KEY')?.trim();
    if (!apiKey) {
      return [];
    }

    try {
      const url = new URL('http://api.navasan.tech/latest/');
      url.searchParams.set('api_key', apiKey);
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`Navasan HTTP ${res.status}`);
        return [];
      }
      const body = (await res.json()) as INavasanLatest;
      const quotes: IRawQuote[] = [];

      const usd = this.parseItem(body.usd_sell, 'usd_irr', 'usd');
      if (usd) quotes.push(usd);

      const gold18 = this.parseItem(body['18ayar'], 'iran_gold_18k', 'gram');
      if (gold18) {
        quotes.push(gold18);
        const dayChange24 = gold18.dayChangeAmount * KARAT_24_FROM_18;
        const price24 = gold18.price * KARAT_24_FROM_18;
        quotes.push({
          id: 'iran_gold_24k',
          price: price24,
          currency: 'IRT',
          unit: 'gram',
          dayChangeAmount: dayChange24,
          dayChangePercent: gold18.dayChangePercent,
          updatedAt: gold18.updatedAt,
        });
      }

      return quotes;
    } catch (error) {
      this.logger.warn(
        `Navasan fetch failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return [];
    }
  }

  private parseItem(
    item: INavasanItem | undefined,
    id: IRawQuote['id'],
    unit: IRawQuote['unit'],
  ): IRawQuote | null {
    if (!item) return null;
    const price = this.toNumber(item.value);
    if (price === null || price <= 0) return null;
    const dayChangeAmount = this.toNumber(item.change) ?? 0;
    const changePercent =
      price - dayChangeAmount !== 0
        ? (dayChangeAmount / (price - dayChangeAmount)) * 100
        : 0;
    const updatedAt =
      typeof item.timestamp === 'number'
        ? new Date(item.timestamp * 1000).toISOString()
        : new Date().toISOString();

    return {
      id,
      price,
      currency: 'IRT',
      unit,
      dayChangeAmount,
      dayChangePercent: changePercent,
      updatedAt,
    };
  }

  private toNumber(value: string | number | undefined): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replaceAll(',', '').trim());
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }
}
