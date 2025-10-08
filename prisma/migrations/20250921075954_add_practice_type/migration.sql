-- AlterTable
ALTER TABLE "locum_profiles" ADD COLUMN     "hourlyPayRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "practices" ADD COLUMN     "practiceType" TEXT NOT NULL DEFAULT 'Private';
