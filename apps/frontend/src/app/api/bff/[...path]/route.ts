import { NextRequest, NextResponse } from 'next/server';

import { refreshSessionFromCookies } from '@/lib/auth/nest-auth';
import { getApiBaseUrl } from '@/lib/auth/cookie-names';
import { clearSessionCookies, getAccessToken } from '@/lib/auth/session';

interface IRouteContext {
  readonly params: Promise<{ path: string[] }>;
}

async function forwardOnce(
  path: string,
  search: string,
  method: string,
  accessToken: string,
  contentType: string | null,
  body: ArrayBuffer | undefined,
): Promise<Response> {
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  return fetch(`${getApiBaseUrl()}${path}${search}`, {
    method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
    cache: 'no-store',
  });
}

async function proxyRequest(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const path = `/${pathSegments.join('/')}`;
  const search = request.nextUrl.search;
  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;
  const contentType = request.headers.get('content-type');

  let accessToken = await getAccessToken();
  if (!accessToken) {
    const refreshed = await refreshSessionFromCookies();
    accessToken = refreshed?.accessToken ?? null;
  }

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await forwardOnce(path, search, method, accessToken, contentType, body);

    if (upstream.status === 401) {
      const refreshed = await refreshSessionFromCookies();
      if (!refreshed?.accessToken) {
        await clearSessionCookies();
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      upstream = await forwardOnce(
        path,
        search,
        method,
        refreshed.accessToken,
        contentType,
        body,
      );
      if (upstream.status === 401) {
        await clearSessionCookies();
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }
  } catch {
    return NextResponse.json(
      { message: 'Backend unavailable' },
      { status: 503 },
    );
  }

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) {
    responseHeaders.set('content-type', upstreamType);
  }

  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: IRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: IRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: IRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: IRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: IRouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
