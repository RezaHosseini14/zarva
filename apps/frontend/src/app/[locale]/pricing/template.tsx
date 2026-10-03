'use client';

import type { ReactNode } from 'react';

import { PageTransition } from '@/features/shell/page-transition';

interface IPricingTemplateProps {
  readonly children: ReactNode;
}

export default function PricingTemplate({ children }: IPricingTemplateProps) {
  return <PageTransition>{children}</PageTransition>;
}