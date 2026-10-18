import { UnauthorizedException } from '@nestjs/common';

import { SessionLivenessCache } from './session-liveness.cache';

describe('SessionLivenessCache', () => {
  const familyId = 'family-1';
  const userId = 'user-1';

  function createCache(liveRow: { id: string } | null) {
    const findFirst = jest.fn().mockResolvedValue(liveRow);
    const prisma = {
      refreshSession: { findFirst },
    } as unknown as ConstructorParameters<typeof SessionLivenessCache>[0];
    return { cache: new SessionLivenessCache(prisma), findFirst };
  }

  it('re-checks DB after markRevoked when a live refresh row exists', async () => {
    const { cache, findFirst } = createCache({ id: 'rs-1' });
    cache.markRevoked(familyId);

    await expect(cache.assertLive(familyId, userId)).resolves.toBeUndefined();
    expect(findFirst).toHaveBeenCalledTimes(1);
  });

  it('allows assertLive immediately after markLive without waiting', async () => {
    const { cache, findFirst } = createCache({ id: 'rs-1' });
    cache.markRevoked(familyId);
    cache.markLive(familyId);

    await expect(cache.assertLive(familyId, userId)).resolves.toBeUndefined();
    // Fresh live entry short-circuits DB
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('throws Session revoked when DB has no live refresh row', async () => {
    const { cache } = createCache(null);

    await expect(cache.assertLive(familyId, userId)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(cache.assertLive(familyId, userId)).rejects.toThrow(
      'Session revoked',
    );
  });
});
