import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IRawQuote } from './markets.types';

interface IGoldApiResponse {
  readonly price?: number;
  readonly change?: number;
  readonly change_percent?: number;
  readonly timestamp?: number;
}

interface IFreeGoldApiResponse {
  readonly price?: number;
  readonly updatedAt?: string;
}

@Injectable()
export class GoldApiProvider {
  private readonly logger = new Logger(GoldApiProvider.name);

  constructor(private readonly config: ConfigService) {}

  async fetchXauUsd(): Promise<IRawQuote | null> {
    const keyed = await this.fetchGoldApiIo();
    if (keyed) return keyed;
    return this.fetchFreeGoldApi();
  }

  private async fetchGoldApiIo(): Promise<IRawQuote | null> {
    const apiKey = this.config.get<string>('GOLD_API_KEY')?.trim();
    if (!apiKey) return null;

    try {
      const res = await fetch('https://www.goldapi.io/api/price/XAU/USD', {
        headers: {
          'x-access-token': apiKey,
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        this.logger.warn(`GoldAPI.io HTTP ${res.status}`);
        return null;
      }
      const body = (await res.json()) as IGoldApiResponse;
      if (typeof body.price !== 'number' || !Number.isFinite(body.price)) {
        return null;
      }
      const changeAmount = typeof body.change === 'number' ? body.change : 0;
      const changePercent =
        typeof body.change_percent === 'number' ? body.change_percent : 0;
      const updatedAt =
        typeof body.timestamp === 'number'
          ? new Date(body.timestamp * 1000).toISOString()
          : new Date().toISOString();

      return {
        id: 'xau_usd',
        price: body.price,
        currency: 'USD',
        unit: 'oz',
        dayChangeAmount: changeAmount,
        dayChangePercent: changePercent,
        updatedAt,
      };
    } catch (error) {
      this.logger.warn(
        `GoldAPI.io failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return null;
    }
  }

  private async fetchFreeGoldApi(): Promise<IRawQuote | null> {
    try {
      const res = await fetch('https://api.gold-api.com/price/XAU', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        this.logger.warn(`gold-api.com HTTP ${res.status}`);
        return null;
      }
      const body = (await res.json()) as IFreeGoldApiResponse;
      if (typeof body.price !== 'number' || !Number.isFinite(body.price)) {
        return null;
      }
      return {
        id: 'xau_usd',
        price: body.price,
        currency: 'USD',
        unit: 'oz',
        dayChangeAmount: 0,
        dayChangePercent: 0,
        updatedAt: body.updatedAt ?? new Date().toISOString(),
      };
    } catch (error) {
      this.logger.warn(
        `gold-api.com failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return null;
    }
  }
}
