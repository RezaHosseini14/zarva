'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { EmptyState } from '@/components/page/empty-state';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { IPlanRow } from '@/features/pricing/get-public-plans';
import { cn } from '@/lib/utils';

interface IPricingPlansClientProps {
  readonly plans: ReadonlyArray<IPlanRow>;
}

export function PricingPlansClient({ plans }: IPricingPlansClientProps) {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [interval, setInterval] = useState<'month' | 'year'>('month');

  const visible = useMemo(() => plans.filter((p) => p.code !== 'trial' || p.prices.length === 0), [plans]);

  if (visible.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-md">
        <EmptyState
          bordered
          icon="card-bold"
          accent="bg-primary/15 text-primary ring-primary/25"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-5xl">
      <div className="mb-6 flex justify-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={interval === 'month' ? 'primary' : 'ghost'}
          onClick={() => setInterval('month')}
        >
          {t('monthly')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={interval === 'year' ? 'primary' : 'ghost'}
          onClick={() => setInterval('year')}
        >
          {t('yearly')}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visible.map((plan, index) => {
          const price = plan.prices.find((p) => p.interval === interval);
          const isFeatured = index === 1;
          const priceLabel = price
            ? `$${(price.amountCents / 100).toFixed(0)}`
            : plan.code === 'trial'
              ? t('free')
              : '—';
          return (
            <article
              key={plan.id}
              className={cn(
                'zarva-glass-card flex min-h-[9rem] flex-col overflow-hidden sm:min-h-[9.5rem]',
                isFeatured && 'ring-1 ring-primary/25',
              )}
            >
              <div className="flex flex-1 items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
                <span
                  className={cn(
                    'inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-1',
                    isFeatured
                      ? 'bg-primary/20 text-primary ring-primary/30'
                      : 'bg-primary/15 text-primary ring-primary/25',
                  )}
                >
                  <Icon name="card-bold" className="text-lg" />
                </span>
                <h2 className="min-w-0 truncate text-sm font-bold leading-none tracking-tight text-foreground">
                  {plan.name}
                </h2>
              </div>
              <div className="mt-4 border-t border-primary/12 bg-nested/70 px-4 py-3 sm:px-5">
                <div className="flex items-end justify-between gap-3">
                  <p className="zarva-num min-w-0 truncate text-[1.65rem] font-semibold leading-none tracking-tight text-primary">
                    {priceLabel}
                    {price ? (
                      <span className="ms-1 text-sm font-normal text-muted-fg">
                        /{interval === 'year' ? t('yearly') : t('monthly')}
                      </span>
                    ) : null}
                  </p>
                </div>
                <Button asChild variant={isFeatured ? 'primary' : 'ghost'} className="mt-3 w-full">
                  <Link href={`/${locale}/signup`}>{t('cta')}</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
