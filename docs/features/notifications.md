# notifications

In-app notifications for ZARVA Gold Business OS.

## Scope

- Org senders (`notifications.send` or ORG/PLATFORM/SUPER admin): audience `ORG_ALL` or selected `USERS` in their organization.
- Platform senders (`notifications.broadcast_platform`, `SUPER_ADMIN`, `PLATFORM_ADMIN`): `PLATFORM_ALL` or selected `ORGS`.
- Recipients are snapshotted at send time into `NotificationRecipient`.
- Real-time delivery via Socket.io namespace `/notifications` (`notification.created`).

## Routes

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/notifications` | Inbox (paginated) |
| GET | `/api/v1/notifications/unread-count` | Badge count |
| GET | `/api/v1/notifications/recipients/users` | Compose user picker |
| GET | `/api/v1/notifications/recipients/organizations` | Platform org picker |
| POST | `/api/v1/notifications` | Create + emit WS |
| PATCH | `/api/v1/notifications/read-all` | Mark all read |
| PATCH | `/api/v1/notifications/:id/read` | Mark one read |

## UI

- Header bell + unread badge + dropdown (recent items, mark all, view all).
- `/notifications` inbox + compose dialog for senders.
- Permissions seeded via `ALL_PERMISSION_KEYS` (`notifications.read`, `notifications.send`, `notifications.broadcast_platform`).
