import { getSuppliers } from '@/features/catalog/get-catalog-data';
import { PartiesListPage } from '@/features/parties/parties-list-page';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';

interface IProps {
  readonly chrome?: 'full' | 'body';
}

export async function SuppliersListSection({ chrome = 'full' }: IProps) {
  const result = await loadServerApiSection(() => getSuppliers());
  if (!result.ok) {
    return (
      <PartiesListPage
        kind="suppliers"
        rows={[]}
        isError
        errorKind={result.error.kind}
        chrome={chrome}
      />
    );
  }
  return <PartiesListPage kind="suppliers" rows={result.data} chrome={chrome} />;
}
