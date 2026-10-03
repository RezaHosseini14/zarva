import { getTranslations } from 'next-intl/server';

import { getSettingsSection } from '@/features/settings/get-settings-data';
import { SettingsSectionPage } from '@/features/settings/settings-section-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IProps {
  readonly section: string;
}

async function SettingsSectionLoaded({ section }: IProps) {
  const result = await loadServerApiSection(() => getSettingsSection(section));
  if (!result.ok) {
    return (
      <SettingsSectionPage
        section={section}
        values={{}}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return (
    <SettingsSectionPage section={section} values={result.data.values} chrome="body" />
  );
}

export async function SettingsSectionLoader({ section }: IProps) {
  const t = await getTranslations('modules.settings');
  return (
    <StreamedDomainChrome
      messageNs="modules.settings"
      titlePath={`sections.${section}.title`}
      descriptionPath={`sections.${section}.description`}
      pathForNav="/settings"
      skeletonVariant="form"
      skeletonFormTitle={t(`sections.${section}.title`)}
      skeletonFormIcon="settings-bold"
      skeletonFormFields={[
        { label: t('fields.value') },
        { label: t('fields.value') },
      ]}
    >
      <SettingsSectionLoaded section={section} />
    </StreamedDomainChrome>
  );
}
