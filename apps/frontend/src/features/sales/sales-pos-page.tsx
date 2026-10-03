'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { PageHeader } from '@/components/page/page-header';
import { SectionLoadError } from '@/components/page/section-load-error';
import { Button } from '@/components/ui/button';
import { SalesPosCartPanel } from '@/features/sales/sales-pos-cart-panel';
import { SalesPosCheckoutPanel } from '@/features/sales/sales-pos-checkout-panel';
import { AppShell } from '@/features/shell/app-shell';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';
import type { IInventoryRow } from '@zarva/shared';

interface IProps {
  readonly products: ReadonlyArray<IInventoryRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function SalesPosPage({
  products,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.sales');
  const locale = useLocale();
  const isBody = chrome === 'body';

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
        <SalesPosCartPanel products={products} />
        <SalesPosCheckoutPanel />
      </div>
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('posTitle')}>{body}</AppShell>;
}
