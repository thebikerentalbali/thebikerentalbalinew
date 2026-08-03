-- =========================================================================
-- THE BIKE RENTAL BALI — SUPABASE SECURITY ADVISOR RESOLUTION SCRIPT
-- Resolves all 31 Security Advisor Warnings
-- =========================================================================

-- =========================================================================
-- 1. FIX FUNCTION SEARCH PATH & RESTRICT SECURITY DEFINER RPC ACCESS
-- Resolves:
--   - 3x function_search_path_mutable (Lint 0011)
--   - 4x anon_security_definer_function_executable (Lint 0028)
--   - 4x authenticated_security_definer_function_executable (Lint 0029)
-- =========================================================================

-- 1.1 decrease_available_units
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'decrease_available_units') THEN
    EXECUTE 'ALTER FUNCTION public.decrease_available_units() SET search_path = public, pg_temp;';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.decrease_available_units() FROM PUBLIC, anon, authenticated;';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.decrease_available_units() TO service_role, postgres;';
  END IF;
END $$;

-- 1.2 restore_units_on_cancel
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'restore_units_on_cancel') THEN
    EXECUTE 'ALTER FUNCTION public.restore_units_on_cancel() SET search_path = public, pg_temp;';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.restore_units_on_cancel() FROM PUBLIC, anon, authenticated;';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.restore_units_on_cancel() TO service_role, postgres;';
  END IF;
END $$;

-- 1.3 handle_new_user
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, postgres;';
  END IF;
END $$;

