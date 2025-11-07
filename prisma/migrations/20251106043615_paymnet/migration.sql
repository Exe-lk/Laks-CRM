/*
  Warnings:

  - You are about to drop the `payment_cards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "payment_cards" DROP CONSTRAINT "payment_cards_practice_id_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "completed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "payment_mode" TEXT DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "locum_profiles" ADD COLUMN     "payment_mode" TEXT DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "practices" ADD COLUMN     "payment_mode" TEXT DEFAULT 'MANUAL';

-- DropTable
DROP TABLE "payment_cards";

-- CreateTable
CREATE TABLE "locum_stripe_customers" (
    "id" TEXT NOT NULL,
    "locum_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locum_stripe_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_stripe_customers" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_stripe_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_payments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "timesheet_job_id" TEXT NOT NULL,
    "practice_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "stripe_charge_id" TEXT,
    "stripe_payment_intent" TEXT,
    "payment_status" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "charged_at" TIMESTAMP(3),
    "charged_by" TEXT,
    "error_message" TEXT,
    "metadata" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locum_stripe_customers_locum_id_key" ON "locum_stripe_customers"("locum_id");

-- CreateIndex
CREATE UNIQUE INDEX "locum_stripe_customers_stripe_customer_id_key" ON "locum_stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_stripe_customers_branch_id_key" ON "branch_stripe_customers"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "branch_stripe_customers_stripe_customer_id_key" ON "branch_stripe_customers"("stripe_customer_id");

-- AddForeignKey
ALTER TABLE "locum_stripe_customers" ADD CONSTRAINT "locum_stripe_customers_locum_id_fkey" FOREIGN KEY ("locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_stripe_customers" ADD CONSTRAINT "branch_stripe_customers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
