'use server';

import type { IOrgSettingSection } from '@zarva/shared';

import { NestAuthError } from '@/lib/auth/nest-auth';
import { serverApiFetch } from '@/lib/auth/server-api';

export type SettingsActionResult =
  | { readonly ok: true; readonly section: IOrgSettingSection }
  | { readonly ok: false; readonly error: string };

export async function updateSettingsSectionAction(input: {
  readonly section: string;
  readonly values: Record<string, string>;
}): Promise<SettingsActionResult> {
  try {
    const section = await serverApiFetch<IOrgSettingSection>(
      `/settings/${encodeURIComponent(input.section)}`,
      { method: 'PUT', body: { values: input.values } },
    );
    return { ok: true, section };
  } catch (error) {
    if (error instanceof NestAuthError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Save failed' };
  }
}
