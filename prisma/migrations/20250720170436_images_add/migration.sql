/*
  Warnings:

  - You are about to drop the column `reference_number` on the `locum_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "locum_profiles" DROP COLUMN "reference_number",
ADD COLUMN     "NIUTRnumber" TEXT,
ADD COLUMN     "bankDetails" TEXT,
ADD COLUMN     "reference_number1" TEXT,
ADD COLUMN     "reference_number2" TEXT,
ADD COLUMN     "shareCode" TEXT,
ALTER COLUMN "gdc_number" DROP NOT NULL,
ALTER COLUMN "software" DROP NOT NULL;
