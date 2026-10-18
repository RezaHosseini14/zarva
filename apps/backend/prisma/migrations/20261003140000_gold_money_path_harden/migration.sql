-- SaleInvoice checkout idempotency
ALTER TABLE "SaleInvoice" ADD COLUMN "clientRequestId" TEXT;
CREATE UNIQUE INDEX "SaleInvoice_organizationId_clientRequestId_key" ON "SaleInvoice"("organizationId", "clientRequestId");

-- Line discount
ALTER TABLE "SaleInvoiceLine" ADD COLUMN "discountIrt" DECIMAL(18,0) NOT NULL DEFAULT 0;

-- Purchase return partial grams
ALTER TABLE "PurchaseReturn" ADD COLUMN "grams" DECIMAL(12,3) NOT NULL DEFAULT 0;
ALTER TABLE "PurchaseReturn" ADD COLUMN "purityKarat" DECIMAL(5,2) NOT NULL DEFAULT 18;

-- Rate correction audit
CREATE TABLE "GoldRateCorrection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "businessDate" DATE NOT NULL,
    "prevBuyRateIrt" DECIMAL(18,0) NOT NULL,
    "prevSellRateIrt" DECIMAL(18,0) NOT NULL,
    "nextBuyRateIrt" DECIMAL(18,0) NOT NULL,
    "nextSellRateIrt" DECIMAL(18,0) NOT NULL,
    "reason" TEXT NOT NULL,
    "correctedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoldRateCorrection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GoldRateCorrection_organizationId_businessDate_idx" ON "GoldRateCorrection"("organizationId", "businessDate");
ALTER TABLE "GoldRateCorrection" ADD CONSTRAINT "GoldRateCorrection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Day close reopen fields
ALTER TABLE "DayClose" ADD COLUMN "reopenedAt" TIMESTAMP(3);
ALTER TABLE "DayClose" ADD COLUMN "reopenReason" TEXT;
