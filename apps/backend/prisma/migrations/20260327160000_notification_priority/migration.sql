-- AlterEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "NotificationRecipient" ADD COLUMN "acknowledgedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_priority_idx" ON "Notification"("priority");

-- CreateIndex
CREATE INDEX "NotificationRecipient_userId_acknowledgedAt_idx" ON "NotificationRecipient"("userId", "acknowledgedAt");
