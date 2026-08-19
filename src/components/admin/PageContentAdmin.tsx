import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PAGE_CONTENT_SCHEMA, mergeWithDefaults, type Field } from "@/lib/pageContentSchema";
import { MediaPicker } from "./MediaPicker";
import { F, inp } from "./formPrimitives";

function get(obj: any, key: string) {
  return obj?.[key];
}
function set(obj: any, key: string, value: any) {
  return { ...obj, [key]: value };
}

function FieldEditor({ field, value, onChange, userId }: { field: Field; value: any; onChange: (v: any) => void; userId: string }) {
  switch (field.type) {
    case "text":
      return (
        <F label={field.label}>
          <input value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={inp} />
        </F>
      );
    case "textarea":
      return (
        <F label={field.label}>
          <textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inp} resize-none`} />
        </F>
      );
    case "image":
      return <MediaPicker userId={userId} label={field.label} value={value ?? ""} onChange={onChange} />;
    case "string-list": {
      const list: string[] = Array.isArray(value) ? value : [];
      return (
        <F label={field.label}>
          <div className="space-y-2">
            {list.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={v}
                  onChange={(e) => {
                    const next = [...list];
                    next[i] = e.target.value;
                    onChange(next);
                  }}
                  className={inp}
                />
                <button type="button" onClick={() => onChange(list.filter((_, idx) => idx !== i))} className="text-destructive text-xs">
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={() => onChange([...list, ""])} className="text-[11px] uppercase tracking-[0.18em] text-sage">
              + Add
            </button>
          </div>
        </F>
      );
    }
    case "list": {
      const list: any[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-[0.22em] font-semibold text-sage">{field.label}</label>
          <div className="space-y-4">
            {list.map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-cream border border-sage/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-ink/50">
                    {field.itemLabel} {i + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => {
                        const next = [...list];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        onChange(next);
                      }}
                      className="text-xs text-ink/50 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={i === list.length - 1}
                      onClick={() => {
                        const next = [...list];
                        [next[i + 1], next[i]] = [next[i], next[i + 1]];
                        onChange(next);
                      }}
                      className="text-xs text-ink/50 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(list.filter((_, idx) => idx !== i))}
                      className="text-[11px] uppercase tracking-[0.18em] text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {field.itemFields.map((sub) => (
                  <FieldEditor
                    key={sub.key}
                    field={sub}
                    value={get(item, sub.key)}
                    userId={userId}
                    onChange={(v) => {
                      const next = [...list];
                      next[i] = set(item, sub.key, v);
                      onChange(next);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange([...list, {}])}
            className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5"
          >
            + Add {field.itemLabel.toLowerCase()}
          </button>
        </div>
      );
    }
  }
}

function SectionEditor({ page, section, userId }: { page: string; section: string; userId: string }) {
  const schema = PAGE_CONTENT_SCHEMA[page][section];
  const [content, setContent] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContent(null);
    setSaved(false);
    supabase
      .from("page_content")
      .select("content")
      .eq("page", page)
      .eq("section", section)
      .maybeSingle()
      .then(({ data }) => setContent(mergeWithDefaults(page, section, data?.content as any)));
  }, [page, section]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("page_content").upsert({ page, section, content }, { onConflict: "page,section" });
    setSaving(false);
    if (error) return alert(error.message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!content) return <div className="text-ink/50 text-sm py-8">Loading…</div>;

  return (
    <div className="bg-stone rounded-3xl p-8 space-y-5">
      {schema.fields.map((field) => (
        <FieldEditor
          key={field.key}
          field={field}
          value={get(content, field.key)}
          userId={userId}
          onChange={(v) => setContent((c) => set(c, field.key, v))}
        />
      ))}
      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving} className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-[11px] uppercase tracking-[0.18em] text-sage">Saved ✓</span>}
      </div>
    </div>
  );
}

export function PageContentAdmin({ page, userId }: { page: string; userId: string }) {
  const sections = PAGE_CONTENT_SCHEMA[page];
  const keys = Object.keys(sections);
  const [active, setActive] = useState(keys[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.18em] ${active === k ? "bg-ink text-cream" : "bg-cream border border-sage/20 text-ink/60"}`}
          >
            {sections[k].label}
          </button>
        ))}
      </div>
      <SectionEditor page={page} section={active} userId={userId} />
    </div>
  );
}
