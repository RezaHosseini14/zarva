import { setRequestLocale } from 'next-intl/server';

import { JewelrySectionLoader } from '@/features/jewelry/jewelry-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <JewelrySectionLoader />
  );
}
