-- Move signatures and status from Timesheet to TimesheetJob
-- This allows each job to be independently signed and approved by its own manager

-- Add new columns to timesheet_jobs
ALTER TABLE "timesheet_jobs" 
  ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "locum_signature" TEXT,
  ADD COLUMN IF NOT EXISTS "locum_signature_date" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "manager_signature" TEXT,
  ADD COLUMN IF NOT EXISTS "manager_signature_date" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "manager_id" TEXT,
  ADD COLUMN IF NOT EXISTS "submitted_at" TIMESTAMP;

-- Migrate existing data: copy status and signatures from timesheet to all its jobs
-- Only migrate if the timesheet has signatures/status
UPDATE "timesheet_jobs" tj
SET 
  "status" = COALESCE(t."status", 'DRAFT'),
  "locum_signature" = t."staff_signature",
  "locum_signature_date" = t."staff_signature_date",
  "manager_signature" = t."manager_signature",
  "manager_signature_date" = t."manager_signature_date",
  "manager_id" = t."manager_id",
  "submitted_at" = t."submitted_at"
FROM "timesheets" t
WHERE tj."timesheet_id" = t."id"
  AND (
    t."status" IS NOT NULL 
    OR t."staff_signature" IS NOT NULL 
    OR t."manager_signature" IS NOT NULL
  );

-- Remove columns from timesheets table
ALTER TABLE "timesheets"
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "staff_signature",
  DROP COLUMN IF EXISTS "staff_signature_date",
  DROP COLUMN IF EXISTS "manager_signature",
  DROP COLUMN IF EXISTS "manager_signature_date",
  DROP COLUMN IF EXISTS "manager_id",
  DROP COLUMN IF EXISTS "submitted_at";

