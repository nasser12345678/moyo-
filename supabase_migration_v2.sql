-- ============================================================
-- MOYO v2 MIGRATION — Per-user clinical data persistence
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. MEDICATION LOGS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  med_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  med_name   TEXT        NOT NULL,
  taken      BOOLEAN     NOT NULL DEFAULT false,
  taken_at   TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, med_date, med_name)
);

CREATE INDEX IF NOT EXISTS idx_medlogs_user_date
  ON public.medication_logs (user_id, med_date);

ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medication logs"
  ON public.medication_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication logs"
  ON public.medication_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication logs"
  ON public.medication_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 2. DAILY CHECK-INS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date  DATE       NOT NULL DEFAULT CURRENT_DATE,
  mood         TEXT,
  symptoms     JSONB       DEFAULT '[]'::jsonb,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date
  ON public.daily_checkins (user_id, checkin_date);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins"
  ON public.daily_checkins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins"
  ON public.daily_checkins FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
  ON public.daily_checkins FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 3. TREATMENT PLANS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.treatment_plans (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  start_date    DATE    NOT NULL DEFAULT CURRENT_DATE,
  duration_days INT     NOT NULL DEFAULT 180,
  phase         TEXT    NOT NULL DEFAULT 'intensive',
  display_name  TEXT    DEFAULT 'Patient',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own treatment plan"
  ON public.treatment_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own treatment plan"
  ON public.treatment_plans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own treatment plan"
  ON public.treatment_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 4. ADD display_name TO PROFILES (if missing)
-- ──────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT 'Patient';

-- ──────────────────────────────────────────────
-- 5. UPDATE SIGNUP TRIGGER — also create treatment_plans row
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.treatment_plans (user_id, display_name)
  VALUES (new.id, split_part(new.email, '@', 1))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
