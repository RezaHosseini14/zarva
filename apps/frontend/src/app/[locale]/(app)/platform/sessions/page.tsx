import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { isPlatformAdminRole } from '@zarva/shared';

import { PlatformSessionsPanel } from '@/features/platform/platform-sessions-panel';
import { AppShell } from '@/features/shell/app-shell';
import { getCurrentUser } from '@/lib/auth/get-current-user';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function PlatformSessionsPage({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('platform.sessions');
  const user = await getCurrentUser();
  if (!user || !isPlatformAdminRole(user.roleName)) {
    redirect(`/${locale}/dashboard`);
  }
  return (
    <AppShell title={t('title')}>
      <PlatformSessionsPanel />
    </AppShell>
  );
}
