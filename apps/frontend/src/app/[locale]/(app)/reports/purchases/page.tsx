import { renderReportKindPage } from '@/lib/reports/report-kind-page';

interface IProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IProps) {
  const { locale } = await params;
  return renderReportKindPage({ locale, cardKey: 'purchases' });
}
