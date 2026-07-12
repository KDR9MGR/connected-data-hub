
-- has_role treats admin as superset of every role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR role = 'admin'::app_role)
  )
$$;

-- Admins manage roles
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_title TEXT NOT NULL DEFAULT 'Ayurveda Clinic',
  site_description TEXT NOT NULL DEFAULT 'Authentic Ayurvedic consultation and treatment.',
  hero_heading TEXT NOT NULL DEFAULT 'Rooted in tradition. Rooted in you.',
  hero_subheading TEXT NOT NULL DEFAULT 'Personalised Ayurvedic care for modern life.',
  hero_image_url TEXT,
  about_body TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_address TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  social_instagram TEXT DEFAULT '',
  social_facebook TEXT DEFAULT '',
  social_youtube TEXT DEFAULT '',
  seo_keywords TEXT DEFAULT '',
  og_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT only_default CHECK (id = 'default')
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads settings" ON public.site_settings;
CREATE POLICY "Anyone reads settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Editors update settings" ON public.site_settings;
CREATE POLICY "Editors update settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));
DROP POLICY IF EXISTS "Editors insert settings" ON public.site_settings;
CREATE POLICY "Editors insert settings" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));

DROP TRIGGER IF EXISTS site_settings_updated ON public.site_settings;
CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- Storage policies for the media bucket
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects FOR SELECT
  USING (bucket_id = 'media');
DROP POLICY IF EXISTS "Editors upload media" ON storage.objects;
CREATE POLICY "Editors upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'editor'::app_role));
DROP POLICY IF EXISTS "Editors update media" ON storage.objects;
CREATE POLICY "Editors update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'editor'::app_role));
DROP POLICY IF EXISTS "Editors delete media" ON storage.objects;
CREATE POLICY "Editors delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'editor'::app_role));
