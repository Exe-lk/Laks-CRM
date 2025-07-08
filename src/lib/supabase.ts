import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!||"https://agqxhzskevmznwbixoac.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncXhoenNrZXZtem53Yml4b2FjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg2NjAyOSwiZXhwIjoyMDY2NDQyMDI5fQ.OqYZ5x34YPPwHJGQ1KJRhqcQWpB0AI-EwVEFC6GQgYs"

// Create a Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) 