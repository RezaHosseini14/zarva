import { setRequestLocale } from 'next-intl/server';

import { ReportsHubPage } from '@/features/reports/reports-hub-page';

interface IProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ReportsHubPage />;
}
