'use server';

import { NestAuthError, nestApiRequest } from '@/lib/auth/nest-auth';
import { getAccessToken } from '@/lib/auth/session';

export type AuthExtraActionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

export interface IForgotPasswordInput {
  readonly email: string;
}

export interface IResetPasswordInput {
  readonly password: string;
  readonly token: string;
}

export interface IEnableTwoFaInput {
  readonly code: string;
}

export interface IAcceptInviteInput {
  readonly token: string;
  readonly name: string;
  readonly password: string;
}

export interface ITwoFaSetupResult {
  readonly secret?: string;
  readonly otpauthUrl?: string;
}

function toActionError(error: unknown): AuthExtraActionResult {
  if (error instanceof NestAuthError) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: 'Request failed' };
}

export async function forgotPasswordAction(
  input: IForgotPasswordInput,
): Promise<AuthExtraActionResult> {
  try {
    await nestApiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email: input.email },
    });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function resetPasswordAction(
  input: IResetPasswordInput,
): Promise<AuthExtraActionResult> {
  try {
    await nestApiRequest('/auth/reset-password', {
      method: 'POST',
      body: {
        password: input.password,
        token: input.token,
      },
    });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function setupTwoFaAction(): Promise<
  | { readonly ok: true; readonly setup: ITwoFaSetupResult }
  | { readonly ok: false; readonly error: string }
> {
  try {
    const accessToken = await getAccessToken();
    const res = await nestApiRequest('/auth/totp/setup', {
      method: 'POST',
      body: {},
      accessToken,
    });
    const setup = res.text
      ? (JSON.parse(res.text) as { secret?: string; uri?: string; otpauthUrl?: string })
      : {};
    return {
      ok: true,
      setup: {
        secret: setup.secret,
        otpauthUrl: setup.otpauthUrl ?? setup.uri,
      },
    };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Request failed' };
  }
}

export async function enableTwoFaAction(
  input: IEnableTwoFaInput,
): Promise<AuthExtraActionResult> {
  try {
    const accessToken = await getAccessToken();
    await nestApiRequest('/auth/totp/enable', {
      method: 'POST',
      body: { code: input.code },
      accessToken,
    });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function acceptInviteAction(
  input: IAcceptInviteInput,
): Promise<AuthExtraActionResult> {
  try {
    await nestApiRequest('/auth/invites/accept', {
      method: 'POST',
      body: {
        token: input.token,
        name: input.name,
        password: input.password,
      },
    });
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
