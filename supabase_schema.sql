-- ==============================================================================
-- THE BIKE RENTAL BALI - COMPLETE SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Copy and paste this script directly into your Supabase SQL Editor and click "Run".
-- This script is IDEMPOTENT (safe to run multiple times without duplicate errors).
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. VENDORS TABLE
-- ==============================================================================
create table if not exists vendors (
  id uuid default gen_random_uuid() primary key,
  auth_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  lat double precision default -8.5069,
  lng double precision default 115.2625,
  logo text,
  image_url text,
  status text default 'pending',
  opening_hours text default '08:00 AM – 08:00 PM Daily',
  delivery_area text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist if table was already created
alter table vendors add column if not exists auth_id uuid references auth.users(id) on delete cascade;
alter table vendors add column if not exists name text;
alter table vendors add column if not exists email text;
alter table vendors add column if not exists phone text;
alter table vendors add column if not exists address text;
alter table vendors add column if not exists lat double precision default -8.5069;
alter table vendors add column if not exists lng double precision default 115.2625;
alter table vendors add column if not exists logo text;
alter table vendors add column if not exists image_url text;
alter table vendors add column if not exists status text default 'pending';
alter table vendors add column if not exists opening_hours text default '08:00 AM – 08:00 PM Daily';
alter table vendors add column if not exists delivery_area text;
alter table vendors add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Enable RLS
alter table vendors enable row level security;

-- Policies for vendors (Drop if exists first to prevent 42710 errors)
drop policy if exists "Vendors are viewable by everyone" on vendors;
create policy "Vendors are viewable by everyone" on vendors
  for select using (true);

drop policy if exists "Vendors can insert their profile on signup" on vendors;
create policy "Vendors can insert their profile on signup" on vendors
  for insert with check (true);

drop policy if exists "Vendors can update their own profile" on vendors;
create policy "Vendors can update their own profile" on vendors
  for update using (true);

-- ==============================================================================
-- 3. SCOOTERS TABLE
-- ==============================================================================
create table if not exists scooters (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references vendors(id) on delete cascade not null,
  name text not null,
  brand text,
  engine text,
  year integer,
  fuel_capacity text,
  transmission text,
  price_daily numeric not null default 0,
  price_weekly numeric,
  price_monthly numeric,
  total_units integer not null default 1,
  available_units integer not null default 1,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist
alter table scooters add column if not exists vendor_id uuid references vendors(id) on delete cascade;
alter table scooters add column if not exists name text;
alter table scooters add column if not exists brand text;
alter table scooters add column if not exists engine text;
alter table scooters add column if not exists year integer;
alter table scooters add column if not exists fuel_capacity text;
alter table scooters add column if not exists transmission text;
alter table scooters add column if not exists price_daily numeric not null default 0;
alter table scooters add column if not exists price_weekly numeric;
alter table scooters add column if not exists price_monthly numeric;
alter table scooters add column if not exists total_units integer not null default 1;
alter table scooters add column if not exists available_units integer not null default 1;
alter table scooters add column if not exists image_url text;
alter table scooters add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Enable RLS
alter table scooters enable row level security;

-- Policies for scooters
drop policy if exists "Scooters are viewable by everyone" on scooters;
create policy "Scooters are viewable by everyone" on scooters
  for select using (true);

drop policy if exists "Vendors can insert scooters" on scooters;
create policy "Vendors can insert scooters" on scooters
  for insert with check (true);

drop policy if exists "Vendors can update their scooters" on scooters;
create policy "Vendors can update their scooters" on scooters
  for update using (true);

drop policy if exists "Vendors can delete their scooters" on scooters;
create policy "Vendors can delete their scooters" on scooters
  for delete using (true);

-- ==============================================================================
-- 4. REVIEWS TABLE
-- ==============================================================================
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references vendors(id) on delete cascade not null,
  user_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist
alter table reviews add column if not exists vendor_id uuid references vendors(id) on delete cascade;
alter table reviews add column if not exists user_name text;
alter table reviews add column if not exists rating smallint check (rating >= 1 and rating <= 5);
alter table reviews add column if not exists comment text;
alter table reviews add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Enable RLS
alter table reviews enable row level security;

-- Policies for reviews (Drop if exists first to avoid duplicate error 42710)
drop policy if exists "Reviews are viewable by everyone." on reviews;
drop policy if exists "Reviews are viewable by everyone" on reviews;
create policy "Reviews are viewable by everyone" on reviews
  for select using (true);

drop policy if exists "Anyone can insert a review." on reviews;
drop policy if exists "Anyone can insert a review" on reviews;
create policy "Anyone can insert a review" on reviews
  for insert with check (true);

-- ==============================================================================
-- 5. BOOKINGS TABLE
-- ==============================================================================
create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  scooter_id uuid references scooters(id) on delete set null,
  vendor_id uuid references vendors(id) on delete cascade,
  customer_name text,
  customer_email text,
  customer_phone text,
  start_date date,
  end_date date,
  total_price numeric,
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table bookings enable row level security;

drop policy if exists "Bookings are viewable by authenticated users or public" on bookings;
create policy "Bookings are viewable by authenticated users or public" on bookings
  for select using (true);

drop policy if exists "Anyone can create bookings" on bookings;
create policy "Anyone can create bookings" on bookings
  for insert with check (true);

drop policy if exists "Vendors can update bookings" on bookings;
create policy "Vendors can update bookings" on bookings
  for update using (true);

-- ==============================================================================
-- 6. PERFORMANCE INDEXES
-- ==============================================================================
create index if not exists idx_scooters_vendor_id on scooters(vendor_id);
create index if not exists idx_reviews_vendor_id on reviews(vendor_id);
create index if not exists idx_bookings_vendor_id on bookings(vendor_id);
create index if not exists idx_vendors_status on vendors(status);
