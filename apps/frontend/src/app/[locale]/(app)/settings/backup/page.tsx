import { renderSettingsSectionPage } from '@/lib/settings/settings-section-page';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  return renderSettingsSectionPage({ locale, section: 'backup' });
}
