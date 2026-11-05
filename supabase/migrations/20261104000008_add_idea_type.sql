-- PROJ-8: Feature oder Bug kennzeichnen
-- Neue Spalte ideas.idea_type. Bestehende Ideen werden als 'feature' markiert.
-- Bestehende RLS-Policies gelten unverändert.

ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS idea_type TEXT NOT NULL DEFAULT 'feature'
  CHECK (idea_type IN ('feature', 'bug'));

COMMENT ON COLUMN public.ideas.idea_type IS
  'Art des Beitrags: feature (Funktionswunsch) oder bug (Fehlermeldung).';

-- View neu anlegen, damit idea_type ausgeliefert wird (neue Spalte am Ende).
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
  i.updated_at,
  i.idea_type
FROM public.ideas i
LEFT JOIN public.votes v ON v.idea_id = i.id
GROUP BY i.id;

GRANT SELECT ON public.ideas_with_scores TO anon, authenticated;
