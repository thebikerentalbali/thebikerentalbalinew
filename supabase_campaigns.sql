-- ==============================================================================
-- THE BIKE RENTAL BALI — CAMPAIGNS SCHEMA & MIGRATION
-- Supports Multi-Category Collaborations (Spa, Travel Guides, Promos, Tours)
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Campaigns Table (or alter existing)
CREATE TABLE IF NOT EXISTS campaigns (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  category text DEFAULT 'scooter',
  partner_name text,
  partner_logo_url text,
  video_url text,
  youtube_id text,
  hero_overlay_text text,
  badge text DEFAULT 'SPECIAL OFFER',
  discount_text text,
  voucher_code text,
  partner_whatsapp text,
  partner_location text,
  voucher_terms text,
  cta_text text DEFAULT 'Rent Now',
  cta_link text DEFAULT '#all-scooters',
  image_url text,
  theme text DEFAULT 'dark',
  is_active boolean DEFAULT true,
  "order" integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist if table was already created
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS category text DEFAULT 'scooter';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS partner_name text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS partner_logo_url text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS youtube_id text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS hero_overlay_text text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS voucher_code text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS partner_whatsapp text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS partner_location text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS voucher_terms text;

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

-- 4. Seed Default Campaigns (Allowing Admin to Upload Custom Graphics / Photos)
INSERT INTO campaigns (
  id, title, subtitle, category, partner_name, partner_logo_url, video_url, youtube_id,
  hero_overlay_text, badge, discount_text, voucher_code, partner_whatsapp, partner_location,
  voucher_terms, cta_text, cta_link, image_url, theme, is_active, "order"
)
VALUES
  (
    'default-spa-collaboration',
    'Exclusive Spa & Wellness Collaboration',
    'Show your scooter rental booking confirmation to claim 25% off all traditional Balinese massage & body scrub treatments.',
    'spa',
    'Sanctuary Spa & Massage Bali',
    NULL,
    NULL,
    NULL,
    'RELAX & RECHARGE',
    '💆 25% SPA DISCOUNT',
    'EXCLUSIVE FOR OUR RIDERS',
    'BALIRIDER25',
    '6281234567890',
    'Seminyak, Canggu & Ubud, Bali',
    'Valid with any active scooter booking confirmation. Present voucher code upon arrival.',
    'Claim Spa Voucher',
    '#claim-voucher',
    '/images/scooter.png',
    'sunset',
    true,
    1
  ),
  (
    'default-travel-guide-video',
    'Bali Travel Guide | Best Places & Scenic Routes',
    'Experience Bali through its culture, secret waterfalls, and scenic mountain roads. Watch our ultimate rider guide.',
    'video',
    'Bali Head Tour',
    NULL,
    'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    'ScMzIvxBSi4',
    'EXPLORE the island of God',
    '🎥 ISLAND GUIDE',
    'TOP HIDDEN SPOTS',
    NULL,
    NULL,
    'Bali, Indonesia',
    NULL,
    'Watch Video Guide',
    'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    '/images/scooter.png',
    'dark',
    true,
    2
  ),
  (
    'default-scooter-promo',
    'Explore Bali on Two Wheels',
    'Rent Honda, Yamaha & Vespa scooters with free doorstep delivery across Bali & 2 helmets included.',
    'scooter',
    'The Bike Rental Bali',
    '/images/scooter.png',
    NULL,
    NULL,
    'RIDE WITH FREEDOM',
    '🔥 LIMITED PROMO',
    'SAVE UP TO 25% TODAY',
    NULL,
    NULL,
    'All Bali Delivery',
    NULL,
    'Rent Now',
    '#all-scooters',
    '/images/scooter.png',
    'ocean',
    true,
    3
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  category = EXCLUDED.category,
  partner_name = EXCLUDED.partner_name,
  partner_logo_url = EXCLUDED.partner_logo_url,
  video_url = EXCLUDED.video_url,
  youtube_id = EXCLUDED.youtube_id,
  hero_overlay_text = EXCLUDED.hero_overlay_text,
  badge = EXCLUDED.badge,
  discount_text = EXCLUDED.discount_text,
  voucher_code = EXCLUDED.voucher_code,
  partner_whatsapp = EXCLUDED.partner_whatsapp,
  partner_location = EXCLUDED.partner_location,
  voucher_terms = EXCLUDED.voucher_terms,
  cta_text = EXCLUDED.cta_text,
  cta_link = EXCLUDED.cta_link,
  image_url = EXCLUDED.image_url,
  theme = EXCLUDED.theme,
  is_active = EXCLUDED.is_active,
  "order" = EXCLUDED."order";
