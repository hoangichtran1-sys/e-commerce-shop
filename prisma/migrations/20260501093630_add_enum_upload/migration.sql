/*
  Warnings:

  - Added the required column `refType` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('BILLBOARD', 'PRODUCT');

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "refType" "UploadType" NOT NULL;

-- CreateIndex
CREATE INDEX "Upload_refType_idx" ON "Upload"("refType");
