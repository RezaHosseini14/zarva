import { setRequestLocale } from 'next-intl/server';

import { AiSectionLoader } from '@/features/ai/ai-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <AiSectionLoader />
  );
}
