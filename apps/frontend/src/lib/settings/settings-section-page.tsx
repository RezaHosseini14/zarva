import { setRequestLocale } from 'next-intl/server';

import { SettingsSectionLoader } from '@/features/settings/settings-section-loader';

interface IProps {
  readonly locale: string;
  readonly section: string;
}

export async function renderSettingsSectionPage({ locale, section }: IProps) {
  setRequestLocale(locale);
  return <SettingsSectionLoader section={section} />;
}
