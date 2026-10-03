-- AlterTable: add phone/address (nullable first for backfill)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT;

UPDATE "User" SET "phone" = '09120000001', "address" = 'تهران، خیابان ولیعصر' WHERE "email" = 'admin@zarva.dev';
UPDATE "User" SET "phone" = '09120000002', "address" = 'تهران، خیابان ولیعصر' WHERE "email" = 'cashier@zarva.dev';
UPDATE "User"
SET
  "phone" = '0900' || SUBSTRING(REPLACE("id", '-', ''), 1, 7),
  "address" = COALESCE(NULLIF("address", ''), '—')
WHERE "phone" IS NULL;

ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "address" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");

CREATE TYPE "SaleInvoiceStatus" AS ENUM ('draft', 'confirmed', 'ready', 'completed', 'void');
CREATE TYPE "SalePaymentStatus" AS ENUM ('unpaid', 'partial', 'paid');

CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "nationalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SaleInvoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "SaleInvoiceStatus" NOT NULL DEFAULT 'draft',
    "paymentStatus" "SalePaymentStatus" NOT NULL DEFAULT 'unpaid',
    "goldWeightGrams" DECIMAL(12,3) NOT NULL,
    "amountIRT" DECIMAL(18,0) NOT NULL,
    "remainingIRT" DECIMAL(18,0) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleInvoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Customer_organizationId_phone_key" ON "Customer"("organizationId", "phone");
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");
CREATE UNIQUE INDEX "SaleInvoice_organizationId_number_key" ON "SaleInvoice"("organizationId", "number");
CREATE INDEX "SaleInvoice_organizationId_idx" ON "SaleInvoice"("organizationId");
CREATE INDEX "SaleInvoice_customerId_idx" ON "SaleInvoice"("customerId");

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SaleInvoice" ADD CONSTRAINT "SaleInvoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SaleInvoice" ADD CONSTRAINT "SaleInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
