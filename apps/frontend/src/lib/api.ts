import type { IApiResponse, IUser } from '@zarva/shared';

const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4100/api/v1';

/** Auth-ish routes that must not trigger silent refresh on 401. */
const NO_REFRESH_PATHS = new Set([
  '/auth/refresh',
  '/auth/login',
  '/auth/signup',
  '/auth/otp/verify',
  '/auth/otp/request',
  '/auth/logout',
]);

export interface IApiClientOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  /** @deprecated Access token lives in httpOnly cookies; BFF attaches Bearer. Ignored. */
  readonly token?: string | null;
  /** Hit Nest directly (no session). Use for public endpoints like `/plans`. */
  readonly public?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly messages: ReadonlyArray<string>;

  constructor(status: number, messages: ReadonlyArray<string>) {
    super(messages[0] ?? `Request failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.messages = messages;
  }
}

export interface IAuthResponse {
  readonly user: IUser;
  readonly accessToken: string;
}

let onUnauthorized: (() => void) | null = null;
let onSessionRefreshed: ((session: { user: IUser }) => void) | null = null;
let refreshPromise: Promise<boolean> | null = null;

/** Register a handler invoked when refresh fails or 401 cannot be recovered. */
export function setApiUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/** Register a handler invoked after a successful silent cookie refresh. */
export function setApiSessionRefreshedHandler(
  handler: ((session: { user: IUser }) => void) | null,
): void {
  onSessionRefreshed = handler;
}

function parseErrorPayload(text: string, status: number): ApiError {
  if (!text) {
    return new ApiError(status, [`Request failed (${status})`]);
  }
  try {
    const json = JSON.parse(text) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(json.message)) {
      return new ApiError(status, json.message.map(String));
    }
    if (typeof json.message === 'string' && json.message.length > 0) {
      return new ApiError(status, [json.message]);
    }
    if (typeof json.error === 'string' && json.error.length > 0) {
      return new ApiError(status, [json.error]);
    }
  } catch {
    // not JSON
  }
  return new ApiError(status, [text]);
}

async function refreshSessionCookies(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async (): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) {
          return false;
        }
        const data = (await res.json()) as { user?: IUser };
        if (data.user) {
          onSessionRefreshed?.({ user: data.user });
        }
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Browser API client — authenticated calls go through Next BFF (`/api/bff/*`)
 * so the access JWT stays in httpOnly cookies.
 */
export async function apiFetch<T>(
  path: string,
  options: IApiClientOptions = {},
  isRetry = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const url = options.public ? `${PUBLIC_API_URL}${path}` : `/api/bff${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      credentials: options.public ? 'omit' : 'include',
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, ['Network error']);
  }

  if (!res.ok) {
    if (res.status === 401 && !options.public) {
      const canRefresh = !isRetry && !NO_REFRESH_PATHS.has(path);
      if (canRefresh) {
        const refreshed = await refreshSessionCookies();
        if (refreshed) {
          return apiFetch<T>(path, options, true);
        }
      }
      onUnauthorized?.();
    }
    const text = await res.text();
    throw parseErrorPayload(text, res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  if (!text.trim()) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(res.status, ['Invalid JSON response']);
  }
}

export type { IApiResponse };
