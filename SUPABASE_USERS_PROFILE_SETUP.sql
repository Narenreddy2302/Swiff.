-- =====================================================
-- PUBLIC USERS/PROFILES TABLE SETUP
-- =====================================================
-- This creates a public.users table that syncs with auth.users
-- Required for foreign key relationships in groups, bills, etc.

-- Create public.users table (profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can view all other users (needed for group members, bill participants, etc.)
CREATE POLICY "Users can view all profiles"
  ON public.users
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- BACKFILL EXISTING USERS
-- =====================================================
-- Create profiles for any existing auth.users who don't have profiles yet

INSERT INTO public.users (id, email, display_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)) as display_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT
  'users table exists' as check_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') as status
UNION ALL
SELECT
  'RLS enabled on users',
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'users' AND relnamespace = 'public'::regnamespace)
UNION ALL
SELECT
  'handle_new_user function exists',
  EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user')
UNION ALL
SELECT
  'user count matches',
  (SELECT COUNT(*) FROM public.users) = (SELECT COUNT(*) FROM auth.users);
