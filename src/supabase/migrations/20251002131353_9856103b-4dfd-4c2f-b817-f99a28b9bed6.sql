-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  location text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create animals table
CREATE TABLE IF NOT EXISTS public.animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  age text,
  gender text,
  size text,
  color text,
  health_status text,
  vaccination_status text,
  description text,
  adoption_status text DEFAULT 'available',
  image_url text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Animals viewable by all" ON public.animals;
DROP POLICY IF EXISTS "NGOs can manage their animals" ON public.animals;

CREATE POLICY "Animals viewable by all"
  ON public.animals FOR SELECT
  USING (true);

CREATE POLICY "NGOs can manage their animals"
  ON public.animals FOR ALL
  USING (auth.uid() = ngo_id);

-- Create rescue reports
CREATE TABLE IF NOT EXISTS public.rescue_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  animal_type text,
  location text,
  description text,
  urgency text DEFAULT 'medium',
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.rescue_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reports viewable by all" ON public.rescue_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.rescue_reports;
DROP POLICY IF EXISTS "NGOs can update reports" ON public.rescue_reports;

CREATE POLICY "Reports viewable by all"
  ON public.rescue_reports FOR SELECT
  USING (true);

CREATE POLICY "Users can create reports"
  ON public.rescue_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "NGOs can update reports"
  ON public.rescue_reports FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  is_starred boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  folder text DEFAULT 'inbox',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;

CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_id uuid REFERENCES public.animals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, animal_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage their favorites" ON public.favorites;

CREATE POLICY "Users can view their favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id);

-- Create team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  email text,
  phone text,
  status text DEFAULT 'active',
  joined_date timestamptz DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members viewable by NGO" ON public.team_members;
DROP POLICY IF EXISTS "NGOs can manage team" ON public.team_members;

CREATE POLICY "Team members viewable by NGO"
  ON public.team_members FOR SELECT
  USING (auth.uid() = ngo_id);

CREATE POLICY "NGOs can manage team"
  ON public.team_members FOR ALL
  USING (auth.uid() = ngo_id);

-- Create adoption applications
CREATE TABLE IF NOT EXISTS public.adoption_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES public.animals(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applications viewable by applicant and NGO" ON public.adoption_applications;
DROP POLICY IF EXISTS "Users can create applications" ON public.adoption_applications;
DROP POLICY IF EXISTS "NGOs can update applications" ON public.adoption_applications;

CREATE POLICY "Applications viewable by applicant and NGO"
  ON public.adoption_applications FOR SELECT
  USING (
    auth.uid() = applicant_id OR 
    auth.uid() IN (SELECT ngo_id FROM public.animals WHERE id = animal_id)
  );

CREATE POLICY "Users can create applications"
  ON public.adoption_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "NGOs can update applications"
  ON public.adoption_applications FOR UPDATE
  USING (auth.uid() IN (SELECT ngo_id FROM public.animals WHERE id = animal_id));

-- Storage policies for avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function and triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.animals;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.rescue_reports;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.rescue_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();