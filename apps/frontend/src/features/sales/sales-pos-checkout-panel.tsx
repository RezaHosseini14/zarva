'use client';

import { useTranslations } from 'next-intl';

import { MoneyText } from '@/components/business/metrics';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { POS_ICON_TILE, POS_PANEL } from '@/features/sales/sales-pos-layout';
import { cn } from '@/lib/utils';

export function SalesPosCheckoutPanel() {
  const t = useTranslations('modules.sales');

  return (
    <aside className={cn(POS_PANEL, 'lg:col-span-5')}>
      <header className="mb-4 flex items-center gap-3">
        <span
          className={cn(POS_ICON_TILE, 'bg-success/15 text-success ring-success/25')}
        >
          <Icon name="wallet-money-bold" className="text-lg" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-none text-foreground">
            {t('posCheckout')}
          </h3>
          <p className="mt-1.5 text-[11px] font-medium leading-none text-secondary">
            {t('posCheckoutHint')}
          </p>
        </div>
      </header>

      <label className="block space-y-1.5 text-sm">
        <span className="text-secondary">{t('cols.customer')}</span>
        <div className="relative">
          <Icon
            name="user-bold"
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-base text-muted-fg"
          />
          <Input className="ps-10" placeholder={t('posCustomerPh')} />
        </div>
      </label>

      <div className="mt-auto space-y-3 pt-4">
        <div className="rounded-xl bg-nested/70 p-3.5 ring-1 ring-border/50">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-secondary">{t('posSubtotal')}</span>
            <span className="zarva-num font-medium tabular-nums">
              <MoneyText value="۵۴۰ م.ریال" />
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-3 text-sm">
            <span className="text-secondary">{t('posTax')}</span>
            <span className="zarva-num tabular-nums text-muted-fg">—</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-primary/15 pt-3">
            <span className="text-sm font-semibold text-foreground">{t('posTotal')}</span>
            <span className="zarva-num text-xl font-bold tabular-nums tracking-tight text-primary">
              <MoneyText value="۵۴۰ م.ریال" />
            </span>
          </div>
        </div>

        <Button type="button" variant="primary" className="h-12 w-full text-sm font-semibold">
          <Icon name="hand-money-bold" className="text-lg" />
          {t('posPay')}
        </Button>
      </div>
    </aside>
  );
}
