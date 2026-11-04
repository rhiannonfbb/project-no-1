-- PROJ-7: Asana-Anbindung
-- Speichert die ID der Asana-Aufgabe, die zu einer freigegebenen Idee gehört.
-- Dadurch entsteht pro Idee höchstens eine Aufgabe, auch bei wiederholtem Statuswechsel.
-- Bestehende RLS-Policies gelten unverändert ("ideas: owner or admin can update").

ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS asana_task_gid TEXT;

COMMENT ON COLUMN public.ideas.asana_task_gid IS
  'Asana task GID, gesetzt sobald ein Admin die Idee freigibt. NULL = noch keine Aufgabe.';
