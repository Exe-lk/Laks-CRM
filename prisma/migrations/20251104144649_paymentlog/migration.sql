-- CreateTable
CREATE TABLE "penalty_payment_logs" (
    "id" TEXT NOT NULL,
    "penalty_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "stripe_charge_id" TEXT,
    "stripe_payment_intent" TEXT,
    "performed_by" TEXT NOT NULL,
    "performed_by_name" TEXT,
    "notes" TEXT,
    "error_message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penalty_payment_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "penalty_payment_logs" ADD CONSTRAINT "penalty_payment_logs_penalty_id_fkey" FOREIGN KEY ("penalty_id") REFERENCES "cancellation_penalties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
