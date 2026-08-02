-- 1. Add Operating Hours and Delivery Areas to the vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS opening_hours text DEFAULT '08:00 AM – 08:00 PM Daily';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS delivery_area text;

-- 2. Create Bookings Table if not exists
CREATE TABLE IF NOT EXISTS bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scooter_id bigint REFERENCES scooters(id) ON DELETE SET NULL,
  vendor_id bigint REFERENCES vendors(id) ON DELETE CASCADE,
  customer_name text,
  customer_phone text,
  customer_email text,
  start_date text,
  end_date text,
  quantity integer DEFAULT 1,
  total_price numeric,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add quantity and status update for existing tables
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending';

-- Enable RLS and create open policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bookings are viewable by everyone" ON bookings;
CREATE POLICY "Bookings are viewable by everyone" ON bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert a booking" ON bookings;
CREATE POLICY "Anyone can insert a booking" ON bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update a booking" ON bookings;
CREATE POLICY "Anyone can update a booking" ON bookings FOR UPDATE USING (true);
