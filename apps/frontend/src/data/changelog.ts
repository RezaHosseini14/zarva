export const APP_VERSION = '0.1.0';

export type ChangelogSectionKey = 'added' | 'changed' | 'fixed' | 'removed' | 'security';

export const CHANGELOG_SECTION_LABELS: Record<ChangelogSectionKey, string> = {
  added: 'افزوده‌شده',
  changed: 'بهبود و تغییر',
  fixed: 'رفع اشکال',
  removed: 'حذف‌شده',
  security: 'امنیت',
};

export const CHANGELOG_SECTION_ORDER: ChangelogSectionKey[] = [
  'added',
  'changed',
  'fixed',
  'removed',
  'security',
];

export interface IChangelogEntry {
  version: string;
  date: string;
  title: string;
  added?: string[];
  changed?: string[];
  fixed?: string[];
  removed?: string[];
  security?: string[];
}

export const CHANGELOG: IChangelogEntry[] = [
  {
    version: '0.1.0',
    date: '2026-11-07',
    title: 'نسخه اولیه — Gold Business OS',
    added: [
      'راه‌اندازی مونورپوی Nest 12 + Next 16 و پکیج مشترک',
      'نمایش شماره نسخه در سایدبار و مودال تغییرات نسخه',
      'احراز هویت، CASL، صورتحساب SaaS و Docker Compose',
    ],
  },
];
