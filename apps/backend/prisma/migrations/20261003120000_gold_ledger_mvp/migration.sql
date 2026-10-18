-- CreateEnum
CREATE TYPE "SaleDocumentKind" AS ENUM ('sale', 'buyback');

-- AlterTable SaleInvoice
ALTER TABLE "SaleInvoice" ADD COLUMN "documentKind" "SaleDocumentKind" NOT NULL DEFAULT 'sale';
ALTER TABLE "SaleInvoice" ADD COLUMN "ledgerPostedAt" TIMESTAMP(3);

-- AlterTable SalePayment
ALTER TABLE "SalePayment" ADD COLUMN "amountIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;

-- AlterTable Purchase
ALTER TABLE "Purchase" ADD COLUMN "amountIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE "Purchase" ADD COLUMN "purityKarat" DECIMAL(5,2) NOT NULL DEFAULT 18;
ALTER TABLE "Purchase" ADD COLUMN "rateIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE "Purchase" ADD COLUMN "ledgerPostedAt" TIMESTAMP(3);

-- AlterTable PurchaseLine
ALTER TABLE "PurchaseLine" ADD COLUMN "weightGrams" DECIMAL(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "PurchaseLine" ADD COLUMN "purityKarat" DECIMAL(5,2) NOT NULL DEFAULT 18;

-- AlterTable SaleInvoiceLine
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "weightGrams" DECIMAL(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "purityKarat" DECIMAL(5,2) NOT NULL DEFAULT 18;
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "rateIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "goldValueIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "wageIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "profitIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "taxIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "lineTotalIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;

-- AlterTable GoldTxn
ALTER TABLE "GoldTxn" ADD COLUMN "grams" DECIMAL(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "GoldTxn" ADD COLUMN "fineGrams" DECIMAL(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "GoldTxn" ADD COLUMN "purityKarat" DECIMAL(5,2) NOT NULL DEFAULT 18;
ALTER TABLE "GoldTxn" ADD COLUMN "rateIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;
ALTER TABLE "GoldTxn" ADD COLUMN "direction" TEXT NOT NULL DEFAULT 'in';
ALTER TABLE "GoldTxn" ADD COLUMN "sourceType" TEXT;
ALTER TABLE "GoldTxn" ADD COLUMN "sourceId" TEXT;
ALTER TABLE "GoldTxn" ADD COLUMN "reason" TEXT NOT NULL DEFAULT '';

-- AlterTable GoldBalance
ALTER TABLE "GoldBalance" ADD COLUMN "purityKarat" DECIMAL(5,2) NOT NULL DEFAULT 18;
ALTER TABLE "GoldBalance" ADD COLUMN "grams" DECIMAL(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "GoldBalance" ADD COLUMN "fineGrams" DECIMAL(12,3) NOT NULL DEFAULT 0;

-- AlterTable GoldOrgRate
ALTER TABLE "GoldOrgRate" ADD COLUMN "buyRateIrt" DECIMAL(18,0);
ALTER TABLE "GoldOrgRate" ADD COLUMN "sellRateIrt" DECIMAL(18,0);
ALTER TABLE "GoldOrgRate" ADD COLUMN "businessDate" DATE;
ALTER TABLE "GoldOrgRate" ADD COLUMN "lockedAt" TIMESTAMP(3);

-- CreateTable DayClose
CREATE TABLE "DayClose" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "businessDate" DATE NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DayClose_pkey" PRIMARY KEY ("id")
);

-- Indexes / uniques
CREATE INDEX "SaleInvoice_organizationId_documentKind_status_idx" ON "SaleInvoice"("organizationId", "documentKind", "status");
CREATE INDEX "GoldTxn_organizationId_sourceType_sourceId_idx" ON "GoldTxn"("organizationId", "sourceType", "sourceId");
CREATE INDEX "GoldTxn_organizationId_createdAt_idx" ON "GoldTxn"("organizationId", "createdAt");
CREATE UNIQUE INDEX "GoldBalance_organizationId_partyName_purityKarat_key" ON "GoldBalance"("organizationId", "partyName", "purityKarat");
CREATE UNIQUE INDEX "GoldOrgRate_organizationId_businessDate_key" ON "GoldOrgRate"("organizationId", "businessDate");
CREATE UNIQUE INDEX "DayClose_organizationId_businessDate_key" ON "DayClose"("organizationId", "businessDate");
CREATE INDEX "DayClose_organizationId_idx" ON "DayClose"("organizationId");

ALTER TABLE "DayClose" ADD CONSTRAINT "DayClose_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
