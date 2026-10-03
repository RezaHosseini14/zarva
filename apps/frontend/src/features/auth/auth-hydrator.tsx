'use client';

import { useLayoutEffect } from 'react';
import type { IUser } from '@zarva/shared';

import { useAuth } from '@/features/auth/auth-provider';

interface IAuthHydratorProps {
  readonly user: IUser;
}

/** Sync server-resolved user into AuthProvider before client paint. */
export function AuthHydrator({ user }: IAuthHydratorProps) {
  const { setSession, user: current } = useAuth();

  useLayoutEffect(() => {
    if (!current || current.id !== user.id) {
      setSession(user);
    }
  }, [user, current, setSession]);

  return null;
}
