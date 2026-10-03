-- AlterTable Branch
ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "code" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Branch" SET "code" = 'BR-' || SUBSTRING(REPLACE("id"::text, '-', ''), 1, 8) WHERE "code" = '';

CREATE UNIQUE INDEX IF NOT EXISTS "Branch_organizationId_code_key" ON "Branch"("organizationId", "code");

-- PasswordResetToken
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

DO $$ BEGIN
  ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Commerce enums + tables
DO $$ BEGIN
  CREATE TYPE "CommerceChannelType" AS ENUM ('storefront', 'whatsapp', 'instagram', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "CommerceChannelStatus" AS ENUM ('draft', 'active', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "CommerceChannel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CommerceChannelType" NOT NULL DEFAULT 'other',
    "status" "CommerceChannelStatus" NOT NULL DEFAULT 'draft',
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommerceChannel_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CommerceChannel_organizationId_idx" ON "CommerceChannel"("organizationId");
DO $$ BEGIN
  ALTER TABLE "CommerceChannel" ADD CONSTRAINT "CommerceChannel_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "CommerceListing" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "externalSku" TEXT NOT NULL DEFAULT '',
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommerceListing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CommerceListing_channelId_inventoryItemId_key" ON "CommerceListing"("channelId", "inventoryItemId");
CREATE INDEX IF NOT EXISTS "CommerceListing_channelId_idx" ON "CommerceListing"("channelId");
CREATE INDEX IF NOT EXISTS "CommerceListing_inventoryItemId_idx" ON "CommerceListing"("inventoryItemId");
DO $$ BEGIN
  ALTER TABLE "CommerceListing" ADD CONSTRAINT "CommerceListing_channelId_fkey"
    FOREIGN KEY ("channelId") REFERENCES "CommerceChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "CommerceListing" ADD CONSTRAINT "CommerceListing_inventoryItemId_fkey"
    FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tax
DO $$ BEGIN CREATE TYPE "TaxPeriodStatus" AS ENUM ('open', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TaxFilingStatus" AS ENUM ('draft', 'ready', 'exported', 'submitted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TaxFilingKind" AS ENUM ('vat', 'seasonal', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "TaxPeriod" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "status" "TaxPeriodStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxPeriod_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TaxPeriod_organizationId_idx" ON "TaxPeriod"("organizationId");
DO $$ BEGIN
  ALTER TABLE "TaxPeriod" ADD CONSTRAINT "TaxPeriod_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "TaxFiling" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "kind" "TaxFilingKind" NOT NULL DEFAULT 'vat',
    "status" "TaxFilingStatus" NOT NULL DEFAULT 'draft',
    "totals" JSONB NOT NULL,
    "exportedAt" TIMESTAMP(3),
    "artifact" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxFiling_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TaxFiling_periodId_idx" ON "TaxFiling"("periodId");
DO $$ BEGIN
  ALTER TABLE "TaxFiling" ADD CONSTRAINT "TaxFiling_periodId_fkey"
    FOREIGN KEY ("periodId") REFERENCES "TaxPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "TaxFilingLine" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "meta" JSONB,
    CONSTRAINT "TaxFilingLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TaxFilingLine_filingId_idx" ON "TaxFilingLine"("filingId");
DO $$ BEGIN
  ALTER TABLE "TaxFilingLine" ADD CONSTRAINT "TaxFilingLine_filingId_fkey"
    FOREIGN KEY ("filingId") REFERENCES "TaxFiling"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Jewelry
DO $$ BEGIN CREATE TYPE "JewelryPieceStatus" AS ENUM ('showcase', 'reserved', 'sold', 'workshop'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "JewelryPiece" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "status" "JewelryPieceStatus" NOT NULL DEFAULT 'showcase',
    "weight" TEXT NOT NULL DEFAULT '',
    "purity" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "inventoryItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JewelryPiece_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "JewelryPiece_organizationId_sku_key" ON "JewelryPiece"("organizationId", "sku");
CREATE INDEX IF NOT EXISTS "JewelryPiece_organizationId_idx" ON "JewelryPiece"("organizationId");
DO $$ BEGIN
  ALTER TABLE "JewelryPiece" ADD CONSTRAINT "JewelryPiece_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "JewelryPiece" ADD CONSTRAINT "JewelryPiece_inventoryItemId_fkey"
    FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "JewelryBomLine" (
    "id" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" TEXT NOT NULL DEFAULT '',
    "carat" TEXT NOT NULL DEFAULT '',
    "qty" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "JewelryBomLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "JewelryBomLine_pieceId_idx" ON "JewelryBomLine"("pieceId");
DO $$ BEGIN
  ALTER TABLE "JewelryBomLine" ADD CONSTRAINT "JewelryBomLine_pieceId_fkey"
    FOREIGN KEY ("pieceId") REFERENCES "JewelryPiece"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "JewelryReservation" (
    "id" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "customerId" TEXT,
    "reservedUntil" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JewelryReservation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "JewelryReservation_pieceId_idx" ON "JewelryReservation"("pieceId");
DO $$ BEGIN
  ALTER TABLE "JewelryReservation" ADD CONSTRAINT "JewelryReservation_pieceId_fkey"
    FOREIGN KEY ("pieceId") REFERENCES "JewelryPiece"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AI
DO $$ BEGIN CREATE TYPE "AiInsightSource" AS ENUM ('rules', 'llm'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AiInsightSeverity" AS ENUM ('info', 'warning', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "AiInsight" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "severity" "AiInsightSeverity" NOT NULL DEFAULT 'info',
    "source" "AiInsightSource" NOT NULL DEFAULT 'rules',
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedAt" TIMESTAMP(3),
    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AiInsight_organizationId_dismissedAt_idx" ON "AiInsight"("organizationId", "dismissedAt");
CREATE INDEX IF NOT EXISTS "AiInsight_organizationId_code_idx" ON "AiInsight"("organizationId", "code");
DO $$ BEGIN
  ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
