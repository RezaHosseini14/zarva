import { mapNestSectionError, type ISectionLoadError } from '@/lib/auth/section-load-error';

export type { ISectionLoadError };

/**
 * Run a server API loader; on failure return mapped section error metadata
 * instead of swallowing the cause.
 */
export async function loadServerApiSection<T>(
  load: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; error: ISectionLoadError }> {
  try {
    const data = await load();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: mapNestSectionError(error) };
  }
}
