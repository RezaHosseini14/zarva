import { setRequestLocale } from 'next-intl/server';

import { CommerceSectionLoader } from '@/features/commerce/commerce-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <CommerceSectionLoader />
  );
}
