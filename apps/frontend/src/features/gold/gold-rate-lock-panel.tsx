'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { businessDateKey } from '@zarva/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  correctGoldRateAction,
  lockGoldRateAction,
} from '@/features/gold/gold-actions';
import type { IGoldLockedRate } from '@zarva/shared';

interface IProps {
  readonly todayRate: IGoldLockedRate | null;
}

export function GoldRateLockPanel({ todayRate }: IProps) {
  const t = useTranslations('modules.gold');
  const router = useRouter();
  const [buy, setBuy] = useState(String(todayRate?.buyRateIrt ?? ''));
  const [sell, setSell] = useState(String(todayRate?.sellRateIrt ?? ''));
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const today = businessDateKey();

  function handleLock() {
    setError(null);
    const buyRateIrt = Number(buy);
    const sellRateIrt = Number(sell);
    if (!Number.isFinite(buyRateIrt) || !Number.isFinite(sellRateIrt)) {
      setError(t('rateLockInvalid'));
      return;
    }
    startTransition(async () => {
      const res = await lockGoldRateAction({
        businessDate: today,
        buyRateIrt,
        sellRateIrt,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleCorrect() {
    setError(null);
    const buyRateIrt = Number(buy);
    const sellRateIrt = Number(sell);
    if (!Number.isFinite(buyRateIrt) || !Number.isFinite(sellRateIrt)) {
      setError(t('rateLockInvalid'));
      return;
    }
    if (reason.trim().length < 3) {
      setError(t('rateCorrectReasonRequired'));
      return;
    }
    startTransition(async () => {
      const res = await correctGoldRateAction({
        businessDate: todayRate?.businessDate ?? today,
        buyRateIrt,
        sellRateIrt,
        reason: reason.trim(),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setReason('');
      router.refresh();
    });
  }

  return (
    <div className="mb-4 rounded-xl bg-nested/70 p-4 ring-1 ring-border/50">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t('rateLockTitle')}
          </h3>
          <p className="mt-1 text-xs text-secondary">
            {todayRate
              ? t('rateLockStatusLocked', { date: todayRate.businessDate })
              : t('rateLockStatusOpen')}
          </p>
        </div>
        {todayRate ? (
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            onClick={handleCorrect}
          >
            {pending ? t('rateCorrecting') : t('rateCorrectAction')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            onClick={handleLock}
          >
            {pending ? t('rateLocking') : t('rateLockAction')}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="text-secondary">{t('rateBuy')}</span>
          <Input
            value={buy}
            onChange={(e) => setBuy(e.target.value)}
            className="zarva-num"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-secondary">{t('rateSell')}</span>
          <Input
            value={sell}
            onChange={(e) => setSell(e.target.value)}
            className="zarva-num"
          />
        </label>
      </div>
      {todayRate ? (
        <label className="mt-3 block space-y-1.5 text-sm">
          <span className="text-secondary">{t('rateCorrectReason')}</span>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('rateCorrectReasonPh')}
          />
        </label>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
