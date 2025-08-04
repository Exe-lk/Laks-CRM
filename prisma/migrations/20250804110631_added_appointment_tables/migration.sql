/*
  Warnings:

  - A unique constraint covering the columns `[request_id]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `request_id` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "request_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "appointment_requests" (
    "request_id" TEXT NOT NULL,
    "practice_id" TEXT NOT NULL,
    "request_date" TIMESTAMP(3) NOT NULL,
    "request_start_time" TEXT NOT NULL,
    "request_end_time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "appointment_responses" (
    "response_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "locum_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "response_message" TEXT,
    "responded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_responses_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "appointment_confirmations" (
    "confirmation_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "chosen_locum_id" TEXT NOT NULL,
    "practice_confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locum_confirmed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PRACTICE_CONFIRMED',
    "rejection_reason" TEXT,
    "confirmation_number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_confirmations_pkey" PRIMARY KEY ("confirmation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_responses_request_id_locum_id_key" ON "appointment_responses"("request_id", "locum_id");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_request_id_key" ON "Booking"("request_id");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "appointment_requests"("request_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_responses" ADD CONSTRAINT "appointment_responses_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "appointment_requests"("request_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_responses" ADD CONSTRAINT "appointment_responses_locum_id_fkey" FOREIGN KEY ("locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_confirmations" ADD CONSTRAINT "appointment_confirmations_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "appointment_requests"("request_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_confirmations" ADD CONSTRAINT "appointment_confirmations_chosen_locum_id_fkey" FOREIGN KEY ("chosen_locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
