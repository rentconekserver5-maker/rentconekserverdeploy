-- Create users table
CREATE TABLE public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  display_name text,
  email text,
  phone text,
  photo_url text,
  role text DEFAULT 'user'::text NOT NULL,
  verification_status text DEFAULT 'pending'::text NOT NULL,
  subscription_status text DEFAULT 'inactive'::text NOT NULL,
  subscription_expiry timestamp with time zone,
  favorites uuid[] DEFAULT ARRAY[]::uuid[],
  saved_searches jsonb DEFAULT '[]'::jsonb, -- Store as JSONB for flexibility
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view their own profile
CREATE POLICY "Users can view their own profile." ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile." ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow authenticated users to create their profile (on sign-up)
CREATE POLICY "Users can create their own profile." ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);