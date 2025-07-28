/*
  Warnings:

  - You are about to drop the column `reference_number1` on the `locum_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "locum_profiles" DROP COLUMN "reference_number1",
ADD COLUMN     "referenceletter1" TEXT;
