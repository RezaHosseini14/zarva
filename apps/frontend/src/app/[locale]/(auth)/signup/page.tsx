'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZarvaMark } from '@/components/brand/zarva-mark';
import { Button } from '@/components/ui/button';
import { signupAction } from '@/features/auth/actions';
import { useAuth } from '@/features/auth/auth-provider';
import { useNavigateWithTransition } from '@/features/shell/navigation-progress';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  organizationName: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const navigate = useNavigateWithTransition();
  const { setSession } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await signupAction({
      ...values,
      locale,
      phone: '',
      address: '',
      otpCode: '',
    });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSession(result.user);
    void navigate(`/${locale}/dashboard`);
  });

  return (
    <div className="zarva-app-canvas flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="zarva-brand-mark" aria-hidden>
            <ZarvaMark />
          </span>
          <span className="font-semibold tracking-wide">{tCommon('appName')}</span>
        </div>
        <form onSubmit={onSubmit} className="zarva-glass-card space-y-4 p-6 sm:p-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t('createOrg')}</h1>
            <p className="mt-1 text-sm text-secondary">{t('createOrgSub')}</p>
          </div>
          {(['name', 'organizationName', 'email', 'password'] as const).map((field) => (
            <label key={field} className="block text-sm text-secondary">
              {t(field)}
              <input
                className="zarva-glass-input mt-1.5 w-full min-h-11 px-3 text-foreground"
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                {...register(field)}
              />
            </label>
          ))}
          {formError ? (
            <p className="text-xs text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="min-h-11 w-full rounded-xl text-base"
          >
            {t('signup')}
          </Button>
          <p className="text-sm text-secondary">
            {t('hasAccount')}{' '}
            <Link className="text-primary hover:underline" href={`/${locale}/login`}>
              {t('login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
