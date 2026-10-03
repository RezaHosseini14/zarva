import { NestAuthError } from '@/lib/auth/nest-auth-error';

export type SectionErrorKind = 'auth' | 'plan' | 'permission' | 'server';

export interface ISectionLoadError {
  readonly kind: SectionErrorKind;
  readonly status: number;
  readonly message: string;
}

export function mapNestSectionError(error: unknown): ISectionLoadError {
  if (error instanceof NestAuthError) {
    const msg = error.message.toLowerCase();
    if (error.status === 401) {
      return { kind: 'auth', status: 401, message: error.message };
    }
    if (
      error.status === 403 &&
      (msg.includes('module not in plan') || msg.includes('subscription'))
    ) {
      return { kind: 'plan', status: 403, message: error.message };
    }
    if (error.status === 403) {
      return { kind: 'permission', status: 403, message: error.message };
    }
    return { kind: 'server', status: error.status, message: error.message };
  }
  return {
    kind: 'server',
    status: 500,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

/** i18n keys under `common.*` for section load failures. */
export function sectionErrorTitleKey(kind: SectionErrorKind): string {
  switch (kind) {
    case 'auth':
      return 'sectionErrorAuthTitle';
    case 'plan':
      return 'sectionErrorPlanTitle';
    case 'permission':
      return 'sectionErrorPermissionTitle';
    default:
      return 'sectionErrorTitle';
  }
}

export function sectionErrorDescriptionKey(kind: SectionErrorKind): string {
  switch (kind) {
    case 'auth':
      return 'sectionErrorAuthDescription';
    case 'plan':
      return 'sectionErrorPlanDescription';
    case 'permission':
      return 'sectionErrorPermissionDescription';
    default:
      return 'sectionErrorDescription';
  }
}
