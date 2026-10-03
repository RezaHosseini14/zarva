'use client';

import { useEffect } from 'react';
import { DEFAULT_THEME_PRESET, isThemePresetId } from '@zarva/shared';

import { useAuth } from '@/features/auth/auth-provider';
import { apiFetch } from '@/lib/api';

const COOKIE = 'zarva_theme';

function readCookieTheme(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookieTheme(preset: string): void {
  document.cookie = `${COOKIE}=${encodeURIComponent(preset)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function applyTheme(preset: string): void {
  const id = isThemePresetId(preset) ? preset : DEFAULT_THEME_PRESET;
  document.documentElement.setAttribute('data-theme', id);
  writeCookieTheme(id);
}

export function OrgThemeApplicator() {
  const { user } = useAuth();

  useEffect(() => {
    const cached = readCookieTheme();
    if (cached && isThemePresetId(cached)) {
      applyTheme(cached);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const data = await apiFetch<{ preset?: string }>('/theme');
        if (!cancelled && data.preset) {
          applyTheme(data.preset);
        }
      } catch {
        // Keep cookie / default theme.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return null;
}

export function setClientThemePreset(preset: string): void {
  applyTheme(preset);
}
