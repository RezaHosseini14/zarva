import { type ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

import { AuthHydrator } from '@/features/auth/auth-hydrator';
import { AppShellFrame } from '@/features/shell/app-shell';
import { requireUser } from '@/lib/auth/get-current-user';

interface IAppLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
}

async function AppAuthenticated({
  locale,
  children,
}: {
  readonly locale: string;
  readonly children: ReactNode;
}) {
  const user = await requireUser(locale);
  return (
    <>
      <AuthHydrator user={user} />
      {children}
    </>
  );
}

export default async function AppLayout({ children, params }: IAppLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AppShellFrame>
      <AppAuthenticated locale={locale}>{children}</AppAuthenticated>
    </AppShellFrame>
  );
}
