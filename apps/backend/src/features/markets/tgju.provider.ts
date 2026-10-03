import { Injectable, Logger } from '@nestjs/common';

import type { IRawQuote } from './markets.types';

interface ITgjuItem {
  readonly p?: string;
  readonly d?: string;
  readonly dp?: number | string;
  readonly dt?: string;
  readonly ts?: string;
}

interface ITgjuAjax {
  readonly current?: Record<string, ITgjuItem>;
}

@Injectable()
export class TgjuProvider {
  private readonly logger = new Logger(TgjuProvider.name);

  async fetchIranQuotes(): Promise<ReadonlyArray<IRawQuote>> {
    const urls = [
      'https://call5.tgju.org/ajax.json',
      'https://call1.tgju.org/ajax.json',
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) {
          this.logger.warn(`TGJU HTTP ${res.status} (${url})`);
          continue;
        }
        const body = (await res.json()) as ITgjuAjax;
        const current = body.current;
        if (!current) continue;

        const quotes: IRawQuote[] = [];
        const usd = this.parseRialItem(current.price_dollar_rl, 'usd_irr', 'usd');
        if (usd) quotes.push(usd);
        const g18 = this.parseRialItem(current.geram18, 'iran_gold_18k', 'gram');
        if (g18) quotes.push(g18);
        const g24 = this.parseRialItem(current.geram24, 'iran_gold_24k', 'gram');
        if (g24) quotes.push(g24);

        if (quotes.length > 0) {
          return quotes;
        }
      } catch (error) {
        this.logger.warn(
          `TGJU fetch failed (${url}): ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }

    return [];
  }

  private parseRialItem(
    item: ITgjuItem | undefined,
    id: IRawQuote['id'],
    unit: IRawQuote['unit'],
  ): IRawQuote | null {
    if (!item) return null;
    const rial = this.toNumber(item.p);
    if (rial === null || rial <= 0) return null;
    const changeRial = this.toNumber(item.d) ?? 0;
    const changePercent = this.toNumber(item.dp) ?? 0;
    const updatedAt = item.ts
      ? new Date(item.ts.replace(' ', 'T') + '+03:30').toISOString()
      : new Date().toISOString();

    return {
      id,
      price: rial / 10,
      currency: 'IRT',
      unit,
      dayChangeAmount: changeRial / 10,
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
