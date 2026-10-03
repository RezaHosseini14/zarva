import { setRequestLocale } from 'next-intl/server';

import { PurchasesReturnsSection } from '@/features/purchases/purchases-returns-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <PurchasesReturnsSection />
  );
}
