-- CreateTable
CREATE TABLE "ignored_appointments" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "locum_id" TEXT NOT NULL,
    "ignored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ignored_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ignored_appointments_request_id_locum_id_key" ON "ignored_appointments"("request_id", "locum_id");

-- AddForeignKey
ALTER TABLE "ignored_appointments" ADD CONSTRAINT "ignored_appointments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "appointment_requests"("request_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ignored_appointments" ADD CONSTRAINT "ignored_appointments_locum_id_fkey" FOREIGN KEY ("locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
