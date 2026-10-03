jest.mock('./notifications.service', () => ({
  NotificationsService: class NotificationsService {},
}));

import { DomainNotificationPublisher } from './domain-notification.publisher';

describe('DomainNotificationPublisher', () => {
  it('skips when org has no users', async () => {
    const prisma = { user: { findMany: jest.fn().mockResolvedValue([]) } };
    const notifications = { createSystemNotification: jest.fn() };
    const publisher = new DomainNotificationPublisher(prisma as never, notifications as never);
    await publisher.notifyOrgUsers({
      organizationId: 'org1',
      title: 't',
      body: 'b',
    });
    expect(notifications.createSystemNotification).not.toHaveBeenCalled();
  });

  it('fans out to org users', async () => {
    const prisma = {
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]) },
    };
    const notifications = {
      createSystemNotification: jest.fn().mockResolvedValue({ id: 'n1', recipientCount: 2 }),
    };
    const publisher = new DomainNotificationPublisher(prisma as never, notifications as never);
    await publisher.notifyOrgUsers({
      organizationId: 'org1',
      title: 't',
      body: 'b',
      priority: 'HIGH',
    });
    expect(notifications.createSystemNotification).toHaveBeenCalledWith({
      organizationId: 'org1',
      userIds: ['u1', 'u2'],
      title: 't',
      body: 'b',
      priority: 'HIGH',
    });
  });
});
