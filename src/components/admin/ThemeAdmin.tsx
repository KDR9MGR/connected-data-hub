import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePageSection } from "@/lib/usePageContent";
import { HEADING_FONT_OPTIONS } from "@/components/ThemeStyle";
import { F } from "./formPrimitives";

export function ThemeAdmin() {
  const { content, isLoading } = usePageSection("global", "theme");
  const [accent, setAccent] = useState(content.accent_color);
  const [background, setBackground] = useState(content.background_color);
  const [font, setFont] = useState(content.heading_font);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setAccent(content.accent_color);
      setBackground(content.background_color);
      setFont(content.heading_font);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Live preview: apply pending values to the page immediately, revert on unmount
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sage", accent);
    root.style.setProperty("--cream", background);
    root.style.setProperty("--font-serif", `'${font}', ui-serif, Georgia, serif`);
    return () => {
      root.style.removeProperty("--sage");
      root.style.removeProperty("--cream");
      root.style.removeProperty("--font-serif");
    };
  }, [accent, background, font]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("page_content").upsert(
      {
        page: "global",
        section: "theme",
        content: { accent_color: accent, background_color: background, heading_font: font },
      },
      { onConflict: "page,section" },
    );
    setSaving(false);
    if (error) return alert(error.message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-stone rounded-3xl p-8 space-y-6 max-w-xl">
      <p className="text-xs text-ink/60">
        Changes preview live across the site (including this admin panel) as you edit. Nothing is
        public until you save.
      </p>
      <F label="Accent color (buttons, links, sage tones)">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="size-10 rounded cursor-pointer border border-sage/20"
          />
          <span className="text-sm font-mono">{accent}</span>
        </div>
      </F>
      <F label="Background color (page canvas)">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="size-10 rounded cursor-pointer border border-sage/20"
          />
          <span className="text-sm font-mono">{background}</span>
        </div>
      </F>
      <F label="Heading font">
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full bg-transparent border-b border-sage/20 py-2 text-sm focus:outline-none focus:border-sage"
        >
          {HEADING_FONT_OPTIONS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </F>
      <p className="font-serif text-3xl" style={{ fontFamily: `'${font}', serif` }}>
        Start caring for your health with us.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save theme"}
        </button>
        {saved && (
          <span className="text-[11px] uppercase tracking-[0.18em] text-sage">Saved ✓</span>
        )}
      </div>
    </div>
  );
}
