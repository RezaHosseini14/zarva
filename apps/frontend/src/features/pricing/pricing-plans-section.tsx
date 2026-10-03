import { getTranslations } from 'next-intl/server';

import { ErrorState } from '@/components/page/error-state';
import { PricingPlansClient } from '@/features/pricing/pricing-plans-client';
import { getPublicPlans } from '@/features/pricing/get-public-plans';

export async function PricingPlansSection() {
  const t = await getTranslations('pricing');

  let plans: Awaited<ReturnType<typeof getPublicPlans>> | null = null;
  let loadFailed = false;

  try {
    plans = await getPublicPlans();
  } catch {
    loadFailed = true;
  }

  if (loadFailed || !plans) {
    return (
      <div className="mx-auto mt-12 max-w-md">
        <ErrorState title={t('errorTitle')} description={t('errorDescription')} />
      </div>
    );
  }

  return <PricingPlansClient plans={plans} />;
}
