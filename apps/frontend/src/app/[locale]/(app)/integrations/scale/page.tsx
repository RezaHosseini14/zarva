import { setRequestLocale } from 'next-intl/server';

import { IntegrationsSectionLoader } from '@/features/integrations/integrations-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <IntegrationsSectionLoader moduleKey="integrationsScale" kind="scale" />
  );
}
