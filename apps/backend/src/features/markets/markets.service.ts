import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ILiveRate, ILiveRatesResponse, LiveRateId } from '@zarva/shared';

import { GoldApiProvider } from './gold-api.provider';
import { NavasanProvider } from './navasan.provider';
import { TgjuProvider } from './tgju.provider';
import type { ICachedRate, IRawQuote } from './markets.types';
import { trendFromDelta } from './markets.types';

const RATE_IDS: ReadonlyArray<LiveRateId> = [
  'xau_usd',
  'iran_gold_24k',
  'iran_gold_18k',
  'usd_irr',
];

const STALE_AFTER_MS = 120_000;

@Injectable()
export class MarketsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketsService.name);
  private readonly cache = new Map<LiveRateId, ICachedRate>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private polledAt: string = new Date(0).toISOString();
  private refreshing = false;

  constructor(
    private readonly config: ConfigService,
    private readonly goldApi: GoldApiProvider,
    private readonly tgju: TgjuProvider,
    private readonly navasan: NavasanProvider,
  ) {}

  onModuleInit(): void {
    void this.refresh();
    const pollMs = Number(this.config.get<string>('MARKETS_POLL_MS') ?? 15_000);
    this.timer = setInterval(() => {
      void this.refresh();
    }, Number.isFinite(pollMs) && pollMs >= 5_000 ? pollMs : 15_000);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getLiveRates(): ILiveRatesResponse {
    const now = Date.now();
    const rates = RATE_IDS.map((id) => this.toLiveRate(id, now));
    return { rates, polledAt: this.polledAt };
  }

  private toLiveRate(id: LiveRateId, now: number): ILiveRate {
    const cached = this.cache.get(id);
    if (!cached) {
      return this.unavailable(id);
    }

    const age = now - Date.parse(cached.fetchedAt);
    const status = age > STALE_AFTER_MS ? 'stale' : 'live';
    const dayTrend = trendFromDelta(cached.quote.dayChangeAmount);

    return {
      id,
      price: cached.quote.price,
      currency: cached.quote.currency,
      unit: cached.quote.unit,
      changeAmount: cached.quote.dayChangeAmount,
      changePercent: cached.quote.dayChangePercent,
      tickTrend: cached.tickTrend,
      dayTrend,
      updatedAt: cached.quote.updatedAt,
      status,
    };
  }

  private unavailable(id: LiveRateId): ILiveRate {
    const meta = this.metaFor(id);
    return {
      id,
      price: 0,
      currency: meta.currency,
      unit: meta.unit,
      changeAmount: 0,
      changePercent: 0,
      tickTrend: 'flat',
      dayTrend: 'flat',
      updatedAt: new Date(0).toISOString(),
      status: 'unavailable',
    };
  }

  private metaFor(id: LiveRateId): {
    readonly currency: ILiveRate['currency'];
    readonly unit: ILiveRate['unit'];
  } {
    switch (id) {
      case 'xau_usd':
        return { currency: 'USD', unit: 'oz' };
      case 'iran_gold_24k':
      case 'iran_gold_18k':
        return { currency: 'IRT', unit: 'gram' };
      case 'usd_irr':
        return { currency: 'IRT', unit: 'usd' };
      default: {
        const _exhaustive: never = id;
        throw new Error(`Unknown rate id: ${_exhaustive}`);
      }
    }
  }

  private async refresh(): Promise<void> {
    if (this.refreshing) return;
    this.refreshing = true;
    try {
      const [xau, tgjuQuotes, navasanQuotes] = await Promise.all([
        this.goldApi.fetchXauUsd(),
        this.tgju.fetchIranQuotes(),
        this.navasan.fetchIranQuotes(),
      ]);

      const byId = new Map<LiveRateId, IRawQuote>();
      for (const quote of tgjuQuotes) {
        byId.set(quote.id, quote);
      }
      for (const quote of navasanQuotes) {
        byId.set(quote.id, quote);
      }
      if (xau) {
        byId.set(xau.id, xau);
      }

      const fetchedAt = new Date().toISOString();
      for (const quote of byId.values()) {
        this.upsert(quote, fetchedAt);
      }
      if (byId.size > 0) {
        this.polledAt = fetchedAt;
      }
    } catch (error) {
      this.logger.warn(
        `Markets refresh failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    } finally {
      this.refreshing = false;
    }
  }

  private upsert(quote: IRawQuote, fetchedAt: string): void {
    const prev = this.cache.get(quote.id);
    const previousPrice = prev?.quote.price ?? null;
    const tickDelta =
      previousPrice === null ? 0 : quote.price - previousPrice;
    this.cache.set(quote.id, {
      quote,
      previousPrice,
      tickTrend: trendFromDelta(tickDelta),
      fetchedAt,
    });
  }
}
