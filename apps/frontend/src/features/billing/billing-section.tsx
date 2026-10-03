import { getTranslations } from 'next-intl/server';

import { ErrorState } from '@/components/page/error-state';
import { BillingPanel } from '@/features/billing/billing-panel';
import type { ISubscriptionView } from '@/features/billing/get-billing-subscription';
import { getBillingPlans } from '@/features/billing/get-billing-subscription';
import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

async function BillingSectionLoaded() {
  const t = await getTranslations('billing');
  const plans = await getBillingPlans();

  let subscription: ISubscriptionView | null = null;
  let missing = false;
  let loadFailed = false;

  try {
    subscription = await serverApiFetch<ISubscriptionView | null>('/billing/subscription');
  } catch (error) {
    if (error instanceof NestAuthError && (error.status === 404 || error.status === 204)) {
      missing = true;
    } else {
      loadFailed = true;
    }
  }

  if (loadFailed) {
    return <ErrorState title={t('errorTitle')} description={t('errorDescription')} />;
  }

  return (
    <BillingPanel subscription={missing ? null : subscription} plans={plans} chrome="body" />
  );
}

export async function BillingSection() {
  const t = await getTranslations('billing');
  return (
    <StreamedDomainChrome
      messageNs="billing"
      pathForNav="/settings/billing"
      skeletonVariant="form"
      skeletonFormTitle={t('title')}
      skeletonFormIcon="card-bold"
      skeletonFormFields={[
        { label: t('currentPlan') },
        { label: t('status') },
      ]}
    >
      <BillingSectionLoaded />
    </StreamedDomainChrome>
  );
}
