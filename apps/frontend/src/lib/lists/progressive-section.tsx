import { Suspense, type ReactNode } from 'react';

interface IProgressiveSectionProps {
  readonly fallback: ReactNode;
  readonly children: ReactNode;
}

/** One independent data source → one Suspense unit. */
export function ProgressiveSection({
  fallback,
  children,
}: IProgressiveSectionProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
