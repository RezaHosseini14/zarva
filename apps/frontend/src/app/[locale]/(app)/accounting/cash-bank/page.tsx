import { setRequestLocale } from 'next-intl/server';

import { AccountingSectionLoader } from '@/features/accounting/accounting-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <AccountingSectionLoader
        navKey="cashBank"
        descriptionKey="hub.cash"
        section="cash-bank"
      />
  );
}
