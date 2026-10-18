import { getSaleInvoices, getSalesSummary } from '@/features/sales/get-sales-data';
import { mapSaleInvoiceToRow } from '@/features/sales/map-sales-api';
import { SalesListPage } from '@/features/sales/sales-list-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IProps {
  readonly chrome?: 'full' | 'body';
}

export async function SalesInvoicesSection({ chrome = 'full' }: IProps) {
  const result = await loadServerApiSection(async () => {
    const [invoices, summary] = await Promise.all([getSaleInvoices(), getSalesSummary()]);
    return { invoices, summary };
  });
  if (!result.ok) {
    return (
      <SalesListPage rows={[]} isError errorKind={result.error.kind} chrome={chrome} />
    );
  }
  return (
    <SalesListPage
      rows={result.data.invoices.map(mapSaleInvoiceToRow)}
      summary={result.data.summary}
      chrome={chrome}
    />
  );
}
