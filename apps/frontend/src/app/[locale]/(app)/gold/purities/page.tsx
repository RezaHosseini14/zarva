import { setRequestLocale } from 'next-intl/server';

import { GoldSectionLoader } from '@/features/gold/gold-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <GoldSectionLoader kind="purities" navKey="purities" descriptionKey="puritiesDescription" />
  );
}
