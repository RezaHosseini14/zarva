import { getTranslations } from 'next-intl/server';

import { searchGlobal } from '@/features/search/get-search-data';
import { SearchPageView } from '@/features/search/search-page-view';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { DomainListBodySkeleton } from '@/lib/lists/domain-list-body-skeleton';
import { StreamedDomainChrome } from '@/lib/lists/streamed-domain-chrome';

interface IProps {
  readonly query: string;
}

async function SearchSectionLoaded({ query }: IProps) {
  if (!query.trim()) {
    return <SearchPageView query="" result={null} chrome="body" />;
  }
  const result = await loadServerApiSection(() => searchGlobal(query));
  if (!result.ok) {
    return (
      <SearchPageView
        query={query}
        result={null}
        chrome="body"
        isError
        errorKind={result.error.kind}
      />
    );
  }
  return <SearchPageView query={query} result={result.data} chrome="body" />;
}

export async function SearchSectionLoader({ query }: IProps) {
  const t = await getTranslations('modules.search');
  if (!query.trim()) {
    return (
      <StreamedDomainChrome
        messageNs="modules.search"
        pathForNav="/search"
        skeletonFallback={null}
      >
        <SearchPageView query="" result={null} chrome="body" />
      </StreamedDomainChrome>
    );
  }
  return (
    <StreamedDomainChrome
      messageNs="modules.search"
      pathForNav="/search"
      skeletonFallback={
        <DomainListBodySkeleton
          columnHeaders={[t('title'), t('description')]}
          rowCount={4}
        />
      }
    >
      <SearchSectionLoaded query={query} />
    </StreamedDomainChrome>
  );
}
