'use client';

import { use } from 'react';

import { PartyDetailPage } from '@/features/parties/party-detail-page';
import { mockCustomers } from '@/mocks/domain-data';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const party = mockCustomers.find((c) => c.id === id) ?? mockCustomers[0]!;
  return <PartyDetailPage kind="customers" party={party} />;
}
