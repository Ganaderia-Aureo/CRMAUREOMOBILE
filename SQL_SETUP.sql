-- Add birth_date column to animals table if it doesn't exist
ALTER TABLE animals ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add initials column to clients table if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS initials TEXT;

-- Verify RLS Policies (Example - Adjust based on your actual security needs)
-- ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for authenticated users" ON "public"."animals" FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "Enable insert access for authenticated users" ON "public"."animals" FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Enable update access for authenticated users" ON "public"."animals" FOR UPDATE TO authenticated USING (true);
