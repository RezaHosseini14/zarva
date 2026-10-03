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
import { createAppAbility, type AppAbility, type IUser } from '@zarva/shared';

import {
  setApiSessionRefreshedHandler,
  setApiUnauthorizedHandler,
} from '@/lib/api';
import { logoutAction } from '@/features/auth/actions';
import { useNavigateWithTransition } from '@/features/shell/navigation-progress';

interface IAuthContextValue {
  readonly user: IUser | null;
  /** In-memory JWT for Socket.IO only — never written to localStorage. */
  readonly token: string | null;
  readonly ability: AppAbility;
  readonly isReady: boolean;
  setSession: (user: IUser) => void;
  clearSession: () => void;
}

const AuthContext = createContext<IAuthContextValue | null>(null);

interface IAuthProviderProps {
  readonly children: ReactNode;
}

function looksLikeJwt(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

async function readJsonBody<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text.trim()) {
    return null;
  }
  return JSON.parse(text) as T;
}

async function fetchWsToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/ws-token', { credentials: 'include' });
    if (!res.ok) {
      return null;
    }
    const data = await readJsonBody<{ accessToken?: string }>(res);
    if (data?.accessToken && looksLikeJwt(data.accessToken)) {
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchCurrentUser(): Promise<IUser | null> {
  try {
    const res = await fetch('/api/bff/auth/me', { credentials: 'include' });
    if (!res.ok) {
      return null;
    }
    const data = await readJsonBody<{ user?: IUser }>(res);
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: IAuthProviderProps) {
  const navigate = useNavigateWithTransition();
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const serverHydratedRef = useRef(false);

  const clearSession = useCallback(() => {
    serverHydratedRef.current = false;
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zarva.session');
    }
  }, []);

  const setSession = useCallback((nextUser: IUser) => {
    serverHydratedRef.current = true;
    setUser(nextUser);
    setIsReady(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zarva.session');
    }
    void fetchWsToken().then((wsToken) => {
      setToken(wsToken);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zarva.session');
      }
      if (serverHydratedRef.current) {
        if (!cancelled) {
          setIsReady(true);
        }
        return;
      }
      const me = await fetchCurrentUser();
      if (cancelled || serverHydratedRef.current) {
        if (!cancelled) {
          setIsReady(true);
        }
        return;
      }
      if (me) {
        setUser(me);
        const wsToken = await fetchWsToken();
        if (!cancelled && !serverHydratedRef.current) {
          setToken(wsToken);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      if (!cancelled) {
        setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setApiSessionRefreshedHandler((session) => {
      setUser(session.user);
      void fetchWsToken().then(setToken);
    });
    setApiUnauthorizedHandler(() => {
      void (async () => {
        try {
          await logoutAction();
        } catch {
          // ignore
        }
        clearSession();
        if (typeof window !== 'undefined') {
          const locale = window.location.pathname.split('/').filter(Boolean)[0] ?? 'fa';
          void navigate(`/${locale}/login`, { replace: true });
        }
      })();
    });
    return () => {
      setApiSessionRefreshedHandler(null);
      setApiUnauthorizedHandler(null);
    };
  }, [clearSession, navigate]);

  const value = useMemo<IAuthContextValue>(() => {
    const ability = createAppAbility({
      id: user?.id ?? 'anon',
      roleName: user?.roleName ?? 'VIEWER',
      permissions: user?.permissions ?? [],
      branchId: user?.branchId,
    });
    return {
      user,
      token,
      ability,
      isReady,
      setSession,
      clearSession,
    };
  }, [user, token, isReady, setSession, clearSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth requires AuthProvider');
  }
  return ctx;
}

export function useAppAbility(): AppAbility {
  return useAuth().ability;
}
