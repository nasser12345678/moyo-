-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated USING (auth.uid() = id);

-- Trigger to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 2. MESSAGES TABLE (Chat History)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'bot')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own messages"
ON public.messages FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
TO authenticated USING (auth.uid() = user_id);

-- Note for Backend API calls: 
-- Because we are using the Supabase Service Role Key (or Anon Key via the frontend JWT) in Netlify functions, 
-- the RLS policies above will securely protect the data so one patient cannot read another patient's chats!

-- ==========================================
-- 3. TB KNOWLEDGE BASE TABLE (RAG Source)
-- ==========================================
-- Backup existing table if it exists
ALTER TABLE IF EXISTS public.tb_information RENAME TO tb_information_backup;

CREATE TABLE public.tb_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'Untitled',
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General TB Care',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tb_information ENABLE ROW LEVEL SECURITY;

-- Everyone logged in can read the medical facts
CREATE POLICY "Allow authenticated users to read tb_information"
ON public.tb_information FOR SELECT
TO authenticated USING (true);

-- Insert sample verified medical facts
-- Since title might not have a UNIQUE constraint, we don't do ON CONFLICT DO NOTHING unless we have one. 
-- For safety, we just insert them directly.
INSERT INTO public.tb_information (title, content, category) VALUES
('What is Tuberculosis?', 'Tuberculosis (TB) is a disease caused by bacteria called Mycobacterium tuberculosis. The bacteria usually attack the lungs, but they can also damage other parts of the body such as the kidneys, spine, and brain.', 'Diagnosis'),
('Importance of Completing Treatment', 'It is critical to take TB medication exactly as prescribed and for the full course of treatment. Stopping medication early or missing doses can cause the bacteria to become resistant to drugs, leading to Multidrug-Resistant TB (MDR-TB), which is much harder to cure.', 'Treatment'),
('Common Side Effects of TB Medication', 'Common side effects of first-line TB medications include orange or red-colored urine/tears (normal with Rifampicin), mild nausea, or loss of appetite. However, if you experience yellowing of the eyes/skin, severe abdominal pain, or tingling in hands/feet, contact your care team immediately.', 'Side Effects'),
('Nutrition During TB Recovery', 'A high-protein, nutrient-rich diet helps the body recover from tuberculosis. Patients should eat foods like eggs, beans, fish, lean meats, and whole grains, while avoiding alcohol completely as it interacts dangerously with TB medications and can damage the liver.', 'Lifestyle');
