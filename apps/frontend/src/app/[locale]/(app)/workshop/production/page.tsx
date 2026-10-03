import { setRequestLocale } from 'next-intl/server';

import { WorkshopProductionSection } from '@/features/workshop/workshop-production-section';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <WorkshopProductionSection />
  );
}
