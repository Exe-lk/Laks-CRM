/*
  Warnings:

  - A unique constraint covering the columns `[locum_id,month,year]` on the table `timesheets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "locum_profiles" ADD COLUMN     "auto_send_payslips" BOOLEAN DEFAULT false,
ADD COLUMN     "last_payslip_sent_at" TIMESTAMP(3),
ADD COLUMN     "payslip_day_of_month" INTEGER,
ADD COLUMN     "payslip_day_of_week" INTEGER,
ADD COLUMN     "payslip_frequency" TEXT;

-- AlterTable
ALTER TABLE "practices" ADD COLUMN     "auto_send_invoices" BOOLEAN DEFAULT false,
ADD COLUMN     "invoice_day_of_month" INTEGER,
ADD COLUMN     "invoice_day_of_week" INTEGER,
ADD COLUMN     "invoice_frequency" TEXT,
ADD COLUMN     "last_invoice_sent_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "payslips" (
    "id" TEXT NOT NULL,
    "payslip_number" TEXT NOT NULL,
    "locum_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "payslip_date" TIMESTAMP(3) NOT NULL,
    "gross_pay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION DEFAULT 0,
    "net_pay" DOUBLE PRECISION NOT NULL,
    "total_hours" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_line_items" (
    "id" TEXT NOT NULL,
    "payslip_id" TEXT NOT NULL,
    "timesheet_job_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "hourly_rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslip_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_penalties" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "cancelled_by" TEXT NOT NULL,
    "cancelled_party_id" TEXT NOT NULL,
    "cancelled_party_name" TEXT NOT NULL,
    "cancelled_party_type" TEXT NOT NULL,
    "appointment_start_time" TIMESTAMP(3) NOT NULL,
    "cancellation_time" TIMESTAMP(3) NOT NULL,
    "hours_before_appointment" DOUBLE PRECISION NOT NULL,
    "penalty_hours" DOUBLE PRECISION NOT NULL,
    "hourly_rate" DOUBLE PRECISION NOT NULL,
    "penalty_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "charged_at" TIMESTAMP(3),
    "charged_by" TEXT,
    "dismissed_at" TIMESTAMP(3),
    "dismissed_by" TEXT,
    "dismissal_reason" TEXT,
    "stripe_charge_id" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_penalties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payslips_payslip_number_key" ON "payslips"("payslip_number");

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_locum_id_month_year_key" ON "timesheets"("locum_id", "month", "year");

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_locum_id_fkey" FOREIGN KEY ("locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_line_items" ADD CONSTRAINT "payslip_line_items_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
