'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { ISearchResult } from '@zarva/shared';

import { AppShell } from '@/features/shell/app-shell';
import { PageHeader } from '@/components/page/page-header';
import { EmptyState } from '@/components/page/empty-state';
import { SectionLoadError } from '@/components/page/section-load-error';
import type { SectionErrorKind } from '@/lib/auth/section-load-error';

interface IProps {
  readonly query: string;
  readonly result: ISearchResult | null;
  readonly isError?: boolean;
  readonly errorKind?: SectionErrorKind;
  readonly chrome?: 'full' | 'body';
}

export function SearchPageView({
  query,
  result,
  isError,
  errorKind,
  chrome = 'full',
}: IProps) {
  const t = useTranslations('modules.search');
  const locale = useLocale();
  const hasHits = Boolean(result?.groups.some((g) => g.hits.length > 0));
  const isBody = chrome === 'body';

  const body = (
    <>
      {isBody ? null : <PageHeader title={t('title')} description={t('description')} />}
      {isError ? <SectionLoadError kind={errorKind} className="mb-4" /> : null}
      {query && result && hasHits ? (
        <div className="space-y-6">
          {result.groups.map((group) =>
            group.hits.length ? (
              <section key={group.type}>
                <h2 className="mb-2 text-sm font-medium text-muted-fg">{group.type}</h2>
                <ul className="zarva-glass-card divide-y divide-border">
                  {group.hits.map((hit) => (
                    <li key={hit.id}>
                      <Link
                        href={`/${locale}${hit.href}`}
                        className="flex flex-col gap-0.5 px-4 py-3 hover:bg-nested/50"
                      >
                        <span className="font-medium text-primary">{hit.title}</span>
                        <span className="text-sm text-secondary">{hit.subtitle}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      ) : (
        <EmptyState
          bordered
          icon="magnifer-bold"
          accent="bg-info/15 text-info ring-info/25"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      )}
    </>
  );

  if (isBody) return body;
  return <AppShell title={t('title')}>{body}</AppShell>;
}
