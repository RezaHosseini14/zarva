import type { DeviceType } from '@zarva/shared';

export interface IParsedDeviceMeta {
  readonly deviceName: string;
  readonly deviceType: DeviceType;
  readonly os: string | null;
  readonly browser: string | null;
}

export function parseUserAgent(userAgent: string | null | undefined): IParsedDeviceMeta {
  const ua = (userAgent ?? '').trim();
  if (!ua) {
    return {
      deviceName: 'Unknown device',
      deviceType: 'unknown',
      os: null,
      browser: null,
    };
  }

  const os =
    /Windows NT/i.test(ua)
      ? 'Windows'
      : /Android/i.test(ua)
        ? 'Android'
        : /iPhone|iPad|iPod/i.test(ua)
          ? 'iOS'
          : /Mac OS X/i.test(ua)
            ? 'macOS'
            : /Linux/i.test(ua)
              ? 'Linux'
              : null;

  const browser =
    /Edg\//i.test(ua)
      ? 'Edge'
      : /Chrome\//i.test(ua) && !/Edg\//i.test(ua)
        ? 'Chrome'
        : /Firefox\//i.test(ua)
          ? 'Firefox'
          : /Safari\//i.test(ua) && !/Chrome\//i.test(ua)
            ? 'Safari'
            : /OPR\//i.test(ua) || /Opera/i.test(ua)
              ? 'Opera'
              : null;

  const deviceType: DeviceType = /iPad|Tablet/i.test(ua)
    ? 'tablet'
    : /Mobile|Android|iPhone|iPod/i.test(ua)
      ? 'mobile'
      : os
        ? 'desktop'
        : 'unknown';

  const deviceName =
    browser && os ? `${browser} on ${os}` : browser ?? os ?? 'Unknown device';

  return { deviceName, deviceType, os, browser };
}

export function clientIpFromRequest(req: {
  readonly headers?: Record<string, string | string[] | undefined>;
  readonly ip?: string;
  readonly socket?: { readonly remoteAddress?: string };
}): string | null {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() ?? null;
  }
  return req.ip ?? req.socket?.remoteAddress ?? null;
}
