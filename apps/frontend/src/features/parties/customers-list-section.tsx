import { getSaleCustomers } from '@/features/sales/get-sales-data';
import { mapSaleCustomerToPartyRow } from '@/features/sales/map-sales-api';
import { PartiesListPage } from '@/features/parties/parties-list-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IProps {
  readonly chrome?: 'full' | 'body';
}

export async function CustomersListSection({ chrome = 'full' }: IProps) {
  const result = await loadServerApiSection(() => getSaleCustomers());
  if (!result.ok) {
    return (
      <PartiesListPage kind="customers" rows={[]} isError errorKind={result.error.kind} chrome={chrome} />
    );
  }
  return (
    <PartiesListPage
      kind="customers"
      rows={result.data.map(mapSaleCustomerToPartyRow)}
      chrome={chrome}
    />
  );
}
