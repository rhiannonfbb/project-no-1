-- Migration: Prevent non-admin users from escalating their own role
-- Security fix for BUG-2 found in QA
-- Created: 2026-02-21
--
-- The profiles UPDATE policy only checks `auth.uid() = id`, which means any
-- authenticated user can call .update({ role: 'admin' }) on their own row and
-- promote themselves. RLS cannot restrict individual columns, so we use a
-- BEFORE UPDATE trigger to enforce the constraint at the database level.

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- If the role column is being changed, only allow it when the caller is already admin
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only admins can change the role field'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_role_escalation() IS
  'Blocks non-admin users from changing their own (or anyone''s) role via direct UPDATE.';

CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();
