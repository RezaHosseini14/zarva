import { setRequestLocale } from 'next-intl/server';

import { BillingSection } from '@/features/billing/billing-section';

interface IBillingPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function BillingPage({ params }: IBillingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <BillingSection />
  );
}
