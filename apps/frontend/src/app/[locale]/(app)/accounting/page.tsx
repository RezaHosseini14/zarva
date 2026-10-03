import { setRequestLocale } from 'next-intl/server';

import { AccountingHubSection } from '@/features/accounting/accounting-hub-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <AccountingHubSection />
  );
}
