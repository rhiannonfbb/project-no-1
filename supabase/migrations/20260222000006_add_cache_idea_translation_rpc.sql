-- PROJ-6: RPC function to cache a translation in the ideas.translations JSONB column.
-- Uses SECURITY DEFINER so the API route can write translations without needing a
-- service role key or owner-level RLS permissions.

CREATE OR REPLACE FUNCTION cache_idea_translation(
  p_idea_id UUID,
  p_locale TEXT,
  p_title TEXT,
  p_description TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ideas
  SET translations = COALESCE(translations, '{}'::jsonb) ||
    jsonb_build_object(p_locale, jsonb_build_object('title', p_title, 'description', p_description))
  WHERE id = p_idea_id;
END;
$$;

GRANT EXECUTE ON FUNCTION cache_idea_translation(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
