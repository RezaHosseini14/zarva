'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Icon } from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  APP_VERSION,
  CHANGELOG,
  CHANGELOG_SECTION_LABELS,
  CHANGELOG_SECTION_ORDER,
  type ChangelogSectionKey,
} from '@/data/changelog';
import { cn } from '@/lib/utils';

import { VersionSemverLabel } from './version-semver-label';

export interface IChangelogModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function formatChangelogDate(date: string, locale: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}

const SECTION_CHIP: Record<ChangelogSectionKey, string> = {
  added: 'bg-primary/15 text-primary ring-1 ring-primary/25',
  changed: 'bg-muted/50 text-foreground ring-1 ring-border/50',
  fixed: 'border border-border/60 bg-nested/80 text-secondary',
  removed: 'bg-muted/30 text-muted-fg ring-1 ring-border/40',
  security: 'bg-danger/15 text-danger ring-1 ring-danger/25',
};

function ChangelogItemList({ items }: { readonly items: string[] }) {
  return (
    <ul className="space-y-2.5" role="list">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-secondary">
          <span
            className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-primary/80"
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-pretty text-foreground/90">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ChangelogSectionLabel({ sectionKey }: { readonly sectionKey: ChangelogSectionKey }) {
  return (
    <span
      className={cn(
        'mb-2.5 inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold',
        SECTION_CHIP[sectionKey],
      )}
    >
      {CHANGELOG_SECTION_LABELS[sectionKey]}
    </span>
  );
}

export function ChangelogModal({ open, onOpenChange }: IChangelogModalProps) {
  const t = useTranslations('shell.changelog');
  const locale = useLocale();
  const dateLocale = locale === 'fa' ? 'fa-IR' : locale === 'ar' ? 'ar' : 'en-US';
  const contentDir = locale === 'en' ? 'ltr' : 'rtl';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(36rem,88dvh)] max-w-[calc(100%-2rem)] flex-col gap-0 p-0 sm:max-w-xl"
        dir={contentDir}
      >
        <DialogHeader className="border-b border-border/70 bg-gradient-to-b from-primary/[0.09] to-transparent px-5 pb-4 pt-5">
          <div className="flex items-start gap-3 pe-8">
            <span
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25"
              aria-hidden
            >
              <Icon name="document-text-bold" className="text-lg" />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <DialogTitle className="text-base tracking-tight">{t('title')}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2 text-sm">
                <span>{t('currentVersionLabel')}</span>
                <span className="inline-flex h-7 items-center rounded-full border border-primary/25 bg-nested/60 px-2.5 ring-1 ring-primary/15">
                  <VersionSemverLabel version={APP_VERSION} size="sm" />
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="zarva-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {CHANGELOG.map((entry) => (
            <section
              key={entry.version}
              className="overflow-hidden rounded-2xl border border-border/70 bg-nested/40 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 ring-1 ring-primary/15">
                    <VersionSemverLabel version={entry.version} size="sm" />
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
                </div>
                <time
                  dateTime={entry.date}
                  className="shrink-0 rounded-full border border-border/60 bg-background/40 px-2.5 py-0.5 text-xs text-secondary"
                >
                  {formatChangelogDate(entry.date, dateLocale)}
                </time>
              </div>
              <div className="space-y-4 p-4">
                {CHANGELOG_SECTION_ORDER.map((sectionKey) => {
                  const items = entry[sectionKey];
                  if (!items?.length) {
                    return null;
                  }

                  return (
                    <div
                      key={sectionKey}
                      className={cn(
                        'rounded-xl border border-border/50 bg-muted/15 p-3',
                        sectionKey === 'added' && 'border-primary/20 bg-primary/[0.05]',
                      )}
                    >
                      <ChangelogSectionLabel sectionKey={sectionKey} />
                      <ChangelogItemList items={items} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
