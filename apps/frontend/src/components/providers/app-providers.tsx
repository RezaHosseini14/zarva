'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState, type ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import {
  NavigationProgressEffects,
  NavigationProgressProvider,
} from '@/features/shell/navigation-progress';

interface IProvidersProps {
  readonly children: ReactNode;
}

export function AppProviders({ children }: IProvidersProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={400}>
        <NavigationProgressProvider>
          <Suspense fallback={null}>
            <NavigationProgressEffects />
          </Suspense>
          {children}
        </NavigationProgressProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
