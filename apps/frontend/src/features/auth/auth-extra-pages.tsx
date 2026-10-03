'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  acceptInviteAction,
  enableTwoFaAction,
  forgotPasswordAction,
  resetPasswordAction,
  setupTwoFaAction,
} from '@/features/auth/auth-extra-actions';

interface IProps {
  readonly kind: 'forgot' | 'reset' | 'twofa' | 'invite';
}

export function AuthExtraPage({ kind }: IProps) {
  const t = useTranslations(`authExtras.${kind}`);
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [setupHint, setSetupHint] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== 'twofa') {
      return;
    }
    let cancelled = false;
    void (async () => {
      const result = await setupTwoFaAction();
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.setup.otpauthUrl) {
        setSetupHint(result.setup.otpauthUrl);
      } else if (result.setup.secret) {
        setSetupHint(result.setup.secret);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);

    try {
      if (kind === 'forgot') {
        const email = String(form.get('email') ?? '');
        const result = await forgotPasswordAction({ email });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDone(true);
        return;
      }

      if (kind === 'reset') {
        const password = String(form.get('password') ?? '');
        const result = await resetPasswordAction({ password, token });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDone(true);
        return;
      }

      if (kind === 'twofa') {
        const code = String(form.get('code') ?? '');
        const result = await enableTwoFaAction({ code });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDone(true);
        return;
      }

      const name = String(form.get('name') ?? '');
      const password = String(form.get('password') ?? '');
      const result = await acceptInviteAction({ token, name, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-primary">ZARVA</p>
          <h1 className="mt-2 text-xl font-semibold">{t('title')}</h1>
          <p className="mt-1 text-sm text-secondary">{t('description')}</p>
        </div>
        {done ? (
          <p className="zarva-glass-card p-4 text-center text-sm text-secondary">{t('description')}</p>
        ) : (
          <form className="zarva-glass-card flex flex-col gap-4 p-4 sm:p-6" onSubmit={(e) => void onSubmit(e)}>
            {kind === 'twofa' ? (
              <>
                {setupHint ? (
                  <p className="break-all text-xs text-muted-fg">{setupHint}</p>
                ) : null}
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-secondary">{t('code')}</span>
                  <Input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
                </label>
              </>
            ) : null}
            {kind === 'invite' ? (
              <>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-secondary">{t('name')}</span>
                  <Input name="name" autoComplete="name" required />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-secondary">{t('password')}</span>
                  <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
                </label>
              </>
            ) : null}
            {kind === 'forgot' ? (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-secondary">{t('email')}</span>
                <Input name="email" type="email" autoComplete="email" required />
              </label>
            ) : null}
            {kind === 'reset' ? (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-secondary">{t('password')}</span>
                <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
              </label>
            ) : null}
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="ghost" asChild>
                <Link href={`/${locale}/login`}>{tCommon('cancel')}</Link>
              </Button>
              <Button type="submit" disabled={busy}>
                {t('submit')}
              </Button>
            </div>
          </form>
        )}
        <p className="text-center text-sm text-secondary">
          <Link href={`/${locale}/login`} className="text-primary hover:underline">
            {t('back')}
          </Link>
        </p>
      </div>
    </div>
  );
}
