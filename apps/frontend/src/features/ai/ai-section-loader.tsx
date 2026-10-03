import { SimpleDomainPage } from '@/features/domain/simple-domain-page';
import { getAiInsights } from '@/features/ai/get-ai-data';
import { loadServerApiSection } from '@/lib/auth/load-server-api-section';
import { WrapSimpleDomainLoader } from '@/lib/lists/wrap-simple-domain-loader';

async function AiSectionLoaded() {
  const result = await loadServerApiSection(() => getAiInsights());
  if (!result.ok) {
    return (
      <SimpleDomainPage
        moduleKey="ai"
        variant="insights"
        rows={[]}
        chrome="body"
        isError
        errorKind={result.error.kind}
        insightsRaw
      />
    );
  }
  return (
    <SimpleDomainPage
      moduleKey="ai"
      variant="insights"
      chrome="body"
      rows={result.data.map((r) => ({ id: r.id, a: r.a, b: r.b, c: r.c }))}
      insightsRaw
    />
  );
}

export function AiSectionLoader() {
  return (
    <WrapSimpleDomainLoader moduleKey="ai" variant="insights">
      <AiSectionLoaded />
    </WrapSimpleDomainLoader>
  );
}
