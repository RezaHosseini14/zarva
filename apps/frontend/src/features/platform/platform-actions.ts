'use server';

import type {
  IAssignSubscriptionRequest,
  IPlatformOrganizationSummary,
  IPlanWithPrices,
} from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export async function listPlatformOrganizations(): Promise<
  ReadonlyArray<IPlatformOrganizationSummary>
> {
  return serverApiFetch('/platform/organizations');
}

export async function listPlansForPlatform(): Promise<ReadonlyArray<IPlanWithPrices>> {
  return serverApiFetch('/plans');
}

export type PlatformActionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

export async function assignOrgSubscriptionAction(
  orgId: string,
  body: IAssignSubscriptionRequest,
): Promise<PlatformActionResult> {
  try {
    await serverApiFetch(`/platform/organizations/${orgId}/subscription`, {
      method: 'PUT',
      body,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Assign failed' };
  }
}

export async function assignOrgThemeAction(
  orgId: string,
  themePreset: string,
): Promise<PlatformActionResult> {
  try {
    await serverApiFetch(`/platform/organizations/${orgId}/theme`, {
      method: 'PUT',
      body: { themePreset },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Theme update failed' };
  }
}

export async function getOrgSecurityPolicyAction(
  orgId: string,
): Promise<{ maxDevicesPerUser: number | null } | null> {
  try {
    return await serverApiFetch(`/platform/organizations/${orgId}/security-policy`);
  } catch {
    return null;
  }
}

export async function setOrgSecurityPolicyAction(
  orgId: string,
  maxDevicesPerUser: number | null,
): Promise<PlatformActionResult> {
  try {
    await serverApiFetch(`/platform/organizations/${orgId}/security-policy`, {
      method: 'PUT',
      body: { maxDevicesPerUser },
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Policy update failed' };
  }
}
