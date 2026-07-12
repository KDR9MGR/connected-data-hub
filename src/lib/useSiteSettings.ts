import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  site_title: string;
  site_description: string;
  hero_heading: string;
  hero_subheading: string;
  hero_image_url: string | null;
  about_body: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  whatsapp_number: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  seo_keywords: string | null;
  og_image_url: string | null;
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", "default").maybeSingle().then(({ data }) => {
      setSettings((data as SiteSettings) ?? null);
      setLoading(false);
    });
  }, []);
  return { settings, loading };
}