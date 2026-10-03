'use client';

import type { ReactNode } from 'react';

import { PageTransition } from '@/features/shell/page-transition';

interface IAuthTemplateProps {
  readonly children: ReactNode;
}

export default function AuthTemplate({ children }: IAuthTemplateProps) {
  return <PageTransition>{children}</PageTransition>;
}
