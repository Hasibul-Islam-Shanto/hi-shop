-- AlterTable
ALTER TABLE "orders"
  ADD COLUMN "shippingMethod" TEXT NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "courierName" TEXT,
  ADD COLUMN "trackingNumber" TEXT,
  ADD COLUMN "shippedAt" TIMESTAMP(3),
  ADD COLUMN "deliveredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
