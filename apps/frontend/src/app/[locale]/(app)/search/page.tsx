import { setRequestLocale } from 'next-intl/server';

import { SearchSectionLoader } from '@/features/search/search-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ readonly q?: string }>;
}

export default async function Page({ params, searchParams }: IPageProps) {
  const { locale } = await params;
  const { q = '' } = await searchParams;
  setRequestLocale(locale);

  return (
      <SearchSectionLoader query={q} />
  );
}
