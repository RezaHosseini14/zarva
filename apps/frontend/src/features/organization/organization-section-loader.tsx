import { getTranslations } from 'next-intl/server';

import {
  getOrganizationAudit,
  getOrganizationProfile,
  getOrganizationUsers,
} from '@/features/organization/get-organization-data';
import { OrganizationSectionPage } from '@/features/organization/organization-section-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IProps {
  readonly section: 'profile' | 'users' | 'audit';
}

async function OrganizationSectionLoaded({ section }: IProps) {
  if (section === 'profile') {
    const result = await loadServerApiSection(() => getOrganizationProfile());
    if (!result.ok) {
      return (
        <OrganizationSectionPage
          section="profile"
          chrome="body"
          isError
          errorKind={result.error.kind}
        />
      );
    }
    return <OrganizationSectionPage section="profile" chrome="body" profile={result.data} />;
  }
  if (section === 'users') {
    const result = await loadServerApiSection(() => getOrganizationUsers());
    if (!result.ok) {
      return (
        <OrganizationSectionPage
          section="users"
          chrome="body"
          isError
          errorKind={result.error.kind}
        />
      );
    }
    return <OrganizationSectionPage section="users" chrome="body" users={result.data} />;
  }
  const result = await loadServerApiSection(() => getOrganizationAudit());
  if (!result.ok) {
    return (
      <OrganizationSectionPage
        section="audit"
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return <OrganizationSectionPage section="audit" chrome="body" audit={result.data} />;
}

export async function OrganizationSectionLoader({ section }: IProps) {
  const t = await getTranslations('modules.organization');
  const isForm = section === 'profile';
  return (
    <StreamedDomainChrome
      messageNs="modules.organization"
      titlePath={`nav.${section}`}
      descriptionPath={`hub.${section}`}
      pathForNav="/organization"
      skeletonVariant={isForm ? 'form' : 'list'}
      skeletonFormTitle={isForm ? t(`nav.${section}`) : undefined}
      skeletonFormIcon="buildings-2-bold"
      skeletonFormFields={
        isForm
          ? [
              { label: t('fields.name') },
              { label: t('fields.taxId') },
              { label: t('fields.phone') },
            ]
          : undefined
      }
      skeletonKpis={
        isForm
          ? undefined
          : [
              {
                label: t('kpi.rows'),
                icon: 'buildings-2-bold',
                accent: 'bg-primary/15 text-primary ring-primary/25',
              },
            ]
      }
      skeletonSearchPlaceholder={isForm ? undefined : t('search')}
      skeletonColumnHeaders={isForm ? undefined : [t('cols.a'), t('cols.b'), t('cols.c')]}
    >
      <OrganizationSectionLoaded section={section} />
    </StreamedDomainChrome>
  );
}
