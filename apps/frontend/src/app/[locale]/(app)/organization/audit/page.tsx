import { setRequestLocale } from 'next-intl/server';

import { OrganizationSectionLoader } from '@/features/organization/organization-section-loader';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
      <OrganizationSectionLoader section="audit" />
  );
}
