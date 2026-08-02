-- Create properties table
CREATE TABLE public.properties (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD'::text NOT NULL,
  property_type text NOT NULL,
  bedrooms integer,
  bathrooms integer,
  amenities text[] DEFAULT ARRAY[]::text[],
  images text[] DEFAULT ARRAY[]::text[],
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  geohash text,
  status text DEFAULT 'draft'::text NOT NULL, -- e.g., 'draft', 'published', 'archived'
  is_featured boolean DEFAULT false NOT NULL,
  views integer DEFAULT 0 NOT NULL,
  favorites integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX properties_owner_id_idx ON public.properties (owner_id);
CREATE INDEX properties_geohash_idx ON public.properties (geohash);
CREATE INDEX properties_price_idx ON public.properties (price);
CREATE INDEX properties_type_idx ON public.properties (property_type);

-- Set up Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to view published properties
CREATE POLICY "All authenticated users can view published properties." ON public.properties
  FOR SELECT USING (auth.role() = 'authenticated' AND status = 'published');

-- Policy to allow property owners to view their own properties (even if not published)
CREATE POLICY "Property owners can view their own properties." ON public.properties
  FOR SELECT USING (auth.uid() = owner_id);

-- Policy to allow property owners to create properties
CREATE POLICY "Property owners can create properties." ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy to allow property owners to update their own properties
CREATE POLICY "Property owners can update their own properties." ON public.properties
  FOR UPDATE USING (auth.uid() = owner_id);

-- Policy to allow property owners to delete their own properties
CREATE POLICY "Property owners can delete their own properties." ON public.properties
  FOR DELETE USING (auth.uid() = owner_id);