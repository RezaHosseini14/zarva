import { setRequestLocale } from 'next-intl/server';

import { SalesPosSection } from '@/features/sales/sales-pos-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <SalesPosSection />
  );
}
