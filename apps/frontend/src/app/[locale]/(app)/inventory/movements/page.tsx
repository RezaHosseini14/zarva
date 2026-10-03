import { setRequestLocale } from 'next-intl/server';

import { InventorySectionLoader } from '@/features/inventory/inventory-section-loader';
import { getInventoryListPageProps } from '@/lib/inventory/inventory-list-page-props';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const props = await getInventoryListPageProps('movements');

  return (
      <InventorySectionLoader {...props} />
  );
}
