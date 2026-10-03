import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { isPlatformAdminRole } from '@zarva/shared';

import { ErrorState } from '@/components/page/error-state';
import { PageHeader } from '@/components/page/page-header';
import { AppShell } from '@/features/shell/app-shell';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import {
  listPlansForPlatform,
  listPlatformOrganizations,
} from '@/features/platform/platform-actions';
import { PlatformOrgsPanel } from '@/features/platform/platform-orgs-panel';
import { NestAuthError } from '@/lib/auth/nest-auth';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import { ProgressiveSection } from '@/lib/lists/progressive-section';
import { ACCENT } from '@/lib/lists/skeleton-kpi';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

async function PlatformOrgsSection({ locale }: { readonly locale: string }) {
  const t = await getTranslations('platform');

  let organizations: Awaited<ReturnType<typeof listPlatformOrganizations>> | null =
    null;
  let plans: Awaited<ReturnType<typeof listPlansForPlatform>> | null = null;
  let loadFailed = false;

  try {
    [organizations, plans] = await Promise.all([
      listPlatformOrganizations(),
      listPlansForPlatform(),
    ]);
  } catch (error) {
    if (error instanceof NestAuthError && error.status === 403) {
      redirect(`/${locale}/dashboard`);
    }
    loadFailed = true;
  }

  if (loadFailed || !organizations || !plans) {
    return <ErrorState title={t('errorTitle')} description={t('errorDescription')} />;
  }

  return <PlatformOrgsPanel organizations={organizations} plans={plans} />;
}

export default async function PlatformOrganizationsPage({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('platform');

  const user = await getCurrentUser();
  if (!user || !isPlatformAdminRole(user.roleName)) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <AppShell title={t('title')}>
      <PageHeader title={t('title')} description={t('description')} />
      <ProgressiveSection
        fallback={
          <DomainListBodySkeleton
            skeletonKpis={[
              {
                label: t('kpiOrgs'),
                icon: 'buildings-2-bold',
                accent: ACCENT.primary,
              },
              {
                label: t('kpiActive'),
                icon: 'graph-up-bold',
                accent: ACCENT.success,
              },
              {
                label: t('kpiExpiring'),
                icon: 'danger-triangle-bold',
                accent: ACCENT.warning,
              },
            ]}
            searchPlaceholder={t('search')}
            columnHeaders={[t('orgs'), t('plan'), t('status'), t('expires'), t('theme')]}
          />
        }
      >
        <PlatformOrgsSection locale={locale} />
      </ProgressiveSection>
    </AppShell>
  );
}
