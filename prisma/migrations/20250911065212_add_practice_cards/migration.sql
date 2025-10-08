-- CreateTable
CREATE TABLE "practice_cards" (
    "id" TEXT NOT NULL,
    "practice_id" TEXT NOT NULL,
    "card_holder_name" TEXT NOT NULL,
    "encrypted_card_number" TEXT NOT NULL,
    "encrypted_cvv" TEXT NOT NULL,
    "expiry_month" INTEGER NOT NULL,
    "expiry_year" INTEGER NOT NULL,
    "card_type" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_cards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "practice_cards" ADD CONSTRAINT "practice_cards_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
