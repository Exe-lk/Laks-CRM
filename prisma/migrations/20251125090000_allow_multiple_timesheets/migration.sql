-- Allow multiple timesheets per month for a locum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'timesheets_locum_id_month_year_key'
  ) THEN
    EXECUTE 'DROP INDEX "timesheets_locum_id_month_year_key"';
  END IF;
END $$;

