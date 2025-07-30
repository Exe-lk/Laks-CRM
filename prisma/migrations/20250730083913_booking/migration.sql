/*
  Warnings:

  - You are about to drop the column `booking_time` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `booking_end_time` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `booking_start_time` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "booking_time",
ADD COLUMN     "booking_end_time" TEXT NOT NULL,
ADD COLUMN     "booking_start_time" TEXT NOT NULL;
