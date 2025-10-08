/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `branches` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "timesheets" (
    "id" TEXT NOT NULL,
    "locum_id" TEXT NOT NULL,
    "practice_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "week_start_date" TIMESTAMP(3) NOT NULL,
    "week_end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_hours" DOUBLE PRECISION,
    "total_pay" DOUBLE PRECISION,
    "hourly_rate" DOUBLE PRECISION,
    "created_by" TEXT NOT NULL,
    "staff_signature" TEXT,
    "staff_signature_date" TIMESTAMP(3),
    "manager_signature" TEXT,
    "manager_signature_date" TIMESTAMP(3),
    "manager_id" TEXT,
    "submitted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_entries" (
    "id" TEXT NOT NULL,
    "timesheet_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clock_in_time" TIMESTAMP(3),
    "clock_out_time" TIMESTAMP(3),
    "lunch_start_time" TIMESTAMP(3),
    "lunch_end_time" TIMESTAMP(3),
    "total_hours" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_locum_id_week_start_date_branch_id_key" ON "timesheets"("locum_id", "week_start_date", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_email_key" ON "branches"("email");

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_locum_id_fkey" FOREIGN KEY ("locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_timesheet_id_fkey" FOREIGN KEY ("timesheet_id") REFERENCES "timesheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
