import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountDevicesPage } from '@/features/account-devices/account-devices-page';
import { AppShell } from '@/features/shell/app-shell';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function AccountDevicesRoute({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth.devices');
  return (
    <AppShell title={t('title')}>
      <AccountDevicesPage />
    </AppShell>
  );
}
