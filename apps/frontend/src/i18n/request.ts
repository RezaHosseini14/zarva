import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as 'fa' | 'en' | 'ar')) {
    locale = routing.defaultLocale;
  }

  // Explicit per-locale imports so Turbopack invalidates message modules reliably.
  const messages =
    locale === 'fa'
      ? (await import('../../messages/fa.json')).default
      : locale === 'ar'
        ? (await import('../../messages/ar.json')).default
        : (await import('../../messages/en.json')).default;

  return {
    locale,
    messages,
  };
});
