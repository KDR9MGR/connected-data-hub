
-- 1. Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Replace permissive contact_submissions INSERT policy with validated constraints
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR char_length(phone) <= 30)
  AND (subject IS NULL OR char_length(subject) <= 200)
  AND (disease IS NULL OR char_length(disease) <= 200)
  AND char_length(body) BETWEEN 10 AND 2000
  AND is_read = false
);

-- 3. Lock down has_role SECURITY DEFINER function - remove public/anon/authenticated EXECUTE.
-- RLS policies that invoke has_role will continue to work because policies run with
-- the definer's privileges regardless of the invoker's EXECUTE grant.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
