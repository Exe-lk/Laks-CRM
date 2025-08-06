/*
  Warnings:

  - You are about to drop the column `response_message` on the `appointment_responses` table. All the data in the column will be lost.
  - Added the required column `required_role` to the `appointment_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointment_requests" ADD COLUMN     "required_role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "appointment_responses" DROP COLUMN "response_message";
