import {
  canBroadcastPlatformNotification,
  canSendOrgNotification,
  canSendPriority,
  resolveAudienceRequiresPlatform,
} from './notifications.permissions';
import type { IAuthUser } from '../auth/auth.types';

function user(partial: Partial<IAuthUser> & Pick<IAuthUser, 'roleName' | 'permissions'>): IAuthUser {
  return {
    id: 'u1',
    email: 'a@b.c',
    phone: '09120000000',
    address: '—',
    name: 'A',
    organizationId: 'org1',
    branchId: null,
    locale: 'fa',
    ...partial,
  };
}

describe('notifications permissions', () => {
  it('allows ORG_ADMIN to send org notifications', () => {
    expect(canSendOrgNotification(user({ roleName: 'ORG_ADMIN', permissions: [] }))).toBe(true);
  });

  it('forbids ORG_ADMIN from platform broadcast', () => {
    expect(
      canBroadcastPlatformNotification(user({ roleName: 'ORG_ADMIN', permissions: [] })),
    ).toBe(false);
  });

  it('allows custom role with broadcast_platform', () => {
    const u = user({
      roleName: 'VIEWER',
      permissions: ['notifications.broadcast_platform'],
    });
    expect(canBroadcastPlatformNotification(u)).toBe(true);
    expect(canSendOrgNotification(u)).toBe(true);
  });

  it('requires platform for ORGS and PLATFORM_ALL', () => {
    expect(resolveAudienceRequiresPlatform('ORG_ALL')).toBe(false);
    expect(resolveAudienceRequiresPlatform('ORGS')).toBe(true);
    expect(resolveAudienceRequiresPlatform('PLATFORM_ALL')).toBe(true);
  });

  it('allows send via notifications.send', () => {
    expect(
      canSendOrgNotification(
        user({ roleName: 'VIEWER', permissions: ['notifications.send'] }),
      ),
    ).toBe(true);
  });

  it('gates CRITICAL by permission key', () => {
    expect(
      canSendPriority(
        user({ roleName: 'ORG_ADMIN', permissions: ['notifications.send.high'] }),
        'CRITICAL',
      ),
    ).toBe(false);
    expect(
      canSendPriority(
        user({ roleName: 'VIEWER', permissions: ['notifications.send.critical'] }),
        'CRITICAL',
      ),
    ).toBe(true);
    expect(canSendPriority(user({ roleName: 'SUPER_ADMIN', permissions: [] }), 'CRITICAL')).toBe(
      true,
    );
  });
});
