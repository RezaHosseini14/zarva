import type { IUser } from '@zarva/shared';

import { getApiBaseUrl } from './cookie-names';
import { NestAuthError } from './nest-auth-error';
import {
  extractNestRefreshToken,
  getRefreshToken,
  setSessionCookies,
} from './session';

export { NestAuthError } from './nest-auth-error';

export interface INestAuthPayload {
  readonly user: IUser;
  readonly accessToken: string;
}

export interface INestAuthResult {
  readonly user: IUser;
  readonly accessToken: string;
  readonly refreshToken: string | null;
}

function parseErrorMessage(text: string, status: number): {
  readonly message: string;
  readonly body: unknown;
  readonly code: string | null;
} {
  if (!text) {
    return { message: `Request failed (${status})`, body: null, code: null };
  }
  try {
    const json = JSON.parse(text) as {
      message?: string | string[];
      error?: string;
      code?: string;
      sessions?: unknown;
    };
    let message = `Request failed (${status})`;
    if (Array.isArray(json.message) && json.message[0]) {
      message = String(json.message[0]);
    } else if (typeof json.message === 'string' && json.message.length > 0) {
      message = json.message;
    } else if (typeof json.error === 'string' && json.error.length > 0) {
      message = json.error;
    }
    return {
      message,
      body: json,
      code: typeof json.code === 'string' ? json.code : null,
    };
  } catch {
    return { message: text, body: null, code: null };
  }
}

interface INestRequestInit {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  readonly accessToken?: string | null;
  readonly refreshToken?: string | null;
}

export async function nestApiRequest(
  path: string,
  init: INestRequestInit = {},
): Promise<{ readonly status: number; readonly headers: Headers; readonly text: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (init.accessToken) {
    headers.Authorization = `Bearer ${init.accessToken}`;
  }
  const cookieParts: string[] = [];
  if (init.refreshToken) {
    cookieParts.push(`refresh_token=${init.refreshToken}`);
  }
  if (cookieParts.length > 0) {
    headers.Cookie = cookieParts.join('; ');
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: init.method ?? (init.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  if (!res.ok) {
    const parsed = parseErrorMessage(text, res.status);
    throw new NestAuthError(res.status, parsed.message, parsed.body, parsed.code);
  }

  return { status: res.status, headers: res.headers, text };
}

export async function nestAuthPost(
  path: string,
  body: unknown,
  init?: { readonly accessToken?: string | null; readonly refreshToken?: string | null },
): Promise<INestAuthResult> {
  const res = await nestApiRequest(path, {
    method: 'POST',
    body,
    accessToken: init?.accessToken,
    refreshToken: init?.refreshToken,
  });

  const data = parseJsonBody<INestAuthPayload>(res.text) ?? ({} as INestAuthPayload);
  if (!data.accessToken || !data.user) {
    throw new NestAuthError(500, 'Invalid auth response');
  }

  return {
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: extractNestRefreshToken(res.headers),
  };
}

export async function nestAuthGetMe(accessToken: string): Promise<IUser> {
  const res = await nestApiRequest('/auth/me', {
    method: 'GET',
    accessToken,
  });
  const data = parseJsonBody<{ user?: IUser }>(res.text) ?? {};
  if (!data.user) {
    throw new NestAuthError(500, 'Invalid me response');
  }
  return data.user;
}

function parseJsonBody<T>(text: string): T | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new NestAuthError(502, 'Invalid JSON response');
  }
}

export async function applyAuthSession(result: INestAuthResult): Promise<IUser> {
  await setSessionCookies(result.accessToken, result.refreshToken);
  return result.user;
}

let refreshInFlight: Promise<INestAuthResult | null> | null = null;

export async function refreshSessionFromCookies(): Promise<INestAuthResult | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  refreshInFlight = (async (): Promise<INestAuthResult | null> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return null;
    }
    try {
      const result = await nestAuthPost('/auth/refresh', {}, { refreshToken });
      await setSessionCookies(
        result.accessToken,
        result.refreshToken ?? refreshToken,
      );
      return result;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}
