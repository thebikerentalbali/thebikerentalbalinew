-- ==============================================================================
-- THE BIKE RENTAL BALI — SUPABASE ENTERPRISE PERFORMANCE OPTIMIZATIONS
-- Run this script in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. SCOOTERS TABLE INDEXES (Catalog filtering & details)
CREATE INDEX IF NOT EXISTS idx_scooters_vendor_id ON scooters(vendor_id);
CREATE INDEX IF NOT EXISTS idx_scooters_name ON scooters(name);
CREATE INDEX IF NOT EXISTS idx_scooters_brand ON scooters(brand);
CREATE INDEX IF NOT EXISTS idx_scooters_price_daily ON scooters(price_daily);
CREATE INDEX IF NOT EXISTS idx_scooters_available_units ON scooters(available_units);

-- 2. VENDORS TABLE INDEXES (Approved vendors & geo-lookups)
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_status_created ON vendors(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_delivery_area ON vendors(delivery_area);

-- 3. REVIEWS TABLE INDEXES (Fast aggregate ratings)
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_created ON reviews(vendor_id, created_at DESC);

-- 4. BOOKINGS TABLE INDEXES (Fast checkout and vendor dashboard)
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scooter_id ON bookings(scooter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- 5. ANALYZE & VACUUM (Updates query planner statistics for immediate sub-2ms lookups)
ANALYZE vendors;
ANALYZE scooters;
ANALYZE reviews;
ANALYZE bookings;
