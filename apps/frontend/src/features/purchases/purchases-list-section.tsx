import { getPurchases } from '@/features/catalog/get-catalog-data';
import { getPurchasesSummary } from '@/features/purchases/get-purchases-data';
import { PurchasesListPage } from '@/features/purchases/purchases-list-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IProps {
  readonly chrome?: 'full' | 'body';
}

export async function PurchasesListSection({ chrome = 'full' }: IProps) {
  const result = await loadServerApiSection(async () => {
    const [rows, summary] = await Promise.all([getPurchases(), getPurchasesSummary()]);
    return { rows, summary };
  });
  if (!result.ok) {
    return (
      <PurchasesListPage rows={[]} isError errorKind={result.error.kind} chrome={chrome} />
    );
  }
  return (
    <PurchasesListPage
      rows={result.data.rows}
      summary={result.data.summary}
      chrome={chrome}
    />
  );
}
