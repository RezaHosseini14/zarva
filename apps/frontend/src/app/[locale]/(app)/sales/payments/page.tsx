import { setRequestLocale } from 'next-intl/server';

import { SalesPaymentsSection } from '@/features/sales/sales-payments-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <SalesPaymentsSection />
  );
}
