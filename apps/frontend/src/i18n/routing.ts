import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fa', 'en', 'ar'],
  defaultLocale: 'fa',
  localePrefix: 'always',
});
