/*
  Warnings:

  - You are about to drop the column `name` on the `locum_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `locum_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "locum_profiles" DROP COLUMN "name",
DROP COLUMN "password";

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "locum_id" TEXT NOT NULL,
    "number_of_years" INTEGER NOT NULL,
    "speciality" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_locum_id_fkey" FOREIGN KEY ("locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
