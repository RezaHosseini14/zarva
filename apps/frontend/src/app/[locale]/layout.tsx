import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DEFAULT_THEME_PRESET, isThemePresetId } from '@zarva/shared';

import { routing } from '@/i18n/routing';
import { AppProviders } from '@/components/providers/app-providers';
import { AuthProvider } from '@/features/auth/auth-provider';
import { NotificationsRealtimeProvider } from '@/features/notifications/notifications-realtime-provider';
import { NotificationsCriticalGate } from '@/features/notifications/notifications-critical-gate';
import { SessionSecurityListener } from '@/features/auth/session-security-listener';
import { OrgThemeApplicator } from '@/features/theme/org-theme-applicator';
import { yekanBakh } from '@/lib/fonts';
import '../globals.css';
import '../../styles/icon.css';

export const metadata: Metadata = {
  title: 'ZARVA',
  description: 'Gold Business OS',
  manifest: '/manifest.webmanifest',
  themeColor: '#C9A227',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

interface ILocaleLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: ILocaleLayoutProps) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'fa' | 'en' | 'ar')) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'en' ? 'ltr' : 'rtl';
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get('zarva_theme')?.value;
  const theme =
    cookieTheme && isThemePresetId(cookieTheme) ? cookieTheme : DEFAULT_THEME_PRESET;

  return (
    <html lang={locale} dir={dir} data-theme={theme} className={yekanBakh.variable} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>
            <AuthProvider>
              <OrgThemeApplicator />
              <NotificationsRealtimeProvider>
                <NotificationsCriticalGate />
                <SessionSecurityListener />
                {children}
              </NotificationsRealtimeProvider>
            </AuthProvider>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
