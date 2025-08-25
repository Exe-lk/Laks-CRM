/*
  Warnings:

  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `booking_id` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `bookingUniqueid` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Booking` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_pkey",
DROP COLUMN "booking_id",
ADD COLUMN     "bookingUniqueid" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("id");