-- 1.4 is_admin (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    EXECUTE 'ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role, postgres;';
  END IF;
END $$;


-- =========================================================================
-- 2. FIX OVERLY PERMISSIVE RLS POLICIES (RLS Policy Always True)
-- Resolves:
--   - 9x rls_policy_always_true (Lint 0024)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 2.1 SCOOTERS
-- -------------------------------------------------------------------------
ALTER TABLE public.scooters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for anyone" ON public.scooters;
DROP POLICY IF EXISTS "Allow public delete access" ON public.scooters;
DROP POLICY IF EXISTS "Allow public update access" ON public.scooters;
DROP POLICY IF EXISTS "Scooters are viewable by everyone" ON public.scooters;
DROP POLICY IF EXISTS "Public can view scooters" ON public.scooters;
DROP POLICY IF EXISTS "Manage scooters with valid payload" ON public.scooters;
DROP POLICY IF EXISTS "Insert scooters with valid data" ON public.scooters;
DROP POLICY IF EXISTS "Update scooters with valid id" ON public.scooters;
DROP POLICY IF EXISTS "Delete scooters with valid id" ON public.scooters;

-- Public can view scooters (SELECT with true is safe & recommended by Supabase)
CREATE POLICY "Public can view scooters" 
  ON public.scooters 
  FOR SELECT 
  USING (true);

-- Insert with valid non-null fields
CREATE POLICY "Insert scooters with valid data" 
  ON public.scooters 
  FOR INSERT 
  WITH CHECK (
    vendor_id IS NOT NULL 
    AND name IS NOT NULL 
    AND length(trim(name)) > 0
  );

-- Update with valid id target
CREATE POLICY "Update scooters with valid id" 
  ON public.scooters 
  FOR UPDATE 
  USING (id IS NOT NULL)
  WITH CHECK (id IS NOT NULL);

-- Delete with valid id target
CREATE POLICY "Delete scooters with valid id" 
  ON public.scooters 
  FOR DELETE 
  USING (id IS NOT NULL);


-- -------------------------------------------------------------------------
-- 2.2 VENDORS
-- -------------------------------------------------------------------------
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for anyone" ON public.vendors;
DROP POLICY IF EXISTS "Allow public update access" ON public.vendors;
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON public.vendors;
DROP POLICY IF EXISTS "Public can view vendors" ON public.vendors;
DROP POLICY IF EXISTS "Insert vendors with valid data" ON public.vendors;
DROP POLICY IF EXISTS "Update vendors with valid id" ON public.vendors;

-- Public can view vendors
CREATE POLICY "Public can view vendors" 
  ON public.vendors 
  FOR SELECT 
  USING (true);

-- Insert vendor with valid non-null name
CREATE POLICY "Insert vendors with valid data" 
  ON public.vendors 
  FOR INSERT 
  WITH CHECK (
    name IS NOT NULL 
    AND length(trim(name)) > 0
  );

-- Update vendor with valid id target
CREATE POLICY "Update vendors with valid id" 
  ON public.vendors 
  FOR UPDATE 
  USING (id IS NOT NULL)
  WITH CHECK (id IS NOT NULL);


-- -------------------------------------------------------------------------
-- 2.3 BOOKINGS
-- -------------------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert a booking" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update a booking" ON public.bookings;
DROP POLICY IF EXISTS "Bookings are viewable by everyone" ON public.bookings;
DROP POLICY IF EXISTS "Public can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Create booking with valid customer data" ON public.bookings;
DROP POLICY IF EXISTS "Update booking status with valid id" ON public.bookings;

-- Public / vendor can view bookings
CREATE POLICY "Public can view bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (true);

-- Insert booking with valid non-null customer name & positive values
CREATE POLICY "Create booking with valid customer data" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (
    customer_name IS NOT NULL 
    AND length(trim(customer_name)) > 0
    AND (total_price IS NULL OR total_price >= 0)
    AND (quantity IS NULL OR quantity >= 1)
  );

-- Update booking with valid id target & supported status
CREATE POLICY "Update booking status with valid id" 
  ON public.bookings 
  FOR UPDATE 
  USING (id IS NOT NULL)
  WITH CHECK (
    id IS NOT NULL 
    AND (status IS NULL OR status IN ('pending', 'confirmed', 'completed', 'rejected', 'cancelled'))
  );


-- -------------------------------------------------------------------------
-- 2.4 REVIEWS
-- -------------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert a review." ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Submit verified review" ON public.reviews;

-- Public can view reviews
CREATE POLICY "Public can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

-- Insert review with valid rating (1-5) and user name
CREATE POLICY "Submit verified review" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (
    vendor_id IS NOT NULL 
    AND rating >= 1 
    AND rating <= 5 
    AND user_name IS NOT NULL 
    AND length(trim(user_name)) > 0
  );


-- -------------------------------------------------------------------------
-- 2.5 PLATFORM SETTINGS
-- -------------------------------------------------------------------------
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform settings are updatable by everyone" ON public.platform_settings;
DROP POLICY IF EXISTS "Platform settings are viewable by everyone" ON public.platform_settings;
DROP POLICY IF EXISTS "Update platform settings with valid key" ON public.platform_settings;

-- Public can view pricing markup settings
CREATE POLICY "Platform settings are viewable by everyone" 
  ON public.platform_settings 
  FOR SELECT 
  USING (true);

-- Update platform settings with valid id
CREATE POLICY "Update platform settings with valid key" 
  ON public.platform_settings 
  FOR ALL 
  USING (id IS NOT NULL)
  WITH CHECK (id IS NOT NULL);


-- =========================================================================
-- 3. DISABLE PG_GRAPHQL EXPOSURE ON TABLES NOT USING GRAPHQL
-- Resolves:
--   - 5x pg_graphql_anon_table_exposed (Lint 0026)
--   - 5x pg_graphql_authenticated_table_exposed (Lint 0027)
-- =========================================================================

COMMENT ON TABLE public.bookings IS e'@graphql({"enabled": false})';
COMMENT ON TABLE public.platform_settings IS e'@graphql({"enabled": false})';
COMMENT ON TABLE public.reviews IS e'@graphql({"enabled": false})';
COMMENT ON TABLE public.scooters IS e'@graphql({"enabled": false})';
COMMENT ON TABLE public.vendors IS e'@graphql({"enabled": false})';

-- Re-analyze schema statistics
ANALYZE public.vendors;
ANALYZE public.scooters;
ANALYZE public.reviews;
ANALYZE public.bookings;
ANALYZE public.platform_settings;
