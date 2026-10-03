'use server';

import type { IAuthSession, IUser } from '@zarva/shared';

import {
  applyAuthSession,
  NestAuthError,
  nestApiRequest,
  nestAuthPost,
} from '@/lib/auth/nest-auth';
import {
  clearSessionCookies,
  getAccessToken,
  getRefreshToken,
} from '@/lib/auth/session';

export type AuthActionResult =
  | { readonly ok: true; readonly user: IUser }
  | { readonly ok: false; readonly error: string; readonly code?: string }
  | {
      readonly ok: false;
      readonly code: 'DEVICE_LIMIT';
      readonly error: string;
      readonly sessions: ReadonlyArray<IAuthSession>;
    };

export interface ILoginInput {
  readonly email: string;
  readonly password: string;
  readonly clientDeviceId?: string;
  readonly revokeSessionId?: string;
}

export interface ISignupInput {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly organizationName: string;
  readonly phone: string;
  readonly address: string;
  readonly otpCode: string;
  readonly locale?: string;
  readonly clientDeviceId?: string;
}

export interface IOtpRequestInput {
  readonly phone: string;
  readonly purpose: 'login' | 'signup';
}

export interface IOtpVerifyInput {
  readonly phone: string;
  readonly code: string;
  readonly clientDeviceId?: string;
  readonly revokeSessionId?: string;
}

function toActionError(error: unknown): AuthActionResult {
  if (error instanceof NestAuthError) {
    if (error.code === 'DEVICE_LIMIT') {
      const body = error.body as { sessions?: IAuthSession[] } | null;
      return {
        ok: false,
        code: 'DEVICE_LIMIT',
        error: error.message,
        sessions: body?.sessions ?? [],
      };
    }
    return { ok: false, error: error.message, code: error.code ?? undefined };
  }
  return { ok: false, error: 'Request failed' };
}

export async function loginAction(input: ILoginInput): Promise<AuthActionResult> {
  try {
    const result = await nestAuthPost('/auth/login', {
      email: input.email,
      password: input.password,
      clientDeviceId: input.clientDeviceId,
      revokeSessionId: input.revokeSessionId,
    });
    const user = await applyAuthSession(result);
    return { ok: true, user };
  } catch (error) {
    return toActionError(error);
  }
}

export async function signupAction(input: ISignupInput): Promise<AuthActionResult> {
  try {
    const result = await nestAuthPost('/auth/signup', {
      email: input.email,
      password: input.password,
      name: input.name,
      organizationName: input.organizationName,
      phone: input.phone,
      address: input.address,
      otpCode: input.otpCode,
      locale: input.locale,
      clientDeviceId: input.clientDeviceId,
    });
    const user = await applyAuthSession(result);
    return { ok: true, user };
  } catch (error) {
    return toActionError(error);
  }
}

export async function requestOtpAction(
  input: IOtpRequestInput,
): Promise<{ readonly ok: true } | { readonly ok: false; readonly error: string }> {
  try {
    await nestApiRequest('/auth/otp/request', {
      method: 'POST',
      body: { phone: input.phone, purpose: input.purpose },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Request failed' };
  }
}

export async function verifyOtpAction(
  input: IOtpVerifyInput,
): Promise<AuthActionResult> {
  try {
    const result = await nestAuthPost('/auth/otp/verify', {
      phone: input.phone,
      code: input.code,
      clientDeviceId: input.clientDeviceId,
      revokeSessionId: input.revokeSessionId,
    });
    const user = await applyAuthSession(result);
    return { ok: true, user };
  } catch (error) {
    return toActionError(error);
  }
}

export async function logoutAction(): Promise<{ readonly ok: true }> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  try {
    if (accessToken) {
      await nestApiRequest('/auth/logout', {
        method: 'POST',
        body: {},
        accessToken,
        refreshToken,
      });
    }
  } catch {
    // Always clear local cookies even if Nest revoke fails.
  }
  await clearSessionCookies();
  return { ok: true };
}
