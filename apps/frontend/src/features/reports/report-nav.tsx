'use client';

import { useTranslations } from 'next-intl';

import { SubNav } from '@/components/page/sub-nav';
import { REPORT_KINDS } from '@/features/reports/report-kinds';

export function ReportNav() {
  const t = useTranslations('modules.reports');

  return (
    <SubNav
      className="mb-5"
      items={[
        { href: '/reports', label: t('nav.hub'), icon: 'chart-linear' },
        ...REPORT_KINDS.map((k) => ({
          href: k.href,
          label: t(`cards.${k.key}`),
          icon: k.iconLinear,
        })),
      ]}
    />
  );
}
