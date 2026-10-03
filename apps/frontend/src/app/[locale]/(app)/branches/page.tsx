import { setRequestLocale } from 'next-intl/server';

import { BranchesSectionLoader } from '@/features/branches/branches-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <BranchesSectionLoader />
  );
}
