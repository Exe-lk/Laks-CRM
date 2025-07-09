/*
  Warnings:

  - A unique constraint covering the columns `[contact_number]` on the table `locum_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "locum_profiles_contact_number_key" ON "locum_profiles"("contact_number");
