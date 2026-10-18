'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { PageHeader } from '@/components/page/page-header';
import { SectionLoadError } from '@/components/page/section-load-error';
import { Button } from '@/components/ui/button';
import {
  SalesPosCartPanel,
  type IPosCartLine,
} from '@/features/sales/sales-pos-cart-panel';
import { SalesPosCheckoutPanel } from '@/features/sales/sales-pos-checkout-panel';
import { AppShell } from '@/features/shell/app-shell';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';
import type { IGoldLockedRate, IInventoryRow, ISaleCustomer } from '@zarva/shared';

interface IProps {
  readonly products: ReadonlyArray<IInventoryRow>;
  readonly customers: ReadonlyArray<ISaleCustomer>;
  readonly lockedRate: IGoldLockedRate | null;
  readonly customerSmsEnabled?: boolean;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function SalesPosPage({
  products,
  customers,
  lockedRate,
  customerSmsEnabled = false,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.sales');
  const locale = useLocale();
  const isBody = chrome === 'body';
  const [lines, setLines] = useState<IPosCartLine[]>([]);

  const defaultRate = useMemo(
    () => lockedRate?.sellRateIrt ?? lockedRate?.buyRateIrt ?? 0,
    [lockedRate],
  );

  const body = (
    <>
      {isBody ? null : (
        <PageHeader
          title={t('posTitle')}
          description={t('posDescription')}
          action={
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/sales`}>{t('nav.invoices')}</Link>
            </Button>
          }
        />
      )}
      {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <SalesPosCartPanel
          products={products}
          lines={lines}
          defaultRateIrt={defaultRate}
          onAdd={(line) => setLines((prev) => [...prev, line])}
          onRemove={(id) => setLines((prev) => prev.filter((l) => l.id !== id))}
        />
        <SalesPosCheckoutPanel
          customers={customers}
          lines={lines}
          lockedRate={lockedRate}
          customerSmsEnabled={customerSmsEnabled}
          onCleared={() => setLines([])}
        />
      </div>
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('posTitle')}>{body}</AppShell>;
}
