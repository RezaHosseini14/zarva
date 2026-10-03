'use client';

import { useTranslations } from 'next-intl';

import { MoneyText, WeightText } from '@/components/business/metrics';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { POS_ICON_TILE, POS_PANEL } from '@/features/sales/sales-pos-layout';
import { cn } from '@/lib/utils';
import type { IInventoryRow } from '@zarva/shared';

interface IPosLine {
  readonly id: string;
  readonly name: string;
  readonly weight: string;
  readonly value: string;
}

interface IProps {
  readonly products: ReadonlyArray<IInventoryRow>;
}

export function SalesPosCartPanel({ products }: IProps) {
  const t = useTranslations('modules.sales');
  const rows: ReadonlyArray<IPosLine> =
    products.length > 0
      ? products.slice(0, 20).map((p) => ({
          id: p.id,
          name: p.name,
          weight: String(p.weight),
          value: String(p.value),
        }))
      : [{ id: 'sample', name: t('posSampleItem'), weight: '8.20', value: '—' }];
  const count = products.length > 0 ? Math.min(products.length, 20) : 1;

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
            {t('posCartCount', { count })}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Icon
            name="barcode-bold"
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-base text-muted-fg"
          />
          <Input
            className="ps-10"
            placeholder={t('posScan')}
            autoFocus
            aria-label={t('posScan')}
          />
        </div>
        <Button type="button" variant="primary" className="h-11 px-5 sm:shrink-0">
          <Icon name="add-circle-bold" className="text-base" />
          {t('posAdd')}
        </Button>
      </div>

      <div className="zarva-scrollbar mt-4 min-h-0 flex-1 space-y-1.5 overflow-auto pe-0.5">
        {rows.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5',
              'bg-nested/60 ring-1 ring-border/50',
              'transition-colors hover:bg-hover/50 hover:ring-border',
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
                <WeightText grams={item.weight} />
                <span className="mx-1.5 text-border">·</span>
                <span className="text-muted-fg">{t('cols.weight')}</span>
              </p>
            </div>
            <span className="zarva-num shrink-0 text-sm font-semibold tabular-nums text-foreground">
              <MoneyText value={item.value} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
