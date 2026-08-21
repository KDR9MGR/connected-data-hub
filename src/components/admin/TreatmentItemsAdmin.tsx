import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { F, inp } from "./formPrimitives";
import { MediaPicker } from "./MediaPicker";
import { usePageSection } from "@/lib/usePageContent";

type T = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  body: string | null;
  pages: string[];
  media_url: string | null;
  is_published: boolean;
  sort_order: number;
};

const PAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "treatment", label: "Treatment" },
  { value: "diet-lifestyle", label: "Diet & Lifestyle" },
  { value: "disease-prevention", label: "Disease Prevention" },
];

export function TreatmentItemsAdmin({ userId }: { userId: string }) {
  const [items, setItems] = useState<T[]>([]);
  const [edit, setEdit] = useState<Partial<T> | null>(null);
  const { content: concerns } = usePageSection("global", "concerns");
  const categories: string[] = concerns.items ?? [];

  async function load() {
    const { data } = await supabase.from("treatment_items").select("*").order("sort_order");
    setItems((data as T[]) ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!edit) return;
    const payload = {
      title: edit.title ?? "",
      category: edit.category ?? null,
      description: edit.description ?? null,
      body: edit.body ?? null,
      pages: edit.pages ?? [],
      media_url: edit.media_url ?? null,
      is_published: edit.is_published ?? true,
      sort_order: edit.sort_order ?? 0,
    };
    const q = edit.id
      ? supabase.from("treatment_items").update(payload).eq("id", edit.id)
      : supabase.from("treatment_items").insert(payload);
    const { error } = await q;
    if (error) return alert(error.message);
    setEdit(null);
    load();
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("treatment_items").delete().eq("id", id);
    load();
  }

  function togglePage(page: string) {
    const current = edit?.pages ?? [];
    const next = current.includes(page) ? current.filter((p) => p !== page) : [...current, page];
    setEdit({ ...edit, pages: next });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setEdit({ pages: [], is_published: true, sort_order: 0 })}
          className="bg-sage text-cream px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.18em] hover:bg-ink"
        >
          + Add item
        </button>
      </div>
      {edit && (
        <div className="bg-stone rounded-3xl p-8 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl">{edit.id ? "Edit" : "New"} item</h3>
            <button
              onClick={() => setEdit(null)}
              className="text-[11px] uppercase tracking-[0.22em] text-ink/50"
            >
              Cancel
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <F label="Title">
              <input
                className={inp}
                value={edit.title ?? ""}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </F>
            <F label="Category">
              <input
                className={inp}
                list="concern-categories"
                value={edit.category ?? ""}
                onChange={(e) => setEdit({ ...edit, category: e.target.value })}
              />
              <datalist id="concern-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </F>
          </div>
          <F label="Short description">
            <textarea
              rows={2}
              className={`${inp} resize-none`}
              value={edit.description ?? ""}
              onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            />
          </F>
          <F label="Full body (optional, for detail views)">
            <textarea
              rows={5}
              className={`${inp} resize-none`}
              value={edit.body ?? ""}
              onChange={(e) => setEdit({ ...edit, body: e.target.value })}
            />
          </F>
          <MediaPicker
            userId={userId}
            label="Media (image, video, or YouTube link)"
            value={edit.media_url ?? ""}
            onChange={(url) => setEdit({ ...edit, media_url: url })}
          />
          <F label="Appears on">
            <div className="flex flex-wrap gap-2">
              {PAGE_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePage(p.value)}
                  className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] ${(edit.pages ?? []).includes(p.value) ? "bg-sage text-cream" : "bg-cream border border-sage/20 text-ink/60"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </F>
          <div className="grid md:grid-cols-2 gap-5">
            <F label="Sort order">
              <input
                type="number"
                className={inp}
                value={edit.sort_order ?? 0}
                onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })}
              />
            </F>
            <label className="flex items-center gap-2 text-xs text-ink/70 mt-6">
              <input
                type="checkbox"
                checked={edit.is_published ?? true}
                onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })}
              />{" "}
              Published
            </label>
          </div>
          <button
            onClick={save}
            className="bg-sage text-cream px-8 py-3 rounded-full text-[11px] uppercase tracking-[0.22em] hover:bg-ink"
          >
            Save
          </button>
        </div>
      )}
      <div className="grid gap-3">
        {items.map((t) => (
          <div key={t.id} className="bg-stone rounded-2xl p-5 flex flex-wrap justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/50 mb-1">
                {t.pages
                  .map((p) => PAGE_OPTIONS.find((o) => o.value === p)?.label ?? p)
                  .join(", ") || "unassigned"}{" "}
                · {t.is_published ? "published" : "hidden"}
              </div>
              <div className="font-serif">{t.title}</div>
              <div className="text-sm text-ink/60 line-clamp-2">{t.description}</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEdit(t)}
                className="text-[11px] uppercase tracking-[0.18em] text-sage border-b border-sage/40 pb-0.5"
              >
                Edit
              </button>
              <button
                onClick={() => del(t.id)}
                className="text-[11px] uppercase tracking-[0.18em] text-destructive border-b border-destructive/40 pb-0.5"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-ink/50 py-16 border border-dashed border-sage/20 rounded-2xl text-sm">
            No items yet.
          </div>
        )}
      </div>
    </div>
  );
}
