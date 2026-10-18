export const ACCESS_COOKIE = 'zarva_access';
export const REFRESH_COOKIE = 'zarva_refresh';

export const ACCESS_MAX_AGE_SEC = 24 * 60 * 60;
export const REFRESH_MAX_AGE_SEC = 7 * 24 * 60 * 60;

export function getApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4100/api/v1'
  );
}
