/*
  Warnings:

  - Added the required column `status` to the `Practice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Practice" ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;
