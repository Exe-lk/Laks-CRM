/*
  Warnings:

  - You are about to drop the `fcm_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[locum_id,month,year]` on the table `timesheets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_locum_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_practice_id_fkey";

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "deductions" DOUBLE PRECISION DEFAULT 0;

-- DropTable
DROP TABLE "fcm_tokens";

-- DropTable
DROP TABLE "notifications";

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_locum_id_month_year_key" ON "timesheets"("locum_id", "month", "year");

-- AddForeignKey
ALTER TABLE "payslip_line_items" ADD CONSTRAINT "payslip_line_items_timesheet_job_id_fkey" FOREIGN KEY ("timesheet_job_id") REFERENCES "timesheet_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
