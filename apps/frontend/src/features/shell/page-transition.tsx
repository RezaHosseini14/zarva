'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export const PAGE_TRANSITION_ID = 'zarva-page-transition';
export const PAGE_EXIT_MS = 220;
export const PAGE_EXIT_CLASS = 'zarva-page-transition--exit';
export const PAGE_ENTER_CLASS = 'zarva-page-transition--enter';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Soft-exit current page content; resolves when the CSS transition finishes. */
export function runPageExit(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const el = document.getElementById(PAGE_TRANSITION_ID);
  if (!el || prefersReducedMotion()) return Promise.resolve();

  el.classList.remove(PAGE_ENTER_CLASS);

  if (!el.classList.contains(PAGE_EXIT_CLASS)) {
    void el.offsetWidth;
    el.classList.add(PAGE_EXIT_CLASS);
  }

  return waitForExit(el);
}

function waitForExit(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      el.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timeoutId);
      resolve();
    };

    const onEnd = (event: TransitionEvent) => {
      if (event.target !== el) return;
      if (event.propertyName !== 'opacity') return;
      finish();
    };

    el.addEventListener('transitionend', onEnd);
    const timeoutId = window.setTimeout(finish, PAGE_EXIT_MS + 80);
  });
}

interface IPageTransitionProps {
  readonly children: ReactNode;
}

/** Remounts with each App Router `template.tsx` — plays enter CSS on mount. */
export function PageTransition({ children }: IPageTransitionProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      id={PAGE_TRANSITION_ID}
      className={`zarva-page-transition ${PAGE_ENTER_CLASS}`}
    >
      {children}
    </div>
  );
}
