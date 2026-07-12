import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { F, inp } from "./formPrimitives";
import { MediaField } from "./MediaPicker";

type Settings = {
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

export function SettingsAdmin() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", "default").maybeSingle().then(({ data }) => setS(data as Settings));
  }, []);

  async function save() {
    if (!s) return;
    setSaving(true);
    const { id, ...rest } = s;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", "default");
    setSaving(false);
    if (error) return alert(error.message);
    alert("Settings saved.");
  }

  if (!s) return <div className="text-center text-ink/50 py-16 text-sm">Loading settings…</div>;
  const up = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  return (
    <div className="space-y-8">
      <Section title="Site identity">
        <F label="Site title"><input className={inp} value={s.site_title} onChange={(e) => up("site_title", e.target.value)} /></F>
        <F label="Meta description"><textarea rows={2} className={`${inp} resize-none`} value={s.site_description} onChange={(e) => up("site_description", e.target.value)} /></F>
        <F label="SEO keywords (comma separated)"><input className={inp} value={s.seo_keywords ?? ""} onChange={(e) => up("seo_keywords", e.target.value)} /></F>
        <MediaField label="OG / share image" value={s.og_image_url ?? ""} onChange={(v) => up("og_image_url", v)} />
      </Section>

      <Section title="Homepage hero">
        <F label="Heading"><input className={inp} value={s.hero_heading} onChange={(e) => up("hero_heading", e.target.value)} /></F>
        <F label="Subheading"><textarea rows={2} className={`${inp} resize-none`} value={s.hero_subheading} onChange={(e) => up("hero_subheading", e.target.value)} /></F>
        <MediaField label="Hero image" value={s.hero_image_url ?? ""} onChange={(v) => up("hero_image_url", v)} />
      </Section>

      <Section title="About">
        <F label="About body"><textarea rows={6} className={`${inp} resize-none`} value={s.about_body ?? ""} onChange={(e) => up("about_body", e.target.value)} /></F>
      </Section>

      <Section title="Contact">
        <div className="grid md:grid-cols-2 gap-5">
          <F label="Email"><input className={inp} value={s.contact_email ?? ""} onChange={(e) => up("contact_email", e.target.value)} /></F>
          <F label="Phone"><input className={inp} value={s.contact_phone ?? ""} onChange={(e) => up("contact_phone", e.target.value)} /></F>
          <F label="WhatsApp number"><input className={inp} value={s.whatsapp_number ?? ""} onChange={(e) => up("whatsapp_number", e.target.value)} placeholder="e.g. 919999999999" /></F>
          <F label="Address"><input className={inp} value={s.contact_address ?? ""} onChange={(e) => up("contact_address", e.target.value)} /></F>
        </div>
      </Section>

      <Section title="Social">
        <div className="grid md:grid-cols-3 gap-5">
          <F label="Instagram URL"><input className={inp} value={s.social_instagram ?? ""} onChange={(e) => up("social_instagram", e.target.value)} /></F>
          <F label="Facebook URL"><input className={inp} value={s.social_facebook ?? ""} onChange={(e) => up("social_facebook", e.target.value)} /></F>
          <F label="YouTube URL"><input className={inp} value={s.social_youtube ?? ""} onChange={(e) => up("social_youtube", e.target.value)} /></F>
        </div>
      </Section>

      <button disabled={saving} onClick={save} className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink disabled:opacity-50">{saving ? "Saving…" : "Save settings"}</button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-stone rounded-3xl p-8 space-y-5">
      <h3 className="font-serif text-2xl">{title}</h3>
      {children}
    </div>
  );
}