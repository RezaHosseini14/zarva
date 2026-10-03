import { getTranslations, setRequestLocale } from 'next-intl/server';

import { RolesSection } from '@/features/roles/roles-section';
import { RolesBodySkeleton } from '@/features/roles/roles-body-skeleton';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IRolesPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function RolesPage({ params }: IRolesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('roles');

  return (
    <StreamedDomainChrome
      messageNs="roles"
      pathForNav="/roles"
      skeletonFallback={<RolesBodySkeleton title={t('title')} />}
    >
      <RolesSection />
    </StreamedDomainChrome>
  );
}
