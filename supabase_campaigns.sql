-- ==============================================================================
-- THE BIKE RENTAL BALI — CAMPAIGNS SCHEMA & MIGRATION
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  badge text DEFAULT 'SPECIAL OFFER',
  discount_text text,
  cta_text text DEFAULT 'Rent Now',
  cta_link text DEFAULT '#all-scooters',
  image_url text,
  theme text DEFAULT 'dark',
  is_active boolean DEFAULT true,
  "order" integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Index for Fast Campaign Lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_active_order ON campaigns (is_active, "order" ASC);

-- 3. Row Level Security Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Campaigns are viewable by everyone" ON campaigns;
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Campaigns can be inserted by anyone" ON campaigns;
CREATE POLICY "Campaigns can be inserted by anyone" ON campaigns FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Campaigns can be updated by anyone" ON campaigns;
CREATE POLICY "Campaigns can be updated by anyone" ON campaigns FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Campaigns can be deleted by anyone" ON campaigns;
CREATE POLICY "Campaigns can be deleted by anyone" ON campaigns FOR DELETE USING (true);

-- 4. Seed Default Campaigns
INSERT INTO campaigns (id, title, subtitle, badge, discount_text, cta_text, cta_link, image_url, theme, is_active, "order")
VALUES
  (
    'default-promo-1',
    'Explore Bali on Two Wheels',
    'Rent Honda, Yamaha & Vespa scooters with free doorstep delivery across Bali & 2 helmets included.',
    '🔥 LIMITED PROMO',
    'SAVE UP TO 25% TODAY',
    'Rent Now',
    '#all-scooters',
    '/images/scooter.png',
    'dark',
    true,
    1
  ),
  (
    'default-promo-2',
    'Monthly Island Living Deal',
    'Staying 30+ days in Bali? Get VIP monthly rates with complimentary 24/7 roadside assistance & free swaps.',
    '🌴 LONG TERM SPECIAL',
    'UP TO 40% OFF MONTHLY',
    'View Verified Fleet',
    '#all-scooters',
    '/images/scooter.png',
    'ocean',
    true,
    2
  )
ON CONFLICT (id) DO NOTHING;
