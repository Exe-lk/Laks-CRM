/*
  Warnings:

  - You are about to drop the column `branch_id` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `hourly_rate` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `practice_id` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `week_end_date` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `week_start_date` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the `timesheet_entries` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[locum_id,month,year]` on the table `timesheets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `month` to the `timesheets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `timesheets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "timesheet_entries" DROP CONSTRAINT "timesheet_entries_timesheet_id_fkey";

-- DropForeignKey
ALTER TABLE "timesheets" DROP CONSTRAINT "timesheets_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "timesheets" DROP CONSTRAINT "timesheets_practice_id_fkey";

-- DropIndex
DROP INDEX "timesheets_locum_id_week_start_date_branch_id_key";

-- AlterTable
ALTER TABLE "appointment_requests" ADD COLUMN     "branch_id" TEXT;

-- AlterTable
ALTER TABLE "timesheets" DROP COLUMN "branch_id",
DROP COLUMN "created_by",
DROP COLUMN "hourly_rate",
DROP COLUMN "practice_id",
DROP COLUMN "week_end_date",
DROP COLUMN "week_start_date",
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- DropTable
DROP TABLE "timesheet_entries";

-- CreateTable
CREATE TABLE "timesheet_jobs" (
    "id" TEXT NOT NULL,
    "timesheet_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "practice_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "job_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "lunch_start_time" TIMESTAMP(3),
    "lunch_end_time" TIMESTAMP(3),
    "total_hours" DOUBLE PRECISION,
    "hourly_rate" DOUBLE PRECISION,
    "total_pay" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_locum_id_month_year_key" ON "timesheets"("locum_id", "month", "year");

-- AddForeignKey
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_jobs" ADD CONSTRAINT "timesheet_jobs_timesheet_id_fkey" FOREIGN KEY ("timesheet_id") REFERENCES "timesheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_jobs" ADD CONSTRAINT "timesheet_jobs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_jobs" ADD CONSTRAINT "timesheet_jobs_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_jobs" ADD CONSTRAINT "timesheet_jobs_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
