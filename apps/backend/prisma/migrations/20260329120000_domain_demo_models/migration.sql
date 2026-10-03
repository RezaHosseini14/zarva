-- AlterTable
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "balanceLabel" TEXT NOT NULL DEFAULT '۰';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "lastTxnLabel" TEXT NOT NULL DEFAULT '—';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "totalLabel" TEXT NOT NULL DEFAULT '—';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "partyStatus" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "SaleInvoice" ADD COLUMN IF NOT EXISTS "seller" TEXT NOT NULL DEFAULT '—';
ALTER TABLE "SaleInvoice" ADD COLUMN IF NOT EXISTS "displayDate" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SaleInvoice" ADD COLUMN IF NOT EXISTS "amountLabel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SaleInvoice" ADD COLUMN IF NOT EXISTS "shopName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SaleInvoice" ADD COLUMN IF NOT EXISTS "shopAddress" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SaleInvoice" ADD COLUMN IF NOT EXISTS "shopPhone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SaleInvoice" ADD COLUMN IF NOT EXISTS "shopGuildId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SaleInvoice" ADD COLUMN IF NOT EXISTS "totalsJson" JSONB;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PurchasePaymentStatus" AS ENUM ('unpaid', 'partial', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InventoryItemStatus" AS ENUM ('available', 'reserved', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InventoryItemKind" AS ENUM ('gold', 'jewelry', 'coin', 'raw');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SaleInvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "purity" TEXT NOT NULL,
    "dailyRate" TEXT NOT NULL,
    "goldValue" TEXT NOT NULL,
    "wage" TEXT NOT NULL,
    "profit" TEXT NOT NULL,
    "tax" TEXT NOT NULL,
    "lineTotal" TEXT NOT NULL,
    CONSTRAINT "SaleInvoiceLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "balanceLabel" TEXT NOT NULL DEFAULT '۰',
    "lastTxnLabel" TEXT NOT NULL DEFAULT '—',
    "totalLabel" TEXT NOT NULL DEFAULT '—',
    "partyStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Purchase" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "displayDate" TEXT NOT NULL DEFAULT '',
    "goldWeightGrams" DECIMAL(12,3) NOT NULL,
    "amountLabel" TEXT NOT NULL,
    "paymentStatus" "PurchasePaymentStatus" NOT NULL DEFAULT 'unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InventoryItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "purity" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "valueLabel" TEXT NOT NULL,
    "status" "InventoryItemStatus" NOT NULL DEFAULT 'available',
    "kind" "InventoryItemKind" NOT NULL DEFAULT 'jewelry',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GoldTxn" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "displayDate" TEXT NOT NULL,
    "typeLabel" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "purity" TEXT NOT NULL,
    "fineGold" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoldTxn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WorkshopOrder" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "artisan" TEXT NOT NULL,
    "dueLabel" TEXT NOT NULL,
    "statusLabel" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkshopOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LedgerEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "displayDate" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "debitLabel" TEXT NOT NULL DEFAULT '—',
    "creditLabel" TEXT NOT NULL DEFAULT '—',
    "balanceLabel" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- Indexes / FKs (idempotent-ish)
CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_organizationId_phone_key" ON "Supplier"("organizationId", "phone");
CREATE INDEX IF NOT EXISTS "Supplier_organizationId_idx" ON "Supplier"("organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_organizationId_number_key" ON "Purchase"("organizationId", "number");
CREATE INDEX IF NOT EXISTS "Purchase_organizationId_idx" ON "Purchase"("organizationId");
CREATE INDEX IF NOT EXISTS "Purchase_supplierId_idx" ON "Purchase"("supplierId");
CREATE UNIQUE INDEX IF NOT EXISTS "InventoryItem_organizationId_sku_key" ON "InventoryItem"("organizationId", "sku");
CREATE INDEX IF NOT EXISTS "InventoryItem_organizationId_idx" ON "InventoryItem"("organizationId");
CREATE INDEX IF NOT EXISTS "GoldTxn_organizationId_idx" ON "GoldTxn"("organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS "WorkshopOrder_organizationId_orderNumber_key" ON "WorkshopOrder"("organizationId", "orderNumber");
CREATE INDEX IF NOT EXISTS "WorkshopOrder_organizationId_idx" ON "WorkshopOrder"("organizationId");
CREATE INDEX IF NOT EXISTS "LedgerEntry_organizationId_idx" ON "LedgerEntry"("organizationId");
CREATE INDEX IF NOT EXISTS "SaleInvoiceLine_invoiceId_idx" ON "SaleInvoiceLine"("invoiceId");

DO $$ BEGIN
  ALTER TABLE "SaleInvoiceLine" ADD CONSTRAINT "SaleInvoiceLine_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "SaleInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey"
    FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "GoldTxn" ADD CONSTRAINT "GoldTxn_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "WorkshopOrder" ADD CONSTRAINT "WorkshopOrder_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "WorkshopOrder" ADD CONSTRAINT "WorkshopOrder_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
