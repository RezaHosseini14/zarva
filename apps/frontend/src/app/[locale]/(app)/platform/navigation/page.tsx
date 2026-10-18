import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { ErrorState } from '@/components/page/error-state';
import { PageHeader } from '@/components/page/page-header';
import { AppShell } from '@/features/shell/app-shell';
import { getAdminNavigation } from '@/features/platform/platform-navigation-actions';
import { PlatformNavigationPanel } from '@/features/platform/platform-navigation-panel';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { NestAuthError } from '@/lib/auth/nest-auth';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import { ProgressiveSection } from '@/lib/lists/progressive-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

async function PlatformNavigationSection({ locale }: { readonly locale: string }) {
  const t = await getTranslations('platformNavigation');

  let data: Awaited<ReturnType<typeof getAdminNavigation>> | null = null;
  let loadFailed = false;

  try {
    data = await getAdminNavigation();
  } catch (error) {
    if (error instanceof NestAuthError && error.status === 403) {
      redirect(`/${locale}/dashboard`);
    }
    loadFailed = true;
  }

  if (loadFailed || !data) {
    return <ErrorState title={t('errorTitle')} description={t('errorDescription')} />;
  }

  return <PlatformNavigationPanel data={data} />;
}

export default async function PlatformNavigationPage({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('platformNavigation');

  const user = await getCurrentUser();
  if (!user || user.roleName !== 'SUPER_ADMIN') {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <AppShell title={t('title')}>
      <ProgressiveSection
        fallback={
          <>
            <PageHeader title={t('title')} description={t('description')} />
            <DomainListBodySkeleton
              skeletonKpis={[
                {
                  label: t('kpiItems'),
                  icon: 'settings-bold',
                  accent: ACCENT.primary,
                },
                {
                  label: t('kpiActive'),
                  icon: 'check-read-bold',
                  accent: ACCENT.success,
                },
                {
                  label: t('kpiInactive'),
                  icon: 'notes-bold',
                  accent: ACCENT.info,
                },
              ]}
              searchPlaceholder={t('search')}
              columnHeaders={[
                t('colLabel'),
                t('colHref'),
                t('colGroup'),
                t('colSubject'),
                t('colStatus'),
                t('colActions'),
              ]}
            />
          </>
        }
      >
        <PlatformNavigationSection locale={locale} />
      </ProgressiveSection>
    </AppShell>
  );
}
