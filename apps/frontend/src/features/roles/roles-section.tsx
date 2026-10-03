import { getTranslations } from 'next-intl/server';

import { ErrorState } from '@/components/page/error-state';
import { getRolesData } from '@/features/roles/get-roles-data';
import { RolesWorkspace } from '@/features/roles/roles-workspace';

export async function RolesSection() {
  const t = await getTranslations('roles');

  let data: Awaited<ReturnType<typeof getRolesData>> | null = null;
  let loadFailed = false;

  try {
    data = await getRolesData();
  } catch {
    loadFailed = true;
  }

  if (loadFailed || !data) {
    return (
      <ErrorState
        className="mb-4"
        title={t('loadErrorTitle')}
        description={t('loadErrorDescription')}
      />
    );
  }

  return (
    <RolesWorkspace initialRoles={data.roles} initialPermissions={data.permissions} />
  );
}
