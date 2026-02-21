-- Migration: Create ideas table
-- PROJ-2 (Public Idea Board), PROJ-3 (Idea Submission), PROJ-5 (Admin Moderation)
-- Created: 2026-02-21

-- ============================================================
-- 1. Admin helper function (used in RLS policies)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
COMMENT ON FUNCTION public.is_admin() IS
  'Returns true if the currently authenticated user has admin role in profiles.';

-- ============================================================
-- 2. Ideas table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ideas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description TEXT        NOT NULL CHECK (char_length(description) BETWEEN 1 AND 2000),
  status      TEXT        NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new', 'planned', 'in_progress', 'done')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.ideas IS 'User-submitted product ideas for the VoteBoard.';
COMMENT ON COLUMN public.ideas.status IS
  'Moderation lifecycle: new | planned | in_progress | done';

-- ============================================================
-- 3. Auto-update updated_at (reuses function from PROJ-1)
-- ============================================================
CREATE TRIGGER trg_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 4. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ideas_user_id    ON public.ideas (user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status     ON public.ideas (status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas (created_at DESC);

-- ============================================================
-- 5. Row Level Security
-- ============================================================
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Public read access (supports PROJ-2: public board)
CREATE POLICY "ideas: anyone can select"
  ON public.ideas FOR SELECT
  USING (true);

-- Authenticated users can submit their own ideas (PROJ-3)
CREATE POLICY "ideas: owner can insert"
  ON public.ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner can edit their own idea; Admin can change status (PROJ-3, PROJ-5)
CREATE POLICY "ideas: owner or admin can update"
  ON public.ideas FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Owner can delete own idea; Admin can delete any idea (PROJ-3, PROJ-5)
CREATE POLICY "ideas: owner or admin can delete"
  ON public.ideas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
