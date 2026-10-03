-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE "Subscription" ADD COLUMN "currentPeriodStart" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SubscriptionAlert" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionAlert_organizationId_idx" ON "SubscriptionAlert"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionAlert_organizationId_kind_periodEnd_key" ON "SubscriptionAlert"("organizationId", "kind", "periodEnd");
