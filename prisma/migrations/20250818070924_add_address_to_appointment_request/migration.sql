/*
  Warnings:

  - Added the required column `address` to the `appointment_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointment_requests" ADD COLUMN     "address" TEXT NOT NULL;
