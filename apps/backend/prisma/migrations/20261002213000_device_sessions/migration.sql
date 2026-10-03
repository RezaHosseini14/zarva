-- AlterTable
ALTER TABLE "RefreshSession" ADD COLUMN     "clientDeviceId" TEXT,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "RefreshSession_userId_revokedAt_idx" ON "RefreshSession"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "RefreshSession_userId_clientDeviceId_idx" ON "RefreshSession"("userId", "clientDeviceId");

-- CreateIndex
CREATE INDEX "RefreshSession_clientDeviceId_idx" ON "RefreshSession"("clientDeviceId");

-- CreateEnum
CREATE TYPE "DeviceBanScope" AS ENUM ('user', 'global');

-- CreateTable
CREATE TABLE "AuthLoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "familyId" TEXT,
    "clientDeviceId" TEXT,
    "deviceName" TEXT,
    "deviceType" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "endReason" TEXT,

    CONSTRAINT "AuthLoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceBan" (
    "id" TEXT NOT NULL,
    "clientDeviceId" TEXT NOT NULL,
    "scope" "DeviceBanScope" NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "reason" TEXT,
    "bannedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liftedAt" TIMESTAMP(3),
    "liftedById" TEXT,

    CONSTRAINT "DeviceBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthLoginEvent_userId_createdAt_idx" ON "AuthLoginEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthLoginEvent_organizationId_createdAt_idx" ON "AuthLoginEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthLoginEvent_clientDeviceId_idx" ON "AuthLoginEvent"("clientDeviceId");

-- CreateIndex
CREATE INDEX "AuthLoginEvent_familyId_idx" ON "AuthLoginEvent"("familyId");

-- CreateIndex
CREATE INDEX "DeviceBan_clientDeviceId_liftedAt_idx" ON "DeviceBan"("clientDeviceId", "liftedAt");

-- CreateIndex
CREATE INDEX "DeviceBan_userId_clientDeviceId_liftedAt_idx" ON "DeviceBan"("userId", "clientDeviceId", "liftedAt");

-- CreateIndex
CREATE INDEX "DeviceBan_scope_liftedAt_idx" ON "DeviceBan"("scope", "liftedAt");

-- AddForeignKey
ALTER TABLE "AuthLoginEvent" ADD CONSTRAINT "AuthLoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthLoginEvent" ADD CONSTRAINT "AuthLoginEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceBan" ADD CONSTRAINT "DeviceBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceBan" ADD CONSTRAINT "DeviceBan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceBan" ADD CONSTRAINT "DeviceBan_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceBan" ADD CONSTRAINT "DeviceBan_liftedById_fkey" FOREIGN KEY ("liftedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "type" TEXT,
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
