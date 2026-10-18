import { getCustomersSummary, getSaleCustomers } from '@/features/sales/get-sales-data';
import { mapSaleCustomerToPartyRow } from '@/features/sales/map-sales-api';
import { PartiesListPage } from '@/features/parties/parties-list-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IProps {
  readonly chrome?: 'full' | 'body';
}

export async function CustomersListSection({ chrome = 'full' }: IProps) {
  const result = await loadServerApiSection(async () => {
    const [customers, summary] = await Promise.all([
      getSaleCustomers(),
      getCustomersSummary(),
    ]);
    return { customers, summary };
  });
  if (!result.ok) {
    return (
      <PartiesListPage kind="customers" rows={[]} isError errorKind={result.error.kind} chrome={chrome} />
    );
  }
  return (
    <PartiesListPage
      kind="customers"
      rows={result.data.customers.map(mapSaleCustomerToPartyRow)}
      customersSummary={result.data.summary}
      chrome={chrome}
    />
  );
}
