'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { MoneyText, WeightText } from '@/components/business/metrics';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { POS_ICON_TILE, POS_PANEL } from '@/features/sales/sales-pos-layout';
import { cn } from '@/lib/utils';
import type { IInventoryRow } from '@zarva/shared';

export interface IPosCartLine {
  readonly id: string;
  readonly name: string;
  readonly weightGrams: number;
  readonly purityKarat: number;
  readonly rateIrt: number;
  readonly wageIrt: number;
  readonly profitIrt: number;
  readonly taxIrt: number;
  readonly discountIrt: number;
  readonly lineTotalIrt: number;
}

interface IProps {
  readonly products: ReadonlyArray<IInventoryRow>;
  readonly lines: ReadonlyArray<IPosCartLine>;
  readonly onAdd: (line: IPosCartLine) => void;
  readonly onRemove: (id: string) => void;
  readonly defaultRateIrt: number;
}

function parseNum(raw: string, fallback = 0): number {
  const n = Number(String(raw).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function parseKarat(raw: string): number {
  const n = parseNum(raw, 18);
  if (n <= 0) return 18;
  if (n > 24) return Math.round((n / 1000) * 24) || 18;
  return n;
}

export function SalesPosCartPanel({
  products,
  lines,
  onAdd,
  onRemove,
  defaultRateIrt,
}: IProps) {
  const t = useTranslations('modules.sales');
  const [query, setQuery] = useState('');
  const [weight, setWeight] = useState('8');
  const [karat, setKarat] = useState('18');
  const [wage, setWage] = useState('0');
  const [profit, setProfit] = useState('0');
  const [tax, setTax] = useState('0');
  const [discount, setDiscount] = useState('0');

  const matched =
    products.find(
      (p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        p.id === query.trim(),
    ) ?? null;

  function handleAdd() {
    const weightGrams =
      parseNum(weight) || parseNum(matched?.weight ?? '') || 1;
    const purityKarat = parseKarat(karat || matched?.purity || '18');
    const rateIrt = defaultRateIrt > 0 ? defaultRateIrt : 1;
    const wageIrt = parseNum(wage);
    const profitIrt = parseNum(profit);
    const taxIrt = parseNum(tax);
    const discountIrt = parseNum(discount);
    const goldValue = Math.round(weightGrams * rateIrt * (purityKarat / 24));
    const lineTotalIrt = goldValue + wageIrt + profitIrt + taxIrt - discountIrt;
    const name =
      matched?.name ||
      query.trim() ||
      t('posManualItem', { karat: purityKarat });
    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      weightGrams,
      purityKarat,
      rateIrt,
      wageIrt,
      profitIrt,
      taxIrt,
      discountIrt,
      lineTotalIrt,
    });
    setQuery('');
  }

  return (
    <section className={cn(POS_PANEL, 'lg:col-span-7')}>
      <header className="mb-4 flex items-center gap-3">
        <span
          className={cn(POS_ICON_TILE, 'bg-primary/15 text-primary ring-primary/25')}
        >
          <Icon name="cart-large-2-bold" className="text-lg" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-none text-foreground">
            {t('posCartTitle')}
          </h3>
          <p className="mt-1.5 text-[11px] font-medium leading-none text-secondary">
            {t('posCartCount', { count: lines.length })}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        <div className="relative min-w-0 flex-1">
          <Icon
            name="barcode-bold"
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-base text-muted-fg"
          />
          <Input
            className="ps-10"
            placeholder={t('posScan')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('posScan')}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={t('cols.weight')}
            aria-label={t('cols.weight')}
          />
          <Input
            value={karat}
            onChange={(e) => setKarat(e.target.value)}
            placeholder={t('posKarat')}
            aria-label={t('posKarat')}
          />
          <Input
            value={wage}
            onChange={(e) => setWage(e.target.value)}
            placeholder={t('posWage')}
            aria-label={t('posWage')}
            className="zarva-num"
          />
          <Input
            value={profit}
            onChange={(e) => setProfit(e.target.value)}
            placeholder={t('posProfit')}
            aria-label={t('posProfit')}
            className="zarva-num"
          />
          <Input
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            placeholder={t('posTax')}
            aria-label={t('posTax')}
            className="zarva-num"
          />
          <Input
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder={t('posDiscount')}
            aria-label={t('posDiscount')}
            className="zarva-num"
          />
          <Button
            type="button"
            variant="primary"
            className="h-11 px-5 sm:col-span-3"
            onClick={handleAdd}
          >
            <Icon name="add-circle-bold" className="text-base" />
            {t('posAdd')}
          </Button>
        </div>
      </div>

      <div className="zarva-scrollbar mt-4 min-h-0 flex-1 space-y-1.5 overflow-auto pe-0.5">
        {lines.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted-fg">
            {t('posCartEmpty')}
          </p>
        ) : (
          lines.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5',
                'bg-nested/60 ring-1 ring-border/50',
              )}
            >
              <span
                className={cn(POS_ICON_TILE, 'size-9 bg-info/12 text-info ring-info/25')}
              >
                <Icon name="box-bold" className="text-base" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium tracking-tight text-foreground">
                  {item.name}
                </p>
                <p className="zarva-num mt-1 text-[11px] font-semibold text-primary">
                  <WeightText grams={String(item.weightGrams)} />
                  <span className="mx-1.5 text-border">·</span>
                  <span className="text-muted-fg">{item.purityKarat}k</span>
                </p>
              </div>
              <span className="zarva-num shrink-0 text-sm font-semibold tabular-nums text-foreground">
                <MoneyText value={String(item.lineTotalIrt)} />
              </span>
              <Button
                type="button"
                variant="ghost"
                className="h-9 w-9 shrink-0 p-0"
                aria-label={t('posRemove')}
                onClick={() => onRemove(item.id)}
              >
                <Icon name="close-circle-bold" className="text-base" />
              </Button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
