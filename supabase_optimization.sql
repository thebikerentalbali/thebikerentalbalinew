-- =========================================================================
-- HIGH-CONCURRENCY DATABASE INDEXING & ACCELERATION BLUEPRINT
-- For: THE BIKE RENTAL BALI (Enterprise Scale / High Concurrent Traffic)
-- =========================================================================

-- 1. Vendors Indexes
-- Accelerates status filtering for approved public listings and vendor lookups
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at DESC);

-- 2. Scooters Indexes
-- Accelerates vendor fleet joins, brand filtering, and price range lookups
CREATE INDEX IF NOT EXISTS idx_scooters_vendor_id ON scooters(vendor_id);
CREATE INDEX IF NOT EXISTS idx_scooters_brand ON scooters(brand);
CREATE INDEX IF NOT EXISTS idx_scooters_price_daily ON scooters(price_daily);
CREATE INDEX IF NOT EXISTS idx_scooters_available_units ON scooters(available_units);

-- 3. Reviews Indexes
-- Accelerates vendor review counts and rating aggregation
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- 4. Bookings Indexes
-- Accelerates dashboard lookups, vendor portal queries, and status checks
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scooter_id ON bookings(scooter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_status ON bookings(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_end_date ON bookings(end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- 5. Platform Settings Index
CREATE INDEX IF NOT EXISTS idx_platform_settings_id ON platform_settings(id);

-- 6. Statistics Analysis Update
-- Update PostgreSQL query planner statistics for optimal index scan selection
ANALYZE vendors;
ANALYZE scooters;
ANALYZE reviews;
ANALYZE bookings;
ANALYZE platform_settings;
