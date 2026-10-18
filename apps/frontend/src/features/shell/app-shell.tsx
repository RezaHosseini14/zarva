'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ZarvaAppCanvas } from '@/components/surfaces/zarva-app-canvas';

import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { ZarvaNavLoader } from './zarva-nav-loader';

interface IShellTitleContext {
  readonly title: string;
  readonly setTitle: (title: string) => void;
}

const ShellTitleContext = createContext<IShellTitleContext | null>(null);

interface IAppShellFrameProps {
  readonly children: ReactNode;
  readonly navSlot: ReactNode;
}

/** Persistent chrome for (app) routes — survives client navigations. */
export function AppShellFrame({ children, navSlot }: IAppShellFrameProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitleState] = useState('');

  const setTitle = useCallback((next: string) => {
    setTitleState(next);
  }, []);

  const titleCtx = useMemo<IShellTitleContext>(
    () => ({ title, setTitle }),
    [title, setTitle],
  );

  return (
    <ShellTitleContext.Provider value={titleCtx}>
      <ZarvaNavLoader />
      <ZarvaAppCanvas className="text-foreground">
        <div className="flex h-dvh gap-3 overflow-hidden p-[var(--shell-inset)] sm:gap-4">
          <AppSidebar open={open} onClose={() => setOpen(false)} navSlot={navSlot} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 sm:gap-4">
            <AppHeader title={title} onMenuClick={() => setOpen(true)} />
            <main className="zarva-scrollbar min-h-0 flex-1 overflow-y-auto px-0.5 pb-4 sm:px-1">
              {children}
            </main>
          </div>
        </div>
      </ZarvaAppCanvas>
    </ShellTitleContext.Provider>
  );
}

interface IAppShellProps {
  readonly title: string;
  readonly children: ReactNode;
}

function ShellTitleBridge({ title, children }: IAppShellProps) {
  const ctx = useContext(ShellTitleContext);
  const setTitle = ctx?.setTitle;

  useLayoutEffect(() => {
    if (!setTitle) return;
    setTitle(title);
  }, [setTitle, title]);

  return <>{children}</>;
}

/**
 * Sets the header title and renders page content inside the persistent frame.
 * Falls back to a full frame only when used outside `(app)` layout.
 */
export function AppShell({ title, children }: IAppShellProps) {
  const ctx = useContext(ShellTitleContext);

  if (!ctx) {
    return (
      <AppShellFrame navSlot={null}>
        <ShellTitleBridge title={title}>{children}</ShellTitleBridge>
      </AppShellFrame>
    );
  }

  return <ShellTitleBridge title={title}>{children}</ShellTitleBridge>;
}
