import { NestAuthError, nestApiRequest, refreshSessionFromCookies } from '@/lib/auth/nest-auth';
import { getAccessToken } from '@/lib/auth/session';

async function resolveAccessToken(): Promise<string | null> {
  let accessToken = await getAccessToken();
  if (!accessToken) {
    const refreshed = await refreshSessionFromCookies();
    accessToken = refreshed?.accessToken ?? null;
  }
  return accessToken;
}

/**
 * Authenticated Nest fetch for Server Components / Server Actions.
 * Uses httpOnly session cookies; refreshes once on 401.
 */
export async function serverApiFetch<T>(
  path: string,
  init: {
    readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    readonly body?: unknown;
  } = {},
): Promise<T> {
  const accessToken = await resolveAccessToken();
  if (!accessToken) {
    throw new NestAuthError(401, 'Unauthorized');
  }

  try {
    const res = await nestApiRequest(path, {
      method: init.method ?? 'GET',
      body: init.body,
      accessToken,
    });
    return parseServerApiBody<T>(res.status, res.text, init.method ?? 'GET');
  } catch (error) {
    if (!(error instanceof NestAuthError) || error.status !== 401) {
      throw error;
    }
    const refreshed = await refreshSessionFromCookies();
    if (!refreshed?.accessToken) {
      throw error;
    }
    const res = await nestApiRequest(path, {
      method: init.method ?? 'GET',
      body: init.body,
      accessToken: refreshed.accessToken,
    });
    return parseServerApiBody<T>(res.status, res.text, init.method ?? 'GET');
  }
}

function parseServerApiBody<T>(
  status: number,
  text: string,
  method: string,
): T {
  const trimmed = text.trim();
  if (!trimmed) {
    if (status === 204 || method === 'DELETE' || method === 'HEAD') {
      return undefined as T;
    }
    throw new NestAuthError(status || 502, 'Empty response');
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new NestAuthError(status || 502, 'Invalid JSON response');
  }
}
