import { setRequestLocale } from 'next-intl/server';

import { getDayCloseAction } from '@/features/reports/day-close-actions';
import { DayClosePage } from '@/features/reports/day-close-page';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
  readonly searchParams: Promise<{ date?: string }>;
}

export default async function Page({ params, searchParams }: IPageProps) {
  const { locale } = await params;
  const { date } = await searchParams;
  setRequestLocale(locale);
  const summary = await getDayCloseAction(date);
  return <DayClosePage initial={summary} />;
}
