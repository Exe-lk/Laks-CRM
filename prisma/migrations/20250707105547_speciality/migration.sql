/*
  Warnings:

  - Changed the type of `speciality` on the `specialties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "specialties" DROP COLUMN "speciality",
ADD COLUMN     "speciality" INTEGER NOT NULL;
