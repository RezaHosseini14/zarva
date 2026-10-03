'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { IAuthSession } from '@zarva/shared';

import { ZarvaMark } from '@/components/brand/zarva-mark';
import { Button } from '@/components/ui/button';
import {
  loginAction,
  requestOtpAction,
  verifyOtpAction,
} from '@/features/auth/actions';
import { useAuth } from '@/features/auth/auth-provider';
import { useNavigateWithTransition } from '@/features/shell/navigation-progress';
import { getOrCreateClientDeviceId } from '@/lib/auth/client-device-id';

const passwordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const otpSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/),
  code: z.string().length(6),
});

type PasswordValues = z.infer<typeof passwordSchema>;
type OtpValues = z.infer<typeof otpSchema>;
type LoginMode = 'password' | 'otp';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tDevices = useTranslations('auth.devices');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const navigate = useNavigateWithTransition();
  const { setSession } = useAuth();
  const [mode, setMode] = useState<LoginMode>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [limitSessions, setLimitSessions] = useState<ReadonlyArray<IAuthSession> | null>(null);
  const [pendingCreds, setPendingCreds] = useState<{
    kind: 'password' | 'otp';
    email?: string;
    password?: string;
    phone?: string;
    code?: string;
  } | null>(null);

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: 'admin@zarva.dev', password: 'Password123!' },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { phone: '09120000001', code: '000000' },
  });

  const finishLogin = (user: Parameters<typeof setSession>[0]) => {
    setSession(user);
    setLimitSessions(null);
    setPendingCreds(null);
    void navigate(`/${locale}/dashboard`);
  };

  const loginWithCredentials = async (
    email: string,
    password: string,
    revokeSessionId?: string,
  ) => {
    const result = await loginAction({
      email,
      password,
      clientDeviceId: getOrCreateClientDeviceId(),
      revokeSessionId,
    });
    if (!result.ok) {
      if (result.code === 'DEVICE_LIMIT' && 'sessions' in result) {
        setPendingCreds({ kind: 'password', email, password });
        setLimitSessions(result.sessions);
        return;
      }
      if (result.code === 'DEVICE_BANNED') {
        throw new Error(tDevices('banned'));
      }
      throw new Error(result.error);
    }
    finishLogin(result.user);
  };

  const enterAs = async (kind: 'admin' | 'cashier') => {
    const email = kind === 'admin' ? 'admin@zarva.dev' : 'cashier@zarva.dev';
    try {
      await loginWithCredentials(email, 'Password123!');
    } catch (error) {
      passwordForm.setError('email', {
        message: error instanceof Error ? error.message : t('invalidCredentials'),
      });
    }
  };

  const onPasswordSubmit = passwordForm.handleSubmit(async (values) => {
    try {
      await loginWithCredentials(values.email, values.password);
    } catch (error) {
      passwordForm.setError('email', {
        message: error instanceof Error ? error.message : t('invalidCredentials'),
      });
    }
  });

  const requestOtp = async () => {
    const phone = otpForm.getValues('phone');
    if (!/^09\d{9}$/.test(phone)) {
      otpForm.setError('phone', { message: t('invalidPhone') });
      return;
    }
    setOtpBusy(true);
    try {
      const result = await requestOtpAction({ phone, purpose: 'login' });
      if (!result.ok) {
        otpForm.setError('phone', { message: t('otpRequestFailed') });
        return;
      }
      setOtpSent(true);
    } catch {
      otpForm.setError('phone', { message: t('otpRequestFailed') });
    } finally {
      setOtpBusy(false);
    }
  };

  const onOtpSubmit = otpForm.handleSubmit(async (values) => {
    try {
      const result = await verifyOtpAction({
        phone: values.phone,
        code: values.code,
        clientDeviceId: getOrCreateClientDeviceId(),
      });
      if (!result.ok) {
        if (result.code === 'DEVICE_LIMIT' && 'sessions' in result) {
          setPendingCreds({
            kind: 'otp',
            phone: values.phone,
            code: values.code,
          });
          setLimitSessions(result.sessions);
          return;
        }
        if (result.code === 'DEVICE_BANNED') {
          otpForm.setError('code', { message: tDevices('banned') });
          return;
        }
        otpForm.setError('code', { message: t('invalidOtp') });
        return;
      }
      finishLogin(result.user);
    } catch {
      otpForm.setError('code', { message: t('invalidOtp') });
    }
  });

  const pickSessionToReplace = async (sessionId: string) => {
    if (!pendingCreds) return;
    if (pendingCreds.kind === 'password' && pendingCreds.email && pendingCreds.password) {
      await loginWithCredentials(pendingCreds.email, pendingCreds.password, sessionId);
      return;
    }
    if (pendingCreds.kind === 'otp' && pendingCreds.phone && pendingCreds.code) {
      const result = await verifyOtpAction({
        phone: pendingCreds.phone,
        code: pendingCreds.code,
        clientDeviceId: getOrCreateClientDeviceId(),
        revokeSessionId: sessionId,
      });
      if (result.ok) {
        finishLogin(result.user);
      }
    }
  };

  return (
    <div className="zarva-app-canvas flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="zarva-brand-mark" aria-hidden>
            <ZarvaMark />
          </span>
          <span className="font-semibold tracking-wide">{tCommon('appName')}</span>
        </div>
        <div className="zarva-glass-card space-y-4 p-6 sm:p-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t('welcomeBack')}</h1>
            <p className="mt-1 text-sm text-secondary">{t('welcomeSub')}</p>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-nested p-1">
            <Button
              type="button"
              variant={mode === 'password' ? 'primary' : 'ghost'}
              className="min-h-10 w-full rounded-lg"
              onClick={() => setMode('password')}
            >
              {t('tabPassword')}
            </Button>
            <Button
              type="button"
              variant={mode === 'otp' ? 'primary' : 'ghost'}
              className="min-h-10 w-full rounded-lg"
              onClick={() => setMode('otp')}
            >
              {t('tabOtp')}
            </Button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={onPasswordSubmit} className="space-y-4">
              <p className="text-xs text-muted-fg">{t('seedHint')}</p>
              <label className="block text-sm text-secondary">
                {t('email')}
                <input
                  className="zarva-glass-input mt-1.5 w-full min-h-11 px-3 text-foreground"
                  type="email"
                  autoComplete="email"
                  {...passwordForm.register('email')}
                />
                {passwordForm.formState.errors.email ? (
                  <span className="mt-1 block text-xs text-danger">
                    {passwordForm.formState.errors.email.message}
                  </span>
                ) : null}
              </label>
              <label className="block text-sm text-secondary">
                {t('password')}
                <input
                  className="zarva-glass-input mt-1.5 w-full min-h-11 px-3 text-foreground"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register('password')}
                />
              </label>
              <Button
                type="submit"
                variant="primary"
                disabled={passwordForm.formState.isSubmitting}
                className="min-h-11 w-full rounded-xl text-base"
              >
                {t('login')}
              </Button>
            </form>
          ) : (
            <form onSubmit={onOtpSubmit} className="space-y-4">
              <p className="text-xs text-muted-fg">{t('otpHint')}</p>
              <label className="block text-sm text-secondary">
                {t('phone')}
                <input
                  className="zarva-glass-input mt-1.5 w-full min-h-11 px-3 text-foreground"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  {...otpForm.register('phone')}
                />
                {otpForm.formState.errors.phone ? (
                  <span className="mt-1 block text-xs text-danger">
                    {otpForm.formState.errors.phone.message}
                  </span>
                ) : null}
              </label>
              <Button
                type="button"
                variant="outline"
                disabled={otpBusy}
                className="min-h-11 w-full rounded-xl"
                onClick={() => void requestOtp()}
              >
                {otpSent ? t('resendOtp') : t('sendOtp')}
              </Button>
              <label className="block text-sm text-secondary">
                {t('otpCode')}
                <input
                  className="zarva-glass-input mt-1.5 w-full min-h-11 px-3 text-foreground tracking-widest"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  {...otpForm.register('code')}
                />
                {otpForm.formState.errors.code ? (
                  <span className="mt-1 block text-xs text-danger">
                    {otpForm.formState.errors.code.message}
                  </span>
                ) : null}
              </label>
              <Button
                type="submit"
                variant="primary"
                disabled={otpForm.formState.isSubmitting}
                className="min-h-11 w-full rounded-xl text-base"
              >
                {t('loginWithOtp')}
              </Button>
            </form>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-xl text-primary-highlight"
              onClick={() => void enterAs('admin')}
            >
              {t('enterAsAdmin')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-xl"
              onClick={() => void enterAs('cashier')}
            >
              {t('enterAsCashier')}
            </Button>
          </div>
          <p className="text-sm text-secondary">
            {t('noAccount')}{' '}
            <Link className="text-primary hover:underline" href={`/${locale}/signup`}>
              {t('signup')}
            </Link>
          </p>
        </div>
      </div>

      {limitSessions ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 className="text-base font-semibold">{tDevices('limitTitle')}</h3>
            <p className="mt-2 text-sm text-muted-fg">{tDevices('limitBody')}</p>
            <ul className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
              {limitSessions.map((s) => (
                <li key={s.id}>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-full justify-start whitespace-normal py-3 text-start"
                    onClick={() => void pickSessionToReplace(s.id)}
                  >
                    <span>
                      <span className="block font-medium">{s.deviceName}</span>
                      <span className="block text-xs text-muted-fg">
                        {[s.ip, s.os, s.browser].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => {
                setLimitSessions(null);
                setPendingCreds(null);
              }}
            >
              {tCommon('cancel')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
