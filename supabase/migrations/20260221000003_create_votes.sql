-- Migration: Create votes table + ideas_with_scores view
-- PROJ-4: Voting System
-- Created: 2026-02-21

-- ============================================================
-- 1. Votes table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  idea_id    UUID      NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  value      SMALLINT  NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One vote per user per idea (enforced at DB level)
  UNIQUE (user_id, idea_id)
);

COMMENT ON TABLE  public.votes IS
  'One vote per user per idea. value=1 upvote, value=-1 downvote.';
COMMENT ON COLUMN public.votes.value IS '1 = upvote, -1 = downvote';

-- ============================================================
-- 2. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_votes_idea_id ON public.votes (idea_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes (user_id);

-- ============================================================
-- 3. Row Level Security
-- ============================================================
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes (needed for public score display)
CREATE POLICY "votes: anyone can select"
  ON public.votes FOR SELECT
  USING (true);

-- Authenticated users can cast their own vote
CREATE POLICY "votes: owner can insert"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner can change their vote (upvote ↔ downvote)
CREATE POLICY "votes: owner can update"
  ON public.votes FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owner can retract their vote
CREATE POLICY "votes: owner can delete"
  ON public.votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. ideas_with_scores view
--    Aggregates vote scores so the app can ORDER BY score.
--    Queried from the server component in PROJ-2.
-- ============================================================
CREATE OR REPLACE VIEW public.ideas_with_scores AS
SELECT
  i.id,
  i.user_id,
  i.title,
  i.description,
  i.status,
  COALESCE(SUM(v.value), 0)::int AS score,
  i.created_at,
  i.updated_at
FROM public.ideas i
LEFT JOIN public.votes v ON v.idea_id = i.id
GROUP BY i.id;

COMMENT ON VIEW public.ideas_with_scores IS
  'Ideas with aggregated vote score (sum of all +1/-1 votes).';

-- Grant read access to Supabase roles
GRANT SELECT ON public.ideas_with_scores TO anon, authenticated;
