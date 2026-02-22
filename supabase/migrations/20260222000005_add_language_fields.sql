-- Migration: Add language/translation fields
-- PROJ-6: Language Switcher (DE/EN)
-- Created: 2026-02-22

-- ============================================================
-- 1. profiles: store user's preferred UI language
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(2)
    CHECK (preferred_language IN ('de', 'en'));

COMMENT ON COLUMN public.profiles.preferred_language IS
  'User''s preferred UI language: ''de'' or ''en''. NULL = not yet set.';

-- ============================================================
-- 2. ideas: store original language + cached translations
-- ============================================================
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS original_language VARCHAR(10);

ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.ideas.original_language IS
  'BCP-47 language code of the original submission (e.g. ''de'', ''en'').';

COMMENT ON COLUMN public.ideas.translations IS
  'Cached translations: {"de": {"title": "...", "description": "..."}, "en": {...}}';

-- ============================================================
-- 3. Recreate ideas_with_scores view to include new columns
-- ============================================================
CREATE OR REPLACE VIEW public.ideas_with_scores AS
SELECT
  i.id,
  i.user_id,
  i.title,
  i.description,
  i.status,
  i.original_language,
  i.translations,
  COALESCE(SUM(v.value), 0)::int AS score,
  i.created_at,
  i.updated_at
FROM public.ideas i
LEFT JOIN public.votes v ON v.idea_id = i.id
GROUP BY i.id;

GRANT SELECT ON public.ideas_with_scores TO anon, authenticated;
