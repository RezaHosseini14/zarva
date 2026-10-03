import { getTranslations, setRequestLocale } from 'next-intl/server';

import { GoldCalculatorPage } from '@/features/gold/gold-calculator-page';
import { GOLD_CALC_FIELD_KEYS } from '@/features/gold/gold-kpi-slots';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.gold');

  return (
    <StreamedDomainChrome
      messageNs="modules.gold"
      titlePath="nav.calculator"
      descriptionPath="calculatorDescription"
      pathForNav="/gold"
      skeletonVariant="form"
      skeletonFormTitle={t('nav.calculator')}
      skeletonFormIcon="calculator-bold"
      skeletonFormFields={GOLD_CALC_FIELD_KEYS.map((key) => ({ label: t(key) }))}
    >
      <GoldCalculatorPage chrome="body" />
    </StreamedDomainChrome>
  );
}
