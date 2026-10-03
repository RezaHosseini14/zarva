'use client';

import type { ReactNode } from 'react';

import { PageTransition } from '@/features/shell/page-transition';

interface IAppTemplateProps {
  readonly children: ReactNode;
}

export default function AppTemplate({ children }: IAppTemplateProps) {
  return <PageTransition>{children}</PageTransition>;
}
