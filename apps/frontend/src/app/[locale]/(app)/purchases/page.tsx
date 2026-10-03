import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { PurchasesListSection } from '@/features/purchases/purchases-list-section';
import {
  PURCHASES_LIST_COLUMN_KEYS,
  PURCHASES_LIST_KPI_SLOTS,
  resolvePurchasesColumnHeaders,
  resolvePurchasesSkeletonKpis,
} from '@/features/purchases/purchases-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.purchases');

  return (
    <StreamedDomainChrome
      messageNs="modules.purchases"
      skeletonKpis={resolvePurchasesSkeletonKpis(t, PURCHASES_LIST_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={resolvePurchasesColumnHeaders(t, PURCHASES_LIST_COLUMN_KEYS)}
      action={
        <Button asChild>
          <Link href={`/${locale}/purchases/new`}>{t('newPurchase')}</Link>
        </Button>
      }
    >
      <PurchasesListSection chrome="body" />
    </StreamedDomainChrome>
  );
}
