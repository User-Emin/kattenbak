-- AlterTable
ALTER TABLE "products" ADD COLUMN "is_pre_order" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "pre_order_discount" DECIMAL(5,2);
ALTER TABLE "products" ADD COLUMN "release_date" TIMESTAMP(3);
