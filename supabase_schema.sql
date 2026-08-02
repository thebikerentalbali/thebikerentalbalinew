-- Add Operating Hours and Delivery Areas to the vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS opening_hours text DEFAULT '08:00 AM – 08:00 PM Daily';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS delivery_area text;
