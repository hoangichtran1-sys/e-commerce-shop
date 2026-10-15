/*
  Warnings:

  - You are about to drop the column `isPaid` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `colorId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `inStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isGlobal` on the `Promotion` table. All the data in the column will be lost.
  - You are about to alter the column `minOrderValue` on the `Promotion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `maxDiscountValue` on the `Promotion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `comment` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Color` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Size` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[storeId,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,code]` on the table `Coupon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,orderCode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderCode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productVariantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mode` to the `Promotion` table without a default value. This is not possible if the table is not empty.
  - Made the column `startAt` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endAt` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `slug` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('COLOR', 'SIZE', 'MATERIAL');

-- CreateEnum
CREATE TYPE "PromotionMode" AS ENUM ('COUPON', 'CATEGORY_CAMPAIGN');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "ReviewReportReason" AS ENUM ('SPAM', 'OFFENSIVE', 'FAKE_REVIEW', 'MISLEADING', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PENDING';
ALTER TYPE "OrderStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "OrderStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERED';
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
ALTER TYPE "UploadType" ADD VALUE 'STORE';

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_billboardId_fkey";

-- DropForeignKey
ALTER TABLE "Color" DROP CONSTRAINT "Color_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Color" DROP CONSTRAINT "Color_storeId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_colorId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "Size" DROP CONSTRAINT "Size_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Size" DROP CONSTRAINT "Size_storeId_fkey";

-- DropIndex
DROP INDEX "Billboard_storeId_idx";

-- DropIndex
DROP INDEX "Category_billboardId_idx";

-- DropIndex
DROP INDEX "Category_storeId_idx";

-- DropIndex
DROP INDEX "Coupon_code_key";

-- DropIndex
DROP INDEX "Coupon_storeId_code_idx";

-- DropIndex
DROP INDEX "Order_storeId_isPaid_idx";

-- DropIndex
DROP INDEX "OrderItem_productId_idx";

-- DropIndex
DROP INDEX "Product_storeId_categoryId_idx";

-- DropIndex
DROP INDEX "Product_storeId_isArchived_idx";

-- DropIndex
DROP INDEX "Product_storeId_isFeatured_idx";

-- DropIndex
DROP INDEX "Promotion_storeId_isActive_idx";

-- DropIndex
DROP INDEX "Promotion_storeId_isGlobal_idx";

-- DropIndex
DROP INDEX "Promotion_storeId_startAt_endAt_idx";

-- DropIndex
DROP INDEX "Review_storeId_productId_idx";

-- DropIndex
DROP INDEX "Review_storeId_rating_idx";

-- AlterTable
ALTER TABLE "Billboard" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "billboardId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "perUserLimit" INTEGER DEFAULT 1,
ALTER COLUMN "usageLimit" DROP NOT NULL,
ALTER COLUMN "usageLimit" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "isPaid",
ADD COLUMN     "amountPaid" DECIMAL(65,30),
ADD COLUMN     "country" TEXT,
ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN     "discountSnapshot" JSONB,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "orderCode" TEXT NOT NULL,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "status" "OrderStatus" NOT NULL,
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productId",
ADD COLUMN     "finalPrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "originalPrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "productVariantId" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "colorId",
DROP COLUMN "inStock",
DROP COLUMN "isArchived",
DROP COLUMN "price",
DROP COLUMN "sizeId",
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "minPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "ratingSum" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "searchableAttributes" TEXT[],
ADD COLUMN     "soldCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "ProductStatus" NOT NULL,
ADD COLUMN     "trendingScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "isGlobal",
ADD COLUMN     "mode" "PromotionMode" NOT NULL,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "startAt" SET NOT NULL,
ALTER COLUMN "endAt" SET NOT NULL,
ALTER COLUMN "minOrderValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "maxDiscountValue" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "comment",
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "rating" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT;

-- DropTable
DROP TABLE "Color";

-- DropTable
DROP TABLE "Size";

-- CreateTable
CREATE TABLE "Attribute" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "combination" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReport" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReviewReportReason" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attribute_storeId_type_idx" ON "Attribute"("storeId", "type");

-- CreateIndex
CREATE INDEX "AttributeValue_attributeId_idx" ON "AttributeValue"("attributeId");

-- CreateIndex
CREATE INDEX "ProductVariant_storeId_productId_idx" ON "ProductVariant"("storeId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_storeId_sku_key" ON "ProductVariant"("storeId", "sku");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_productId_idx" ON "Favorite"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON "Favorite"("userId", "productId");

-- CreateIndex
CREATE INDEX "ReviewReaction_userId_idx" ON "ReviewReaction"("userId");

-- CreateIndex
CREATE INDEX "ReviewReaction_reviewId_idx" ON "ReviewReaction"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReaction_userId_reviewId_key" ON "ReviewReaction"("userId", "reviewId");

-- CreateIndex
CREATE INDEX "ReviewReport_userId_idx" ON "ReviewReport"("userId");

-- CreateIndex
CREATE INDEX "ReviewReport_reviewId_idx" ON "ReviewReport"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReport_reviewId_userId_key" ON "ReviewReport"("reviewId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_userId_key" ON "StripeCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_stripeCustomerId_key" ON "StripeCustomer"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Billboard_storeId_isGlobal_isActive_priority_idx" ON "Billboard"("storeId", "isGlobal", "isActive", "priority");

-- CreateIndex
CREATE INDEX "Category_storeId_parentId_idx" ON "Category"("storeId", "parentId");

-- CreateIndex
CREATE INDEX "Category_storeId_billboardId_idx" ON "Category"("storeId", "billboardId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_slug_key" ON "Category"("storeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_storeId_code_key" ON "Coupon"("storeId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_transactionId_key" ON "Order"("transactionId");

-- CreateIndex
CREATE INDEX "Order_storeId_status_idx" ON "Order"("storeId", "status");

-- CreateIndex
CREATE INDEX "Order_couponId_userId_status_idx" ON "Order"("couponId", "userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_storeId_orderCode_key" ON "Order"("storeId", "orderCode");

-- CreateIndex
CREATE INDEX "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");

-- CreateIndex
CREATE INDEX "Product_storeId_status_categoryId_isFeatured_idx" ON "Product"("storeId", "status", "categoryId", "isFeatured");

-- CreateIndex
CREATE INDEX "Product_storeId_status_minPrice_idx" ON "Product"("storeId", "status", "minPrice");

-- CreateIndex
CREATE INDEX "Product_storeId_status_maxPrice_idx" ON "Product"("storeId", "status", "maxPrice");

-- CreateIndex
CREATE INDEX "Product_searchableAttributes_idx" ON "Product" USING GIN ("searchableAttributes");

-- CreateIndex
CREATE INDEX "Promotion_storeId_isActive_startAt_endAt_priority_idx" ON "Promotion"("storeId", "isActive", "startAt", "endAt", "priority");

-- CreateIndex
CREATE INDEX "Promotion_storeId_mode_idx" ON "Promotion"("storeId", "mode");

-- CreateIndex
CREATE INDEX "Review_storeId_productId_rating_idx" ON "Review"("storeId", "productId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "Billboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeValue" ADD CONSTRAINT "AttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReaction" ADD CONSTRAINT "ReviewReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReaction" ADD CONSTRAINT "ReviewReaction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeCustomer" ADD CONSTRAINT "StripeCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
