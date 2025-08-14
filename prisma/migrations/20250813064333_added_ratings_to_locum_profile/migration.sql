-- AlterTable
ALTER TABLE "locum_profiles" ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "ratings" JSONB,
ADD COLUMN     "totalRatings" INTEGER;
