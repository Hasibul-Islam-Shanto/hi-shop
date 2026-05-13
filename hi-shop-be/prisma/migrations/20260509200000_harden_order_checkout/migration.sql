-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('ORDER_PLACED', 'ORDER_CANCELLED', 'ADMIN_ADJUSTMENT', 'RESTOCK', 'CORRECTION');

-- AlterTable
ALTER TABLE "orders"
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "subtotalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "shippingFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "shippingLabel" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingStreet" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingCity" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingState" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingPostalCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "shippingCountry" TEXT NOT NULL DEFAULT '';

-- Backfill old orders so the new subtotal mirrors their prior total.
UPDATE "orders"
SET "subtotalAmount" = "totalAmount"
WHERE "subtotalAmount" = 0;

-- CreateTable
CREATE TABLE "inventory_movements" (
  "id" TEXT NOT NULL,
  "productVariantId" TEXT NOT NULL,
  "orderId" TEXT,
  "type" "InventoryMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "stockBefore" INTEGER,
  "stockAfter" INTEGER,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_userId_idempotencyKey_key" ON "orders"("userId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "inventory_movements_productVariantId_idx" ON "inventory_movements"("productVariantId");

-- CreateIndex
CREATE INDEX "inventory_movements_orderId_idx" ON "inventory_movements"("orderId");

-- CreateIndex
CREATE INDEX "inventory_movements_type_idx" ON "inventory_movements"("type");

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
