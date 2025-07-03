-- CreateTable
CREATE TABLE "locum_profiles" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "email_address" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "gdc_number" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employee_type" TEXT NOT NULL,
    "software" TEXT NOT NULL,
    "gdc_image" TEXT,
    "indemnity_insurance_image" TEXT,
    "hepatitis_b_image" TEXT,
    "dbs_image" TEXT,
    "reference_number" TEXT NOT NULL,
    "cv" TEXT,
    "id_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locum_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "locum_id" TEXT NOT NULL,
    "number_of_years" INTEGER NOT NULL,
    "speciality" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locum_profiles_email_address_key" ON "locum_profiles"("email_address");

-- AddForeignKey
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_locum_id_fkey" FOREIGN KEY ("locum_id") REFERENCES "locum_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
