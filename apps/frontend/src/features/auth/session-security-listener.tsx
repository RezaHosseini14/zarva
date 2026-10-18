'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { io, type Socket } from 'socket.io-client';
import type {
  IAuthSession,
  IAuthSessionNewEvent,
  IAuthSessionRevokedEvent,
  INotificationInboxItem,
} from '@zarva/shared';

import { useAuth } from '@/features/auth/auth-provider';
import { logoutAction } from '@/features/auth/actions';
import { NewLoginAlertDialog } from '@/features/auth/new-login-alert-dialog';
import { ApiError, apiFetch } from '@/lib/api';
import { getOrCreateClientDeviceId } from '@/lib/auth/client-device-id';

const WS_ORIGIN =
  process.env.NEXT_PUBLIC_WS_URL ??
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100/api/v1').replace(/\/api\/v1\/?$/, '');

const FAMILY_KEY = 'zarva.familyId';

function readJwtFamilyId(token: string): string | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as {
      familyId?: string;
    };
    return typeof json.familyId === 'string' && json.familyId.length > 0 ? json.familyId : null;
  } catch {
    return null;
  }
}

function storeFamilyId(familyId: string | null): void {
  try {
    if (familyId) sessionStorage.setItem(FAMILY_KEY, familyId);
    else sessionStorage.removeItem(FAMILY_KEY);
  } catch {
    // ignore
  }
}

function loadFamilyId(): string | null {
  try {
    return sessionStorage.getItem(FAMILY_KEY);
  } catch {
    return null;
  }
}

async function clearAuthCookies(): Promise<void> {
  try {
    await fetch('/api/auth/clear-session', { method: 'POST', credentials: 'include' });
  } catch {
    // ignore
  }
  try {
    await logoutAction();
  } catch {
    // ignore
  }
}

export function SessionSecurityListener() {
  const { token, isReady, clearSession } = useAuth();
  const locale = useLocale();
  const [alert, setAlert] = useState<IAuthSessionNewEvent | null>(null);
  const [denying, setDenying] = useState(false);
  const myFamilyIdRef = useRef<string | null>(null);
  const kickingRef = useRef(false);

  useEffect(() => {
    if (!isReady || !token || !looksLikeJwt(token)) {
      myFamilyIdRef.current = null;
      return;
    }

    const fromJwt = readJwtFamilyId(token);
    if (fromJwt) {
      myFamilyIdRef.current = fromJwt;
      storeFamilyId(fromJwt);
    } else {
      myFamilyIdRef.current = loadFamilyId();
    }

    const myDeviceId = getOrCreateClientDeviceId();

    void apiFetch<{ items: IAuthSession[] }>('/auth/sessions')
      .then((res) => {
        const current = res.items.find((s) => s.isCurrent)?.familyId ?? null;
        if (current) {
          myFamilyIdRef.current = current;
          storeFamilyId(current);
        }
      })
      .catch(() => {
        /* keep jwt/sessionStorage */
      });

    const socket: Socket = io(`${WS_ORIGIN}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
    });

    const resolveMine = (): string | null =>
      myFamilyIdRef.current ?? loadFamilyId() ?? readJwtFamilyId(token);

    const hardKick = (): void => {
      if (kickingRef.current) return;
      kickingRef.current = true;
      myFamilyIdRef.current = null;
      storeFamilyId(null);
      clearSession();
      void (async () => {
        await clearAuthCookies();
        window.location.replace(`/${locale}/login`);
      })();
    };

    const showNewLogin = (payload: IAuthSessionNewEvent): void => {
      // Never alert about this browser.
      if (payload.clientDeviceId && payload.clientDeviceId === myDeviceId) return;
      const mine = resolveMine();
      // Only skip if the event is somehow about our own family (should not happen).
      if (payload.familyId && mine && payload.familyId === mine) return;
      setAlert(payload);
    };

    socket.on('auth.session.new', showNewLogin);

    // Fallback if auth.session.new was missed — same payload rides on notification.created.
    socket.on('notification.created', (n: INotificationInboxItem) => {
      if (n.type !== 'auth.new_login') return;
      const meta = n.metadata ?? {};
      const sessionId = typeof meta.sessionId === 'string' ? meta.sessionId : null;
      const familyId = typeof meta.familyId === 'string' ? meta.familyId : null;
      if (!sessionId || !familyId) return;
      showNewLogin({
        sessionId,
        familyId,
        clientDeviceId: typeof meta.clientDeviceId === 'string' ? meta.clientDeviceId : null,
        deviceName: typeof meta.deviceName === 'string' ? meta.deviceName : 'Unknown device',
        deviceType: 'desktop',
        ip: typeof meta.ip === 'string' ? meta.ip : null,
        createdAt: typeof meta.createdAt === 'string' ? meta.createdAt : n.createdAt,
      });
    });

    socket.on('auth.session.revoked', (payload: IAuthSessionRevokedEvent) => {
      // Close modal if that foreign session was denied/revoked.
      setAlert((prev) =>
        prev && (prev.familyId === payload.familyId || prev.sessionId === payload.sessionId)
          ? null
          : prev,
      );

      const mine = resolveMine();

      // ONLY the revoked device kicks itself. The denier must stay.
      if (mine && mine === payload.familyId) {
        hardKick();
        return;
      }

      if (mine && mine !== payload.familyId) {
        // We are another live device (the one who clicked "No") — do nothing.
        return;
      }

      // Family unknown yet: learn it, kick only if WE are the revoked family.
      void apiFetch<{ items: IAuthSession[] }>('/auth/sessions')
        .then((res) => {
          const current = res.items.find((s) => s.isCurrent)?.familyId ?? null;
          if (current) {
            myFamilyIdRef.current = current;
            storeFamilyId(current);
          }
          if (current && current === payload.familyId) {
            hardKick();
          }
        })
        .catch(() => {
          // Do NOT kick on probe errors — that was ejecting the denier.
        });
    });

    // Heartbeat: cheap /auth/sessions/pulse (JWT liveness only, cached server-side).
    // Skip overlapping probes so a slow remote DB cannot pile up requests.
    let beatInFlight = false;
    const beat = window.setInterval(() => {
      if (beatInFlight || kickingRef.current) return;
      beatInFlight = true;
      void apiFetch<{ ok: true }>('/auth/sessions/pulse')
        .catch((err: unknown) => {
          if (!(err instanceof ApiError) || (err.status !== 401 && err.status !== 403)) {
            return;
          }
          const mine = resolveMine();
          // If we still know our family and JWT died, we were revoked.
          if (mine) hardKick();
        })
        .finally(() => {
          beatInFlight = false;
        });
    }, 30_000);

    return () => {
      window.clearInterval(beat);
      socket.disconnect();
    };
  }, [clearSession, isReady, locale, token]);

  if (!alert) return null;

  return (
    <NewLoginAlertDialog
      event={alert}
      pending={denying}
      onConfirm={() => setAlert(null)}
      onDeny={() => {
        void (async () => {
          setDenying(true);
          const target = alert;
          try {
            await apiFetch(`/auth/sessions/${target.sessionId}/deny`, {
              method: 'POST',
              body: {},
            });
          } catch {
            // still dismiss
          } finally {
            setAlert(null);
            setDenying(false);
          }
        })();
      }}
    />
  );
}

function looksLikeJwt(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}
