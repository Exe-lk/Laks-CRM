-- AlterTable
ALTER TABLE "timesheet_jobs" ADD COLUMN IF NOT EXISTS "show_rating_remark" BOOLEAN DEFAULT true;

