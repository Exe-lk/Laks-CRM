/*
  Warnings:

  - You are about to drop the column `cancelled_party_id` on the `cancellation_penalties` table. All the data in the column will be lost.
  - You are about to drop the column `cancelled_party_name` on the `cancellation_penalties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cancellation_penalties" DROP COLUMN "cancelled_party_id",
DROP COLUMN "cancelled_party_name",
ADD COLUMN     "charged_locum_id" TEXT,
ADD COLUMN     "charged_practice_id" TEXT;

-- AddForeignKey
ALTER TABLE "cancellation_penalties" ADD CONSTRAINT "cancellation_penalties_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_penalties" ADD CONSTRAINT "cancellation_penalties_charged_locum_id_fkey" FOREIGN KEY ("charged_locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_penalties" ADD CONSTRAINT "cancellation_penalties_charged_practice_id_fkey" FOREIGN KEY ("charged_practice_id") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
