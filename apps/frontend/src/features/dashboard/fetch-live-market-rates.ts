import type { ILiveRate, ILiveRatesResponse, LiveRateId, LiveRateTrend } from '@zarva/shared';

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

interface IGoldApiSpot {
  readonly price?: number;
  readonly updatedAt?: string;
}

const TOTAL_BUDGET_MS = 4_000;
const ONE_FETCH_MS = 2_500;

let lastGood: ILiveRatesResponse | null = null;

function parseNumber(value: string | number | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const parsed = Number(value.replaceAll(',', '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function trendFrom(dt: string | undefined, delta: number): LiveRateTrend {
  if (dt === 'high' || delta > 0) return 'up';
  if (dt === 'low' || delta < 0) return 'down';
  return 'flat';
}

function parseUpdatedAt(ts: string | undefined): string {
  if (!ts) return new Date().toISOString();
  const parsed = Date.parse(ts.replace(' ', 'T'));
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
  return new Date().toISOString();
}

function withBudget<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

function fromTgju(
  item: ITgjuItem | undefined,
  id: LiveRateId,
  currency: ILiveRate['currency'],
  unit: ILiveRate['unit'],
  toToman: boolean,
): ILiveRate | null {
  if (!item) return null;
  const raw = parseNumber(item.p);
  if (raw === null || raw <= 0) return null;
  const price = toToman ? raw / 10 : raw;
  const rawChange = parseNumber(item.d) ?? 0;
  const changeAmount = toToman ? rawChange / 10 : rawChange;
  const changePercent = parseNumber(item.dp) ?? 0;

  return {
    id,
    price,
    currency,
    unit,
    changeAmount,
    changePercent,
    tickTrend: trendFrom(item.dt, changeAmount),
    dayTrend: trendFrom(item.dt, changeAmount),
    updatedAt: parseUpdatedAt(item.ts),
    status: 'live',
  };
}

function unavailable(
  id: LiveRateId,
  currency: ILiveRate['currency'],
  unit: ILiveRate['unit'],
): ILiveRate {
  return {
    id,
    price: 0,
    currency,
    unit,
    changeAmount: 0,
    changePercent: 0,
    tickTrend: 'flat',
    dayTrend: 'flat',
    updatedAt: new Date(0).toISOString(),
    status: 'unavailable',
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const kill = setTimeout(() => controller.abort(), ONE_FETCH_MS);
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(kill);
  }
}

async function fetchTgju(): Promise<ITgjuAjax | null> {
  const first = await fetchJson<ITgjuAjax>('https://call5.tgju.org/ajax.json');
  if (first?.current) return first;
  const second = await fetchJson<ITgjuAjax>('https://call1.tgju.org/ajax.json');
  if (second?.current) return second;
  return null;
}

async function fetchGlobalGold(): Promise<ILiveRate | null> {
  const body = await fetchJson<IGoldApiSpot>('https://api.gold-api.com/price/XAU');
  if (!body || typeof body.price !== 'number' || !Number.isFinite(body.price)) {
    return null;
  }
  return {
    id: 'xau_usd',
    price: body.price,
    currency: 'USD',
    unit: 'oz',
    changeAmount: 0,
    changePercent: 0,
    tickTrend: 'flat',
    dayTrend: 'flat',
    updatedAt: body.updatedAt ?? new Date().toISOString(),
    status: 'live',
  };
}

function hasAnyLive(rates: ReadonlyArray<ILiveRate>): boolean {
  return rates.some((r) => r.status === 'live' && r.price > 0);
}

function emptyPayload(): ILiveRatesResponse {
  return {
    polledAt: new Date().toISOString(),
    rates: [
      unavailable('xau_usd', 'USD', 'oz'),
      unavailable('iran_gold_24k', 'IRT', 'gram'),
      unavailable('iran_gold_18k', 'IRT', 'gram'),
      unavailable('usd_irr', 'IRT', 'usd'),
    ],
  };
}

async function loadRates(): Promise<ILiveRatesResponse> {
  const [tgju, globalGold] = await Promise.all([fetchTgju(), fetchGlobalGold()]);
  const current = tgju?.current;
  const xau =
    globalGold ?? fromTgju(current?.ons, 'xau_usd', 'USD', 'oz', false);

  const rates: ILiveRate[] = [
    xau ?? unavailable('xau_usd', 'USD', 'oz'),
    fromTgju(current?.geram24, 'iran_gold_24k', 'IRT', 'gram', true) ??
      unavailable('iran_gold_24k', 'IRT', 'gram'),
    fromTgju(current?.geram18, 'iran_gold_18k', 'IRT', 'gram', true) ??
      unavailable('iran_gold_18k', 'IRT', 'gram'),
    fromTgju(current?.price_dollar_rl, 'usd_irr', 'IRT', 'usd', true) ??
      unavailable('usd_irr', 'IRT', 'usd'),
  ];

  return { rates, polledAt: new Date().toISOString() };
}

export async function fetchLiveMarketRates(): Promise<ILiveRatesResponse> {
  const payload = await withBudget(loadRates(), TOTAL_BUDGET_MS, emptyPayload());

  if (hasAnyLive(payload.rates)) {
    lastGood = payload;
    return payload;
  }

  if (lastGood) {
    return {
      rates: lastGood.rates.map((r) =>
        r.status === 'unavailable' ? r : { ...r, status: 'stale' as const },
      ),
      polledAt: lastGood.polledAt,
    };
  }

  return payload;
}
