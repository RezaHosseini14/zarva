import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/get-current-user';

interface IAuthLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}

/** Guest-only: logged-in users skip login/signup. */
export default async function AuthLayout({ children, params }: IAuthLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (user) {
    redirect(`/${locale}/dashboard`);
  }
  return children;
}
