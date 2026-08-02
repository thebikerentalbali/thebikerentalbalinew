-- Run this SQL in your Supabase SQL Editor to create the `reviews` table and add vendor profile fields

create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references vendors(id) on delete cascade not null,
  user_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table reviews enable row level security;

-- Create policies
create policy "Reviews are viewable by everyone." on reviews
  for select using (true);

create policy "Anyone can insert a review." on reviews
  for insert with check (true);

-- Optional: Add opening_hours and delivery_area columns to vendors table if not already added
alter table vendors add column if not exists opening_hours text;
alter table vendors add column if not exists delivery_area text;

