'use client';

import { createContext, useContext, type ReactNode } from 'react';

const SidebarNavCloseContext = createContext<(() => void) | null>(null);

export function SidebarNavCloseProvider({
  onClose,
  children,
}: {
  readonly onClose: () => void;
  readonly children: ReactNode;
}) {
  return (
    <SidebarNavCloseContext.Provider value={onClose}>
      {children}
    </SidebarNavCloseContext.Provider>
  );
}

export function useSidebarNavClose(): (() => void) | undefined {
  return useContext(SidebarNavCloseContext) ?? undefined;
}
