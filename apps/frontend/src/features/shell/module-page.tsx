'use client';

import { useTranslations } from 'next-intl';

import { AppShell } from '@/features/shell/app-shell';
import { ModuleShell } from '@/features/shell/module-shell';

interface IModulePageProps {
  readonly navKey: string;
}

export function ModulePage({ navKey }: IModulePageProps) {
  const t = useTranslations('nav');
  const tShell = useTranslations('shell');

  return (
    <AppShell title={t(navKey)}>
      <ModuleShell
        title={t(navKey)}
        description={`${tShell('comingSoon')} — ${tShell('sampleTable')}`}
      />
    </AppShell>
  );
}
