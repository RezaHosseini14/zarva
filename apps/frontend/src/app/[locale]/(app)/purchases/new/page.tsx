import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PurchasesFormPage } from '@/features/purchases/purchases-form-page';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IPageProps {
  readonly params: Promise<{ locale: string }>;
}

export default async function Page({ params }: IPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('modules.purchases');
  const tSettings = await getTranslations('modules.settings');

  return (
    <StreamedDomainChrome
      messageNs="modules.purchases"
      titlePath="newPurchase"
      descriptionPath="formDescription"
      pathForNav="/purchases/new"
      skeletonVariant="form"
      skeletonFormTitle={t('newPurchase')}
      skeletonFormIcon="delivery-bold"
      skeletonFormFields={[
        { label: t('cols.supplier') },
        { label: t('cols.number') },
        { label: t('cols.date') },
        { label: t('cols.weight') },
        { label: t('cols.purity') },
        { label: t('cols.amount') },
        { label: tSettings('fields.note') },
      ]}
      skeletonFallback={null}
    >
      <PurchasesFormPage chrome="body" />
    </StreamedDomainChrome>
  );
}
