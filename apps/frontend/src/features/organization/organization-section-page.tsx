'use client';

import { useTranslations } from 'next-intl';
import type { IAuditRow, IOrgProfile, IOrgUserRow } from '@zarva/shared';

import { DomainListPage } from '@/components/page/domain-list-page';
import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { OrganizationProfileForm } from '@/features/organization/organization-profile-form';
import { SectionLoadError } from '@/components/page/section-load-error';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly section: 'profile' | 'users' | 'audit';
  readonly profile?: IOrgProfile;
  readonly users?: ReadonlyArray<IOrgUserRow>;
  readonly audit?: ReadonlyArray<IAuditRow>;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function OrganizationSectionPage({
  section,
  profile,
  users = [],
  audit = [],
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.organization');
  const isBody = chrome === 'body';

  if (section === 'profile') {
    const body = (
      <>
        {isBody ? null : (
          <PageHeader title={t('nav.profile')} description={t('hub.profile')} />
        )}
        {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
        {profile ? <OrganizationProfileForm profile={profile} isError={isError} /> : null}
      </>
    );
    if (isBody) return body;
    return <AppShell title={t('nav.profile')}>{body}</AppShell>;
  }

  const rows = section === 'users' ? users : audit;

  return (
    <DomainListPage<(typeof rows)[number]>
      shellTitle={t(`nav.${section}`)}
      title={t(`nav.${section}`)}
      description={t(`hub.${section}`)}
      chrome={chrome}
      isError={isError}
      errorKind={errorKind}
      kpis={[
        {
          id: 'n',
          label: t('kpi.rows'),
          value: String(rows.length),
          icon: 'buildings-2-bold',
          accent: 'bg-primary/15 text-primary ring-primary/25',
        },
      ]}
      searchPlaceholder={t('search')}
      columns={[
        { id: 'a', header: t('cols.a'), cell: (r) => r.a },
        { id: 'b', header: t('cols.b'), cell: (r) => r.b },
        { id: 'c', header: t('cols.c'), cell: (r) => r.c },
      ]}
      rows={rows}
      rowKey={(r) => r.id}
      emptyTitle={t('emptyTitle')}
      emptyDescription={t('emptyDescription')}
      emptyIcon="buildings-2-bold"
      emptyAccent="bg-primary/15 text-primary ring-primary/25"
    />
  );
}
