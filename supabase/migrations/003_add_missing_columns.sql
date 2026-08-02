-- Add missing columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS surname text,
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_type text;

-- Add missing columns to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS price_type text DEFAULT 'month'::text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS area numeric(10,2),
ADD COLUMN IF NOT EXISTS available_from timestamp with time zone;
