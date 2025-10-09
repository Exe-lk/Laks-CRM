/*
  Warnings:

  - You are about to drop the `invoice_line_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice_line_items" DROP CONSTRAINT "invoice_line_items_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "invoice_line_items" DROP CONSTRAINT "invoice_line_items_timesheet_job_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_practice_id_fkey";

-- DropIndex
DROP INDEX "timesheets_locum_id_month_year_key";

-- DropTable
DROP TABLE "invoice_line_items";

-- DropTable
DROP TABLE "invoices";
