import { getSaleInvoices } from '@/features/sales/get-sales-data';
import { mapSaleInvoiceToRow } from '@/features/sales/map-sales-api';
import { SalesListPage } from '@/features/sales/sales-list-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IProps {
  readonly chrome?: 'full' | 'body';
}

export async function SalesInvoicesSection({ chrome = 'full' }: IProps) {
  const result = await loadServerApiSection(() => getSaleInvoices());
  if (!result.ok) {
    return (
      <SalesListPage rows={[]} isError errorKind={result.error.kind} chrome={chrome} />
    );
  }
  return (
    <SalesListPage
      rows={result.data.map(mapSaleInvoiceToRow)}
      chrome={chrome}
    />
  );
}
