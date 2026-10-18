import { getTranslations } from 'next-intl/server';

import { getTodayGoldRateAction } from '@/features/gold/gold-actions';
import { GoldSectionPage } from '@/features/gold/gold-section-page';
import {
  getGoldBalances,
  getGoldLotSectionRows,
  getGoldMeltedSectionRows,
  getGoldPuritySectionRows,
  getGoldRateSectionRows,
  getGoldRawSectionRows,
  getGoldSummary,
  getGoldTransactionSectionRows,
} from '@/features/gold/get-gold-data';
import {
  GOLD_SECTION_COLUMN_KEYS,
  GOLD_SECTION_KPI_SLOTS,
  resolveGoldColumnHeaders,
  resolveGoldSkeletonKpis,
} from '@/features/gold/gold-kpi-slots';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

export type GoldSectionKind =
  | 'transactions'
  | 'balance'
  | 'rates'
  | 'purities'
  | 'lots'
  | 'melted'
  | 'raw';

interface IProps {
  readonly kind: GoldSectionKind;
  readonly navKey: string;
  readonly descriptionKey: string;
}

async function loadRows(kind: GoldSectionKind) {
  switch (kind) {
    case 'transactions':
      return getGoldTransactionSectionRows();
    case 'balance':
      return getGoldBalances();
    case 'rates':
      return getGoldRateSectionRows();
    case 'purities':
      return getGoldPuritySectionRows();
    case 'lots':
      return getGoldLotSectionRows();
    case 'melted':
      return getGoldMeltedSectionRows();
    case 'raw':
      return getGoldRawSectionRows();
    default:
      return [];
  }
}

async function GoldSectionLoaded({ kind, navKey, descriptionKey }: IProps) {
  const [result, todayRate] = await Promise.all([
    loadServerApiSection(async () => {
      const [rows, summary] = await Promise.all([loadRows(kind), getGoldSummary()]);
      return { rows, summary };
    }),
    kind === 'rates' ? getTodayGoldRateAction() : Promise.resolve(null),
  ]);
  if (!result.ok) {
    return (
      <GoldSectionPage
        navKey={navKey}
        descriptionKey={descriptionKey}
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
        todayRate={todayRate}
      />
    );
  }
  return (
    <GoldSectionPage
      navKey={navKey}
      descriptionKey={descriptionKey}
      rows={result.data.rows}
      summary={result.data.summary}
      chrome="body"
      todayRate={todayRate}
    />
  );
}

export async function GoldSectionLoader(props: IProps) {
  const t = await getTranslations('modules.gold');

  return (
    <StreamedDomainChrome
      messageNs="modules.gold"
      titlePath={`nav.${props.navKey}`}
      descriptionPath={props.descriptionKey}
      pathForNav="/gold"
      skeletonKpis={resolveGoldSkeletonKpis(t, GOLD_SECTION_KPI_SLOTS)}
      skeletonSearchPlaceholder={t('search')}
      skeletonColumnHeaders={resolveGoldColumnHeaders(t, GOLD_SECTION_COLUMN_KEYS)}
    >
      <GoldSectionLoaded {...props} />
    </StreamedDomainChrome>
  );
}
