'use client';

import { useTranslations } from 'next-intl';

import { SubNav } from '@/components/page/sub-nav';

const ITEMS = [{"href":"/gold","key":"overview"},{"href":"/gold/rates","key":"rates"},{"href":"/gold/transactions","key":"transactions"},{"href":"/gold/ledger","key":"ledger"},{"href":"/gold/balance","key":"balance"},{"href":"/gold/raw","key":"raw"},{"href":"/gold/melted","key":"melted"},{"href":"/gold/lots","key":"lots"},{"href":"/gold/purities","key":"purities"},{"href":"/gold/calculator","key":"calculator"}];

export function GoldNav() {
  const t = useTranslations('modules.gold');
  return <SubNav items={ITEMS.map((n) => ({ href: n.href, label: t(`nav.${n.key}`) }))} />;
}
