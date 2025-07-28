/*
  Warnings:

  - You are about to drop the `Practice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Practice";

-- CreateTable
CREATE TABLE "practices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "GDCnumber" TEXT NOT NULL,
    "address" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "booking_id" TEXT NOT NULL,
    "locum_id" TEXT NOT NULL,
    "practice_id" TEXT NOT NULL,
    "booking_date" TIMESTAMP(3) NOT NULL,
    "booking_time" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "accept_time" TIMESTAMP(3),
    "cancel_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "practices_telephone_key" ON "practices"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "practices_email_key" ON "practices"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_locum_id_fkey" FOREIGN KEY ("locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
