'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { EmptyState } from '@/components/page/empty-state';
import { ErrorState } from '@/components/page/error-state';
import { useNotificationReceipts } from './use-notifications';

interface IProps {
  readonly notificationId: string | null;
  readonly onClose: () => void;
}

function formatTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NotificationsReceiptsDialog({ notificationId, onClose }: IProps) {
  const t = useTranslations('modules.notifications');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useNotificationReceipts(notificationId);

  if (!notificationId) return null;

  const read = (data?.recipients ?? []).filter((r) => r.readAt !== null);
  const unread = (data?.recipients ?? []).filter((r) => r.readAt === null);
  const readCount = data?.readCount ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('receipts.close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="zarva-glass-card relative z-10 flex max-h-[min(90vh,36rem)] w-full max-w-lg flex-col overflow-hidden"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{t('receipts.title')}</h2>
            {data ? (
              <p className="mt-0.5 truncate text-xs text-secondary">{data.title}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-(--radius-control) text-secondary hover:text-foreground"
            onClick={onClose}
            aria-label={t('receipts.close')}
          >
            <Icon name="close-circle-bold" className="text-lg" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto zarva-scrollbar px-4 py-3">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-secondary">{t('receipts.loading')}</p>
          ) : null}
          {isError ? (
            <ErrorState
              compact
              title={t('receipts.error')}
              description={tCommon('sectionErrorDescription')}
              retryLabel={tCommon('retry')}
              onRetry={() => void refetch()}
            />
          ) : null}
          {!isLoading && !isError && data ? (
            <>
              <p className="mb-3 text-sm font-medium text-foreground">
                {t('receipts.counter', { read: readCount, total })}
              </p>
              <section className="mb-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
                  {t('receipts.read')}
                </h3>
                {read.length === 0 ? (
                  <EmptyState
                    icon="document-text-bold"
                    accent="bg-info/15 text-info ring-info/25"
                    title={t('receipts.noneRead')}
                    description=""
                    className="py-6"
                  />
                ) : (
                  <ul className="space-y-2">
                    {read.map((r) => (
                      <li key={r.userId} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate font-medium">{r.name}</span>
                        <span className="shrink-0 text-xs text-secondary">
                          {r.readAt ? formatTime(r.readAt, locale) : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
                  {t('receipts.unread')}
                </h3>
                {unread.length === 0 ? (
                  <EmptyState
                    icon="bell-bold"
                    accent="bg-warning/15 text-warning ring-warning/25"
                    title={t('receipts.noneUnread')}
                    description=""
                    className="py-6"
                  />
                ) : (
                  <ul className="space-y-2">
                    {unread.map((r) => (
                      <li key={r.userId} className="truncate text-sm text-secondary">
                        {r.name}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}
        </div>

        <footer className="flex shrink-0 justify-end border-t border-border/60 px-4 py-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('receipts.close')}
          </Button>
        </footer>
      </div>
    </div>
  );
}
