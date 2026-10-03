'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { runPageExit } from '@/features/shell/page-transition';

const SHOW_DELAY_MS = 120;
const EXIT_MS = 160;

type TNavLoaderPhase = 'idle' | 'shown' | 'exiting';

interface INavigateOptions {
  readonly replace?: boolean;
}

interface INavigationProgressContext {
  readonly phase: TNavLoaderPhase;
  readonly start: (immediate?: boolean) => void;
  readonly done: () => void;
  readonly navigate: (href: string, options?: INavigateOptions) => Promise<void>;
}

const NavigationProgressContext = createContext<INavigationProgressContext | null>(null);

const noopNavigate = async () => undefined;

export function useNavigationProgress(): INavigationProgressContext {
  const ctx = useContext(NavigationProgressContext);
  if (!ctx) {
    return {
      phase: 'idle',
      start: () => undefined,
      done: () => undefined,
      navigate: noopNavigate,
    };
  }
  return ctx;
}

/** Soft exit then client navigate — use instead of raw router.push/replace for in-app moves. */
export function useNavigateWithTransition() {
  const { navigate } = useNavigationProgress();
  return navigate;
}

interface INavigationProgressProviderProps {
  readonly children: ReactNode;
}

export function NavigationProgressProvider({ children }: INavigationProgressProviderProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<TNavLoaderPhase>('idle');
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<TNavLoaderPhase>('idle');
  const busyRef = useRef(false);

  const setPhaseSafe = useCallback((next: TNavLoaderPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const start = useCallback((immediate = false) => {
    clearExitTimer();
    clearShowTimer();
    if (phaseRef.current === 'shown') return;
    if (phaseRef.current === 'exiting' || immediate) {
      setPhaseSafe('shown');
      return;
    }
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      setPhaseSafe('shown');
    }, SHOW_DELAY_MS);
  }, [clearExitTimer, clearShowTimer, setPhaseSafe]);

  const done = useCallback(() => {
    clearShowTimer();
    busyRef.current = false;
    if (phaseRef.current === 'idle') return;
    if (phaseRef.current === 'exiting') return;
    setPhaseSafe('exiting');
    clearExitTimer();
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      setPhaseSafe('idle');
    }, EXIT_MS);
  }, [clearExitTimer, clearShowTimer, setPhaseSafe]);

  const navigate = useCallback(
    async (href: string, options?: INavigateOptions) => {
      if (busyRef.current) return;
      busyRef.current = true;
      start(true);
      // Fade in parallel — never block push on exit (stuck opacity:0 → black screen).
      void runPageExit();
      try {
        if (options?.replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
      } catch {
        busyRef.current = false;
        done();
      }
      // Safety: if route commit never fires, clear loader so UI is not stuck dark.
      window.setTimeout(() => {
        if (busyRef.current || phaseRef.current === 'shown') {
          done();
        }
      }, 4000);
    },
    [done, router, start],
  );

  useEffect(() => {
    return () => {
      clearShowTimer();
      clearExitTimer();
    };
  }, [clearExitTimer, clearShowTimer]);

  const value = useMemo<INavigationProgressContext>(
    () => ({ phase, start, done, navigate }),
    [phase, start, done, navigate],
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
    </NavigationProgressContext.Provider>
  );
}

function isSameDocumentUrl(href: string): URL | null {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }

  if (url.origin !== window.location.origin) return null;

  const nextKey = `${url.pathname}${url.search}`;
  const currentKey = `${window.location.pathname}${window.location.search}`;
  if (nextKey === currentKey) return null;

  return url;
}

/** Listens for in-app link clicks and route commits — mount under Suspense for searchParams. */
export function NavigationProgressEffects() {
  const { navigate, done } = useNavigationProgress();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const routeKeyRef = useRef(`${pathname}?${search}`);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a');
      if (!anchor) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      const url = isSameDocumentUrl(href);
      if (!url) return;

      event.preventDefault();
      void navigateRef.current(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    const nextKey = `${pathname}?${search}`;
    if (routeKeyRef.current === nextKey) return;
    routeKeyRef.current = nextKey;
    done();
  }, [pathname, search, done]);

  return null;
}
